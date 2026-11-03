import { useCallback, useEffect, useState } from "react"
import agmarknetCatalogue from "../../backend/data/agmarknet-catalogue.json"

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
      setDataSource({ live: payload.live !== false, source: payload.source || "AGMARKNET · Government of India" })
      if (Array.isArray(payload.commodity_options) && payload.commodity_options.length > 0) {
        setCommodityOptions(payload.commodity_options)
      }
      if (Array.isArray(payload.categories) && payload.categories.length > 0) {
        setCategories(payload.categories)
      }
      // CRITICAL: We NEVER overwrite `varieties` with today's observed mandi rows here!
      // The complete Government Variety Master for the selected commodity is managed exclusively
      // by the commodity selection effect to guarantee all registered varieties remain visible.
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

  // Distinct crop cards to showcase vegetables with photos & modal rates
  const cropCards = [...new Map(records.filter(r => r.commodity).map(r => [r.commodity, r])).values()].slice(0, 8)
  const cropNames = cropCards.map(record => record.commodity).join(",")

  useEffect(() => {
    if (!cropNames) return
    let cancelled = false
    fetch("/api/crop-images?crops=" + encodeURIComponent(cropNames))
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (!cancelled && payload?.images) setCropImages(payload.images)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [cropNames])

  function submit(e) {
    e.preventDefault()
    setApplied({ ...filters })
    setOffset(0)
  }

  function filterByCrop(cropName) {
    setFilters(prev => ({ ...prev, commodity: cropName, variety: "" }))
    setApplied(prev => ({ ...prev, commodity: cropName, variety: "" }))
    setVarietySearch("")
    setOffset(0)
  }

  function clearCropFilter() {
    setFilters(prev => ({ ...prev, commodity: "", variety: "" }))
    setApplied(prev => ({ ...prev, commodity: "", variety: "" }))
    setVarietySearch("")
    setOffset(0)
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
          {isLive ? "GOVERNMENT OF INDIA · LIVE" : "AGMARKNET · RECENT SESSION"}
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

      {false && (
        <p className="official-fallback">
          ⓘ Showing official prices from across {applied.state}. (No specific records reported today for {applied.district} mandi).
        </p>
      )}

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

      {!error && records.length > 0 && (
        <section className="crop-price-cards">
          {cropCards.map(r => {
            const image = cropImages[r.commodity]
            return (
              <article
                className="crop-price-card"
                key={r.commodity}
                onClick={() => {
                  if (preview) {
                    if (onViewAll) onViewAll(r.commodity)
                  } else {
                    filterByCrop(r.commodity)
                  }
                }}
                style={{ cursor: "pointer" }}
                title={preview ? `View official prices for ${r.commodity}` : `Click to view all records for ${r.commodity}`}
              >
                <div className="crop-photo">
                  <img
                    src={cropPhoto(r.commodity)}
                    alt={r.commodity}
                    onError={event => {
                      if (event.currentTarget.src !== genericCropImage) {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = genericCropImage;
                      }
                    }}
                  />
                  <span>{cropSymbol(r.commodity)}</span>
                </div>
                <div className="crop-card-copy">
                  <small>{r.market || "Reported mandi"}</small>
                  <b>{r.commodity}</b>
                  <span>Modal <strong>{money(r.modal_price)}</strong> / quintal</span>
                  <small>{r.district ? r.district + ", " : ""}{r.state}{r.arrival_date ? " · " + r.arrival_date : ""}</small>
                  {image && (
                    <a className="image-credit" href={image.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                      Image: {image.photographer}
                    </a>
                  )}
                </div>
              </article>
            )
          })}
          {preview && onViewAll && (
            <button className="crop-card-more" onClick={onViewAll}>
              View all commodity prices →
            </button>
          )}
        </section>
      )}

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
              No current AGMARKNET price available.
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
          Ministry of Agriculture & Farmers Welfare · AGMARKNET on data.gov.in ↗
        </a>{" "}
        · Reported daily; wholesale rates are ₹ per quintal.
      </p>
    </div>
  )
}

function cropSymbol(name) {
  const n = String(name || "").toLowerCase()
  if (n.includes("ginger")) return "🫚"
  if (n.includes("lady") || n.includes("ladies") || n.includes("okra") || n.includes("bhindi")) return "🫛"
  if (n.includes("garlic")) return "🧄"
  if (n.includes("tomato")) return "🍅"
  if (n.includes("onion")) return "🧅"
  if (n.includes("potato")) return "🥔"
  if (n.includes("chilli") || n.includes("chili") || n.includes("mirchi")) return "🌶️"
  if (n.includes("capsicum")) return "🫑"
  if (n.includes("carrot")) return "🥕"
  if (n.includes("cucumber") || n.includes("kheera")) return "🥒"
  if (n.includes("cabbage")) return "🥬"
  if (n.includes("spinach") || n.includes("palak")) return "🥬"
  if (n.includes("cauliflower") || n.includes("kohl") || n.includes("gobi")) return "🥦"
  if (n.includes("broccoli")) return "🥦"
  if (n.includes("drumstick") || n.includes("moringa")) return "🌿"
  if (n.includes("coriander") || n.includes("mint") || n.includes("methi")) return "🌿"
  if (n.includes("brinjal") || n.includes("eggplant") || n.includes("baingan")) return "🍆"
  if (n.includes("pea")) return "🫛"
  if (n.includes("corn") || n.includes("maize")) return "🌽"
  if (n.includes("banana")) return "🍌"
  if (n.includes("apple")) return "🍎"
  if (n.includes("mango")) return "🥭"
  if (n.includes("lemon") || n.includes("lime") || n.includes("nimbu")) return "🍋"
  if (n.includes("grape")) return "🍇"
  if (n.includes("pumpkin")) return "🎃"
  if (n.includes("watermelon")) return "🍉"
  if (n.includes("papaya")) return "🍈"
  if (n.includes("coconut")) return "🥥"
  if (n.includes("rice") || n.includes("paddy") || n.includes("wheat") || n.includes("ragi") || n.includes("jowar")) return "🌾"
  if (n.includes("thogari") || n.includes("thogri") || n.includes("cluster") || n.includes("guar") || n.includes("gorika")) return "🫛"
  if (n.includes("knol") || n.includes("knool") || n.includes("kohlrabi") || n.includes("navil") || n.includes("ganth")) return "🥬"
  if (n.includes("bean")) return "🫘"
  if (n.includes("beetroot")) return "🟣"
  if (n.includes("radish") || n.includes("mooli") || n.includes("mullangi") || n.includes("daikon")) return "🥕"
  if (n.includes("snake") || n.includes("padaval") || n.includes("chichinda")) return "🥒"
  if (n.includes("ginger")) return "🫚"
  return "🌱"
}

const genericCropImage = "/placeholder.png"

function cropPhoto(name) {
  const n = String(name || "").toLowerCase()

  // 1. Specific Target Commodities (Clean agricultural product photography)
  // Drumstick / Moringa: Fresh harvested individual pods (never pods hanging on tree)
  if (n.includes("drumstick") || n.includes("moringa") || n.includes("sahjan") || n.includes("murungakkai") || n.includes("nuggekayi")) return "/drumstick.jpg"

  // Green Banana / Plantain: Actual raw unripe green cooking bananas (never yellow bananas)
  if (n.includes("green banana") || n.includes("banana - green") || n.includes("banana green") || n.includes("plantain") || n.includes("raw banana") || n.includes("vazhaikkai") || n.includes("baalekayi") || n.includes("kachha kela")) return "/green_banana.jpg"

  // Mosambi / Sweet Lime: Indian sweet lime Citrus limetta (never lemon or orange)
  if (n.includes("mosambi") || n.includes("sweet lime") || n.includes("citrus limetta") || n.includes("moushumi") || n.includes("battayi")) return "/mosambi.jpg"

  // Coconut: Whole mature coconut and cut half with white meat (never coconut tree or seedling)
  if (n.includes("coconut") || n.includes("copra") || n.includes("nariyal") || n.includes("thengai") || n.includes("tenginakayi")) return "/coconut.jpg"

  // Chikoo / Sapodilla: Fresh ripe sapodilla fruit
  if (n.includes("chikoo") || n.includes("chiku") || n.includes("sapota") || n.includes("sapodilla")) return "/chikoo.jpg"

  // Amla: Fresh Indian gooseberry Phyllanthus emblica
  if (n.includes("amla") || n.includes("gooseberry") || n.includes("nellikai") || n.includes("nelli kai") || n.includes("usirikaya")) return "/amla.jpg"

  // Jasmine: Fresh white jasmine flowers / mogra blossoms (never tree, plant bush or leaves)
  if (n.includes("jasmine") || n.includes("mogra") || n.includes("gundu malli") || n.includes("malli") || n.includes("chameli") || n.includes("mallepuvu")) return "/jasmine.jpg"

  // Brinjal / Eggplant: Glossy purple brinjal fruit on clean white background (never plant leaves)
  if (n.includes("brinjal") || n.includes("eggplant") || n.includes("aubergine") || n.includes("baingan") || n.includes("badanekai") || n.includes("kathirikai") || n.includes("vankaya")) return "/brinjal.jpg"

  // Pomegranate: Fresh whole and cut pomegranate fruits with ruby arils (never tree or flower)
  if (n.includes("pomegranate") || n.includes("anar") || n.includes("dalimbe") || n.includes("danimma") || n.includes("mathulai")) return "/pomegranate.jpg"

  // Guava: Fresh guava fruit
  if (n.includes("guava") || n.includes("amrood")) return "/guava.jpg"

  // Watermelon: Fresh watermelon fruit
  if (n.includes("watermelon") || n.includes("tarbooz")) return "/watermelon.jpg"

  // Cabbage: Clean cabbage head (no baskets or plates)
  if (n.includes("cabbage") || n.includes("patta gobhi") || n.includes("bandha gobhi") || n.includes("muttakose")) return "/cabbage.jpg"

  // Okra / Ladies Finger: Clean pods on neutral background (no bowls)
  if (n.includes("bhindi") || n.includes("okra") || n.includes("lady") || n.includes("ladies") || n.includes("bhendi") || n.includes("vendakkai") || n.includes("bendakaya")) return "/ladies_finger.jpg"

  // Spices & Base Staples
  if (n.includes("ginger") || n.includes("adrak") || n.includes("inji") || n.includes("allam") || n.includes("shunti")) return "/ginger.jpg"
  if (n.includes("tomato") || n.includes("tamatar") || n.includes("thakkali")) return "/tomato.jpg"
  if (n.includes("onion") || n.includes("pyaz") || n.includes("eerulli") || n.includes("vengayam")) return "/onion.jpg"
  if (n.includes("potato") || n.includes("aloo") || n.includes("alugadde") || n.includes("urulaikizhangu")) return "/potato.jpg"
  if (n.includes("carrot") || n.includes("gajar") || n.includes("gajjari")) return "/carrot.jpg"

  // Gourds & Regional Specialties
  if (n.includes("snake") || n.includes("padaval") || n.includes("chichinda") || n.includes("pudalangai") || n.includes("potlakaya")) return "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg"
  if (n.includes("ridgeguard") || n.includes("ridgegourd") || n.includes("tori") || n.includes("turai")) return "https://upload.wikimedia.org/wikipedia/commons/5/59/Luffa_acutangula.jpg"
  if (n.includes("knol") || n.includes("knool") || n.includes("kohlrabi") || n.includes("turnip") || n.includes("ganth") || n.includes("navil")) return "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg"
  if (n.includes("yam") || n.includes("suran") || n.includes("amphophalus")) return "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg"
  if (n.includes("bengal gram") || n.includes("chana")) return "https://upload.wikimedia.org/wikipedia/commons/1/12/Cicer_arietinum_%284217744781%29.jpg"
  if (n.includes("arecanut") || n.includes("supari")) return "https://upload.wikimedia.org/wikipedia/commons/e/e0/Areca_nut_in_a_basket.jpg"
  if (n.includes("gur") || n.includes("jaggery")) return "https://upload.wikimedia.org/wikipedia/commons/d/dc/Jaggery_blocks.jpg"
  if (n.includes("garlic")) return "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=520&q=75"
  if (n.includes("chilli") || n.includes("chili") || n.includes("mirchi")) return "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=520&q=75"
  if (n.includes("cucumber") || n.includes("kheera")) return "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=520&q=75"
  if (n.includes("cauliflower") || n.includes("gobi")) return "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=520&q=75"
  if (n.includes("broccoli")) return "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=520&q=75"
  if (n.includes("bottle gourd") || n.includes("lauki") || n.includes("calabash") || n.includes("sorekayi")) return "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg"
  if (n.includes("thogari") || n.includes("thogri") || n.includes("cluster") || n.includes("guar") || n.includes("gorika") || n.includes("kothavara")) return "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG"
  if (n === "beans" || n.includes("green bean") || n.includes("french bean") || n.includes("frasbean") || n.includes("string bean") || n.includes("bean")) return "https://upload.wikimedia.org/wikipedia/commons/b/b4/Green_beans_2_-_Massachusetts.jpg"
  if (n.includes("beetroot")) return "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=520&q=75"
  if (n.includes("capsicum")) return "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=520&q=75"
  if (n.includes("pea")) return "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=520&q=75"
  if (n.includes("radish") || n.includes("raddish") || n.includes("mooli") || n.includes("mullangi") || n.includes("moolangi") || n.includes("daikon")) return "https://upload.wikimedia.org/wikipedia/commons/5/57/Daikon%2C_Nara_Prefecture%2C_Japan.jpg"
  if (n.includes("spinach")) return "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=520&q=75"
  if (n.includes("banana")) return "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=520&q=75"
  if (n.includes("apple")) return "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=520&q=75"
  if (n.includes("mango")) return "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=520&q=75"
  if (n.includes("lemon") || n.includes("lime")) return "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=520&q=75"
  if (n.includes("pumpkin")) return "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=520&q=75"
  if (n.includes("gourd")) return "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=520&q=75"
  if (n.includes("coriander") || n.includes("mint")) return "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=520&q=75"
  if (n.includes("rice") || n.includes("paddy")) return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=520&q=75"
  if (n.includes("wheat")) return "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=520&q=75"
  if (n.includes("maize") || n.includes("corn")) return "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=520&q=75"
  if (n.includes("ragi") || n.includes("finger millet")) return "https://upload.wikimedia.org/wikipedia/commons/6/61/Eleusine_coracana_Manneczka_%C5%82%C4%99kowata_2020-10-03_03.jpg"
  if (n.includes("moong") || n.includes("green gram") || n.includes("mung")) return "https://upload.wikimedia.org/wikipedia/commons/8/86/Mung_beans_%28Vigna_radiata%29.jpg"
  if (n.includes("avare") || n.includes("hyacinth") || n.includes("field bean")) return "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lablab_purpureus_257105665.jpg"
  if (n.includes("sesame") || n.includes("til") || n.includes("gingelly") || n.includes("sesamum")) return "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg"
  return "/placeholder.png"
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
