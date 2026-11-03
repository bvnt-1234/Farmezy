import { useCallback, useEffect, useMemo, useState } from "react"
import agmarknetCatalogue from "../../backend/data/agmarknet-catalogue.json"
import {
  resolveVarietyImage,
  resolveCommodityImage,
  getCategorySvgDataUri,
  getCommoditySymbol,
  categoryFallbackImages
} from "./cropImageCatalog.js"

const states = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir",
  "Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal"
]

const fallbackCategories = [
  "Vegetables", "Fruits", "Flowers", "Others", "Forest Products",
  "Drug and Narcotics", "Pulses", "Cereals", "Spices",
  "Medicinal and Aromatic Plants", "Oil Seeds", "Live Stock,Poultry,Fisheries",
  "Dry Fruits", "Oils and Fats", "Fibre Crops", "Beverages"
]

export default function OfficialPrices({ location, preview = false, onViewAll }) {
  const defaultState = "All India"
  const defaultDistrict = ""

  const [filters, setFilters] = useState(() => ({
    commodity: "",
    variety: "",
    query: "",
    category: "",
    state: defaultState,
    district: defaultDistrict,
    market: ""
  }))
  const [applied, setApplied] = useState(() => ({
    commodity: "",
    variety: "",
    query: "",
    category: "",
    state: defaultState,
    district: defaultDistrict,
    market: ""
  }))

  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(null)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stateFallback, setStateFallback] = useState(false)
  const [sessionFallback, setSessionFallback] = useState(false)
  const [sessionDate, setSessionDate] = useState("")
  const [isLive, setIsLive] = useState(true)
  const [sourceInfo, setSourceInfo] = useState("")
  const [dataSource, setDataSource] = useState(null)
  const [commodityOptions, setCommodityOptions] = useState(() => {
    if (Array.isArray(agmarknetCatalogue?.commodities)) {
      return agmarknetCatalogue.commodities.map(c => ({
        name: c.name,
        category: c.category || c.group_name || "Others",
        group_name: c.group_name || c.category || "Others",
        id: c.id
      }))
    }
    return []
  })
  const [categories, setCategories] = useState(fallbackCategories)
  const [varieties, setVarieties] = useState([])
  const [varietySearch, setVarietySearch] = useState("")
  const [cropImages, setCropImages] = useState({})
  const [cardViewMode, setCardViewMode] = useState("varieties")
  const [cardLimit, setCardLimit] = useState(60)
  const [globalPriceMap, setGlobalPriceMap] = useState({})
  const [globalCommodityPriceMap, setGlobalCommodityPriceMap] = useState({})

  // Update filters if location changes on profile
  useEffect(() => {
    if (location?.state && (!applied.state || applied.state === "Karnataka")) {
      setFilters(prev => ({ ...prev, state: location.state, district: location.district || prev.district }))
      setApplied(prev => ({ ...prev, state: location.state, district: location.district || prev.district }))
    }
  }, [location?.state, location?.district, applied.state])

  const fetchPage = useCallback(async (nextOffset, append) => {
    setLoading(true)
    setError("")
    if (!append) {
      setStateFallback(false)
      setSessionFallback(false)
    }
    try {
      const params = new URLSearchParams({ limit: "150", offset: String(nextOffset) })
      if (applied.state && applied.state !== "All India") params.set("state", applied.state.trim())
      if (applied.district) params.set("district", applied.district.trim())
      if (applied.commodity) params.set("commodity", applied.commodity.trim())
      if (applied.variety) params.set("variety", applied.variety.trim())
      if (applied.query) params.set("q", applied.query.trim())
      if (applied.category) params.set("category", applied.category)
      if (applied.market) params.set("market", applied.market.trim())

      let response = await fetch("/api/mandi-prices?" + params.toString())
      let payload = await readPriceResponse(response)
      let rows = Array.isArray(payload.records) ? payload.records : []

      if (payload.district_fallback) {
        setStateFallback(true)
      }
      if (payload.session_fallback) {
        setSessionFallback(true)
        setSessionDate(payload.session_date || "")
      }
      setIsLive(payload.live !== false)
      setSourceInfo(payload.source || "")
      if (!response.ok) {
        throw new Error(payload.error || "The Government market-price service is unavailable.")
      }

      setRecords(current => append ? [...current, ...rows] : rows)
      setTotal(Number(payload.total ?? payload.total_count ?? rows.length))
      setDataSource({ live: payload.live !== false, source: payload.source || "Source: Government of India — AGMARKNET" })
      if (payload.price_map && typeof payload.price_map === "object") {
        setGlobalPriceMap(prev => append ? ({ ...prev, ...payload.price_map }) : payload.price_map)
      } else if (!append) {
        setGlobalPriceMap({})
      }
      if (payload.commodity_price_map && typeof payload.commodity_price_map === "object") {
        setGlobalCommodityPriceMap(prev => append ? ({ ...prev, ...payload.commodity_price_map }) : payload.commodity_price_map)
      } else if (!append) {
        setGlobalCommodityPriceMap({})
      }
      if (Array.isArray(payload.commodity_options) && payload.commodity_options.length > 0) {
        setCommodityOptions(payload.commodity_options)
      }
      if (Array.isArray(payload.categories) && payload.categories.length > 0) {
        setCategories(payload.categories)
      }
      setOffset(nextOffset + rows.length)
    } catch (err) {
      setError(err.message || "Could not load official mandi prices.")
      if (!append) { setRecords([]); setTotal(null) }
    } finally {
      setLoading(false)
    }
  }, [applied])

  useEffect(() => {
    fetchPage(0, false)
  }, [fetchPage])

  useEffect(() => {
    const params = new URLSearchParams()
    if (applied.category) params.set("category", applied.category)
    const controller = new AbortController()
    fetch("/api/commodities?" + params, { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (!payload || controller.signal.aborted) return
        if (Array.isArray(payload.commodities) && payload.commodities.length > 0) {
          setCommodityOptions(payload.commodities)
        }
        if (Array.isArray(payload.categories) && payload.categories.length > 0) {
          setCategories(payload.categories)
        }
      })
      .catch(error => { if (error.name !== "AbortError") {} })
    return () => controller.abort()
  }, [applied.category])

  useEffect(() => {
    const comm = (filters.commodity || "").trim()
    if (preview || comm.length < 2) {
      setVarieties([])
      setVarietySearch("")
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({ commodity: comm })
      try {
        const response = await fetch("/api/varieties?" + params, { signal: controller.signal })
        const payload = response.ok ? await response.json() : null
        if (payload && !controller.signal.aborted) {
          const names = Array.isArray(payload.varieties)
            ? payload.varieties.map(item => typeof item === "string" ? item : (item.name || item.variety_name))
            : (Array.isArray(payload.variety_names) ? payload.variety_names : [])
          const uniqueNames = [...new Set(names.map(n => String(n).trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
          setVarieties(uniqueNames)
        }
      } catch (error) {
        if (error.name !== "AbortError") setVarieties([])
      }
    }, 100)
    return () => { clearTimeout(timer); controller.abort() }
  }, [preview, filters.commodity])

  // Active commodities based on applied category, commodity, and search
  const activeCommodities = useMemo(() => {
    const list = Array.isArray(agmarknetCatalogue?.commodities) ? agmarknetCatalogue.commodities : []
    return list.filter(c => {
      const cat = c.category || c.group_name || "Others"
      if (applied.category && cat !== applied.category) return false
      if (applied.commodity && String(c.name || "").toLowerCase() !== applied.commodity.toLowerCase()) return false
      if (applied.query) {
        const q = applied.query.toLowerCase().replace(/[^a-z0-9]/g, "")
        const cMatch = (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)
        const vMatch = (c.variety_names || []).some(v => String(v).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q))
        if (!cMatch && !vMatch) return false
      }
      return true
    })
  }, [applied.category, applied.commodity, applied.query])

  // Complete official AGMARKNET commodity-variety catalog items
  const catalogVarietyItems = useMemo(() => {
    const items = []
    const seenIdentities = new Set()
    activeCommodities.forEach(c => {
      const vNames = c.variety_names || (c.varieties || []).map(v => typeof v === "string" ? v : (v.name || v.variety_name))
      const cat = c.category || c.group_name || "Others"
      const cleanVNames = [...new Set((vNames || []).map(n => String(n || "").trim()).filter(Boolean))]
      cleanVNames.forEach(vName => {
        if (applied.variety && vName.toLowerCase() !== applied.variety.toLowerCase()) return
        if (applied.query) {
          const q = applied.query.toLowerCase().replace(/[^a-z0-9]/g, "")
          const cMatch = (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)
          const vMatch = vName.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)
          if (!cMatch && !vMatch) return
        }
        const identity = `${cat}:::${c.name}:::${vName}`
        if (seenIdentities.has(identity)) return
        seenIdentities.add(identity)

        items.push({
          id: `${c.id || c.name}-${vName}`,
          identity,
          commodity: c.name,
          variety: vName,
          category: cat,
          grades: c.grades || [],
          arrival_unit: c.arrival_unit || "Quintal",
          price_unit: c.price_unit || "Quintal"
        })
      })
    })
    return items
  }, [activeCommodities, applied.variety, applied.query])

  // Fast normalized price lookup from reported records
  const priceLookup = useMemo(() => {
    const map = new Map()
    records.forEach(r => {
      const c = String(r.commodity || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      const v = String(r.variety || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      if (c && v && !map.has(c + "::" + v)) {
        map.set(c + "::" + v, r)
      }
      if (c && !map.has(c)) {
        map.set(c, r)
      }
    })
    return map
  }, [records])

  function findPrice(commName, varName) {
    const c = String(commName || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const v = String(varName || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    if (c && v) {
      const key = `${c}::${v}`
      if (globalPriceMap[key]) return globalPriceMap[key]
      if (priceLookup.has(key)) return priceLookup.get(key)
      return null
    }
    if (c) {
      if (globalCommodityPriceMap[c]) return globalCommodityPriceMap[c]
      if (priceLookup.has(c)) return priceLookup.get(c)
    }
    return null
  }

  // Display items from the complete official AGMARKNET catalogue
  const activeItems = (cardViewMode === "commodities" && !applied.variety)
    ? activeCommodities
    : catalogVarietyItems

  const totalItemsToDisplay = activeItems.length

  const effectiveLimit = preview
    ? 8
    : (applied.category || applied.commodity || applied.variety || applied.query)
      ? 5000
      : cardLimit

  const displayedItems = activeItems.slice(0, effectiveLimit)

  function submit(e) {
    e.preventDefault()
    setApplied({ ...filters })
    setOffset(0)
  }

  function filterByCrop(cropName) {
    setFilters(prev => ({ ...prev, commodity: cropName, variety: "" }))
    setApplied(prev => ({ ...prev, commodity: cropName, variety: "" }))
    setCardViewMode("varieties")
    setVarietySearch("")
    setOffset(0)
  }

  function clearCropFilter() {
    setFilters(prev => ({ ...prev, commodity: "", variety: "" }))
    setApplied(prev => ({ ...prev, commodity: "", variety: "" }))
    setVarietySearch("")
    setOffset(0)
  }

  function handleVarietyCardClick(item) {
    if (preview) {
      if (onViewAll) onViewAll(item.commodity)
    } else {
      setFilters(prev => ({ ...prev, commodity: item.commodity, variety: item.variety }))
      setApplied(prev => ({ ...prev, commodity: item.commodity, variety: item.variety }))
      setCardViewMode("varieties")
      setVarietySearch("")
      setOffset(0)
    }
  }

  function handleCommodityCardClick(commName) {
    if (preview) {
      if (onViewAll) onViewAll(commName)
    } else {
      filterByCrop(commName)
    }
  }

  const filteredCommodities = commodityOptions.filter(item => {
    if (!filters.category) return true
    return item.category === filters.category || item.group_name === filters.category
  })

  const displayedVarieties = varieties.filter(name => {
    if (!varietySearch.trim()) return true
    const q = varietySearch.toLowerCase().replace(/[^a-z0-9]/g, "")
    return name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)
  })

  return (
    <div className="official-prices">
      <div className="official-heading">
        <div>
          <div className="eyebrow">{preview ? "OFFICIAL PRICES NEAR YOU" : "GOVERNMENT MARKET DATA"}</div>
          <h1>{preview ? "Prices near " + (location?.district || location?.location || "you") : "Official mandi prices."}</h1>
          <p>
            {isLive ? "Daily wholesale prices reported by AGMARKNET today for all vegetables and crops across " : "Wholesale market prices from latest APMC trading session for "}
            <b>{applied.district ? applied.district + ", " : ""}{applied.state}</b>.
          </p>
        </div>
        <span className="official-badge" style={!isLive ? { borderColor: "#fde047", color: "#854d0e", background: "#fefce8" } : {}}>
          <i style={{ background: isLive ? "#22c55e" : "#eab308" }} />
          {isLive ? "Source: Government of India — AGMARKNET (Live)" : "Source: Government of India — AGMARKNET"}
        </span>
      </div>

      {!preview && (
        <form className="official-filters" onSubmit={submit}>
          <label>
            Category
            <select
              value={filters.category}
              onChange={e => {
                const newCat = e.target.value
                setFilters(prev => ({ ...prev, category: newCat, commodity: "", variety: "" }))
                setVarietySearch("")
              }}
            >
              <option value="">All categories (16 groups)</option>
              {categories.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label>
            Commodity {filteredCommodities.length > 0 ? `(${filteredCommodities.length}${filters.category ? ` in ${filters.category}` : ""})` : ""}
            <select
              value={filters.commodity}
              onChange={e => {
                const newComm = e.target.value
                setFilters(prev => ({ ...prev, commodity: newComm, variety: "" }))
                setVarietySearch("")
              }}
            >
              <option value="">
                {filters.category
                  ? `All ${filters.category} (${filteredCommodities.length})`
                  : `All commodities (609 official)`}
              </option>
              {filteredCommodities.map(item => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Variety {varieties.length > 0 ? `(${varieties.length} registered)` : ""}</span>
              {filters.variety && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, variety: "" }))}
                  style={{ border: 0, background: "none", color: "#34794b", cursor: "pointer", fontSize: 9, padding: 0, textDecoration: "underline" }}
                >
                  Clear
                </button>
              )}
            </div>
            {filters.commodity && varieties.length > 5 && (
              <input
                type="text"
                value={varietySearch}
                onChange={e => setVarietySearch(e.target.value)}
                placeholder={`Search among ${varieties.length} varieties...`}
                style={{ marginBottom: 4 }}
                title="Type to quickly filter the variety list below"
              />
            )}
            <select
              value={filters.variety}
              onChange={e => setFilters(prev => ({ ...prev, variety: e.target.value }))}
              disabled={!filters.commodity}
            >
              <option value="">
                {!filters.commodity
                  ? "Select a commodity first"
                  : displayedVarieties.length > 0
                    ? (varietySearch
                        ? `All matching varieties (${displayedVarieties.length} of ${varieties.length})`
                        : `All varieties (${varieties.length} Government registered)`)
                    : (varietySearch
                        ? `No varieties match "${varietySearch}"`
                        : "All varieties (none registered)")}
              </option>
              {displayedVarieties.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
              {filters.variety && !displayedVarieties.includes(filters.variety) && (
                <option value={filters.variety}>
                  {filters.variety} (selected)
                </option>
              )}
            </select>
          </label>
          <label>
            Free-text search
            <input
              value={filters.query}
              onChange={e => setFilters({ ...filters, query: e.target.value })}
              placeholder="Commodity, variety, market..."
            />
          </label>
          <label>
            State / UT
            <select value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })}>
            <option value="All India">All India</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>
            District
            <input
              value={filters.district}
              onChange={e => setFilters({ ...filters, district: e.target.value })}
              placeholder="All districts (e.g. Bengaluru)"
            />
          </label>
          <label>
            Mandi
            <input
              value={filters.market}
              onChange={e => setFilters({ ...filters, market: e.target.value })}
              placeholder="All mandis"
            />
          </label>
          <button type="submit" disabled={loading}>{loading ? "Loading…" : "Apply filters"}</button>
        </form>
      )}

      <div className="official-result-bar">
        <div>
          <b>
            {preview
              ? "Latest reported commodity prices"
              : (total === null ? "" : total.toLocaleString("en-IN") + " reported records")}
          </b>
          <span>
            {applied.state || "All India"}
            {applied.district ? " · " + applied.district : ""}
            {applied.market ? " · " + applied.market : ""}
            {applied.commodity ? (
              <>
                {" · "}
                <b>{applied.commodity}</b>{" "}
                <button
                  type="button"
                  onClick={clearCropFilter}
                  style={{ border: 0, background: "none", color: "#377b4a", cursor: "pointer", textDecoration: "underline", fontSize: 10, padding: 0 }}
                >
                  (show all commodities)
                </button>
              </>
            ) : " · All commodities"}
          </span>
        </div>
        {dataSource && (
          <span className={dataSource.live ? "live" : "sample"} title={dataSource.source}>
            {dataSource.live ? `LIVE · ${dataSource.source}` : dataSource.source}
          </span>
        )}
        {!preview && (
          <button onClick={() => fetchPage(0, false)} disabled={loading}>
            ↻ Refresh
          </button>
        )}
      </div>

      {sessionFallback && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", margin: "14px 0", fontSize: "13px", color: "#166534" }}>
          <b>🕒 Latest Confirmed APMC Session Rates ({sessionDate || "Current"})</b>
          <p style={{ margin: "4px 0 0 0", color: "#15803d" }}>
            Mandis in {applied.state} publish daily morning auction sheets by 11:30 AM. Currently displaying confirmed wholesale APMC rates.
          </p>
        </div>
      )}

      {error && (
        <div className="official-error">
          <b>Prices could not be loaded.</b>
          <p>{error}</p>
          <span>Start the API server or check network connection. This page connects to the official Government AGMARKNET feed.</span>
        </div>
      )}

      {/* Visual Commodity & Variety Representation (Completely Independent of Price Availability) */}
      <section className="catalogue-cards-section" style={{ margin: "20px 0" }}>
        <div className="catalogue-cards-header">
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", color: "#253b2a", fontWeight: "700" }}>
              {preview
                ? "Official Produce Prices & Variety Directory"
                : applied.variety
                  ? `Official Catalogue: ${applied.variety} · ${applied.commodity}`
                  : applied.commodity
                    ? `Registered Varieties for ${applied.commodity} (${catalogVarietyItems.length} official ${catalogVarietyItems.length === 1 ? "variety" : "varieties"})`
                    : applied.category
                      ? `Official Catalogue — ${applied.category} (${catalogVarietyItems.length} varieties across ${activeCommodities.length} commodities)`
                      : cardViewMode === "commodities"
                        ? `Official AGMARKNET Commodities (${activeCommodities.length} commodities)`
                        : `Official AGMARKNET Varieties (${catalogVarietyItems.length} registered varieties)`
              }
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#617163" }}>
              {preview
                ? "Representative images and live APMC mandi prices for all registered produce."
                : applied.variety
                  ? `Showing official AGMARKNET catalogue and market prices for ${applied.commodity} → ${applied.variety}.`
                  : `Showing ${displayedItems.length} of ${totalItemsToDisplay} official ${cardViewMode === "commodities" ? "commodities" : "registered varieties"}. All 609 official commodities & 3,071 registered varieties maintained across 16 categories.`}
            </p>
            {applied.variety && (
              <button
                type="button"
                onClick={() => {
                  setFilters(prev => ({ ...prev, variety: "" }))
                  setApplied(prev => ({ ...prev, variety: "" }))
                }}
                style={{
                  marginTop: "6px",
                  border: "1px solid #bbf7d0",
                  background: "#f0fdf4",
                  color: "#166534",
                  padding: "4px 10px",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                ← Show all varieties of {applied.commodity}
              </button>
            )}
          </div>
          {!preview && (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setCardViewMode("varieties")}
                style={{
                  border: "1px solid",
                  borderColor: cardViewMode === "varieties" ? "#34794b" : "#d7dfd5",
                  background: cardViewMode === "varieties" ? "#34794b" : "#fff",
                  color: cardViewMode === "varieties" ? "#fff" : "#495b4c",
                  padding: "5px 12px",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                By Variety ({catalogVarietyItems.length})
              </button>
              <button
                type="button"
                onClick={() => setCardViewMode("commodities")}
                style={{
                  border: "1px solid",
                  borderColor: cardViewMode === "commodities" ? "#34794b" : "#d7dfd5",
                  background: cardViewMode === "commodities" ? "#34794b" : "#fff",
                  color: cardViewMode === "commodities" ? "#fff" : "#495b4c",
                  padding: "5px 12px",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                By Commodity ({activeCommodities.length})
              </button>
            </div>
          )}
        </div>

        <div className="crop-price-cards">
          {displayedItems.map(item => {
            const isVariety = Boolean(item.variety)
            const imgInfo = isVariety
              ? resolveVarietyImage(item.commodity, item.variety, item.category)
              : resolveCommodityImage(item.name || item.commodity, item.category || item.group_name)

            const priceRecord = isVariety
              ? findPrice(item.commodity, item.variety)
              : findPrice(item.name || item.commodity, "")

            const title = isVariety ? item.variety : (item.name || item.commodity)
            const regVarCount = isVariety ? 0 : (item.variety_names || item.varieties || []).length
            const subTitle = isVariety ? item.commodity : `${regVarCount} registered ${regVarCount === 1 ? "variety" : "varieties"}`
            const categoryName = item.category || item.group_name || "Others"

            const cardKey = isVariety
              ? `${item.category}-${item.commodity}-${item.variety}`
              : `${item.category || item.group_name || "Others"}-${item.name || item.commodity}`

            return (
              <article
                className="crop-price-card"
                key={cardKey}
                onClick={() => {
                  if (isVariety) {
                    handleVarietyCardClick(item)
                  } else {
                    handleCommodityCardClick(item.name || item.commodity)
                  }
                }}
                style={{ cursor: "pointer" }}
                title={isVariety ? `Click to filter records for ${item.commodity} - ${item.variety}` : `Click to view varieties of ${item.name || item.commodity}`}
              >
                <div className="crop-photo">
                  <img
                    src={imgInfo.url}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    onError={event => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = getCategorySvgDataUri(categoryName, isVariety ? `${item.commodity} (${item.variety})` : (item.name || item.commodity))
                    }}
                  />
                  <span className="crop-symbol">{imgInfo.symbol}</span>
                  <span className={imgInfo.isExact ? "crop-img-tag exact-tag" : "crop-img-tag rep-tag"}>
                    {imgInfo.isExact ? "Exact Match" : "Representative Image"}
                  </span>
                </div>
                <div className="crop-card-copy">
                  <small className="crop-category-tag">{categoryName} · AGMARKNET</small>
                  <b>{title}</b>
                  <span className="crop-commodity-sub">{subTitle}</span>
                  {priceRecord ? (
                    <div className="crop-price-info">
                      <span>Modal <strong>{money(priceRecord.modal_price)}</strong> / quintal</span>
                      <small>Min: {money(priceRecord.min_price)} · Max: {money(priceRecord.max_price)}</small>
                      <small>{priceRecord.market || "Mandi"} · {priceRecord.state}{priceRecord.arrival_date ? " · " + priceRecord.arrival_date : ""}</small>
                    </div>
                  ) : (
                    <div className="crop-no-price">
                      <span className="no-price-msg">No current AGMARKNET mandi price available.</span>
                      <small style={{ color: "#9ca3af", fontSize: "8px" }}>Registered in Official Catalogue</small>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Load More / Show All Controls */}
        {!preview && totalItemsToDisplay > displayedItems.length && (
          <div className="crop-show-more-bar">
            <button
              type="button"
              className="crop-show-more-btn"
              onClick={() => setCardLimit(prev => prev + 96)}
            >
              Load more (+96 {cardViewMode === "commodities" ? "commodities" : "varieties"})
            </button>
            <button
              type="button"
              className="crop-show-more-btn"
              style={{ background: "#2b633b", color: "#fff" }}
              onClick={() => setCardLimit(5000)}
            >
              Show all {totalItemsToDisplay} {cardViewMode === "commodities" ? "commodities" : "varieties"}
            </button>
          </div>
        )}

        {activeItems.length === 0 && !loading && (
          <div className="crop-no-active-records" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "24px 16px", textAlign: "center", color: "#64748b", margin: "16px 0" }}>
            <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#334155" }}>
              No active mandi trades reported for the selected filters today.
            </p>
            <small style={{ display: "block", marginTop: "6px", fontSize: "12px", color: "#64748b" }}>
              All 609 official commodities and 3,071 registered varieties remain available in the official catalogue and farmer listings.
            </small>
          </div>
        )}

        {preview && onViewAll && (
          <button className="crop-card-more" onClick={onViewAll} style={{ width: "100%", marginTop: "8px" }}>
            View all current market prices &amp; full AGMARKNET directory →
          </button>
        )}
      </section>

      {!preview && !error && (
        <div className="official-table-wrap">
          <table className="official-table" style={{ minWidth: 1180 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Commodity</th>
                <th>Variety</th>
                <th>Grade</th>
                <th>State</th>
                <th>District</th>
                <th>Market / APMC</th>
                <th>Min ₹/quintal</th>
                <th>Max ₹/quintal</th>
                <th>Modal ₹/quintal</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={[r.state, r.district, r.market, r.commodity, r.arrival_date, i].join("-")}>
                  <td>{r.arrival_date || "—"}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span>{cropSymbol(r.commodity)}</span>
                      <b>{r.commodity || "—"}</b>
                    </span>
                  </td>
                  <td>{r.variety || "—"}</td>
                  <td>{r.grade || "—"}</td>
                  <td>{r.state || "—"}</td>
                  <td>{r.district || "—"}</td>
                  <td>{r.market || "—"}</td>
                  <td>{money(r.min_price)}</td>
                  <td>{money(r.max_price)}</td>
                  <td className="modal-price">{money(r.modal_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!records.length && !loading && !error && (
            <div className="official-empty">
              No current AGMARKNET mandi price available.
            </div>
          )}
        </div>
      )}

      {!preview && records.length > 0 && (total === null || offset < total) && (
        <button className="official-more" onClick={() => fetchPage(offset, true)} disabled={loading}>
          {loading ? "Loading…" : "Load more official records"}
        </button>
      )}

      <p className="official-source">
        Source:{" "}
        <a href="https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi" target="_blank" rel="noreferrer">
          Government of India — AGMARKNET (Ministry of Agriculture & Farmers Welfare · data.gov.in) ↗
        </a>{" "}
        · Reported daily; wholesale rates are ₹ per quintal.
      </p>
    </div>
  )
}

function cropSymbol(name) {
  return getCommoditySymbol(name)
}

function cropPhoto(name) {
  return resolveCommodityImage(name).url
}

function money(value) {
  if (value == null || String(value).trim() === "") return "—"
  const amount = Number(String(value).replace(/,/g, ""))
  return Number.isFinite(amount) ? "₹" + amount.toLocaleString("en-IN") : String(value)
}

async function readPriceResponse(response) {
  const body = await response.text()
  if (!body.trim()) {
    throw new Error("The local price API did not respond. Check backend server and refresh.")
  }
  try {
    return JSON.parse(body)
  } catch {
    throw new Error("The local price API returned an invalid response. Restart with npm run dev and refresh.")
  }
}
