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
  "Vegetables", "Fruits", "Flowers", "Forest Products",
  "Drug and Narcotics", "Pulses", "Cereals", "Spices",
  "Oil Seeds", "Live Stock,Poultry,Fisheries",
  "Dry Fruits", "Oils and Fats", "Fibre Crops", "Beverages", "Others"
]

export default function OfficialPrices({ location, preview = false, onViewAll }) {
  const defaultState = "All India"
  const defaultDistrict = ""

  const [filters, setFilters] = useState(() => ({
    commodity: "",
    variety: "",
    category: "",
    state: defaultState,
    district: defaultDistrict,
    market: "",
    grade: "",
    date: ""
  }))
  const [applied, setApplied] = useState(() => ({
    commodity: "",
    variety: "",
    category: "",
    state: defaultState,
    district: defaultDistrict,
    market: "",
    grade: "",
    date: ""
  }))

  const [allRecords, setAllRecords] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stateFallback, setStateFallback] = useState(false)
  const [sessionFallback, setSessionFallback] = useState(false)
  const [sessionDate, setSessionDate] = useState("")
  const [isLive, setIsLive] = useState(true)
  const [sourceInfo, setSourceInfo] = useState("")
  const [dataSource, setDataSource] = useState(null)
  const [categories, setCategories] = useState(fallbackCategories)
  const [varietySearch, setVarietySearch] = useState("")
  const [viewMode, setViewMode] = useState("cards") // "cards", "grid", "table", "catalogue"
  const [cardLimit, setCardLimit] = useState(60)
  const [globalPriceMap, setGlobalPriceMap] = useState({})
  const [globalCommodityPriceMap, setGlobalCommodityPriceMap] = useState({})
  const [lastUpdated, setLastUpdated] = useState("")
  const [availableStates, setAvailableStates] = useState(states)
  const [historicalFallback, setHistoricalFallback] = useState(null)
  const [availableDistricts, setAvailableDistricts] = useState([])
  const [availableGrades, setAvailableGrades] = useState(["FAQ", "Grade A", "Grade B", "Medium", "Large", "Small", "Local"])

  // Quick lookup for category by commodity
  const commodityCategoryMap = useMemo(() => {
    const map = new Map()
    if (Array.isArray(agmarknetCatalogue?.commodities)) {
      agmarknetCatalogue.commodities.forEach(c => {
        const cat = c.category || c.group_name || ""
        const norm = String(c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        if (norm) map.set(norm, cat)
      })
    }
    return map
  }, [])

  function getCategoryForCommodity(commName) {
    if (!commName) return ""
    const norm = String(commName || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const cat = commodityCategoryMap.get(norm)
    if (cat) return cat
    if (/tea|coffee|cocoa|chicory/i.test(commName)) return "Beverages"
    if (/ashwagandha|aloe|tulsi|lemongrass|neem|senna|sonamukhi|isabgol|isabgul|psyllium|mint|pudina|mentha|amla|nelli\s*kai|muesli|safed\s*musli|mulethi|muleti|giloy|tinospora|shatavari|asparagus|stevia|kutki|coleus|karanja|pippali|ashoka|atis|harad|haritaki|myrobolan|adulsa|akarkara|bhringraj|shankhpushpi|medicinal|aromatic/i.test(commName)) return "Others"
    if (/honey|shahad|bamboo|gond|gum|lac|tamarind|chironji|behada|harrah|wood|timber/i.test(commName)) return "Forest Products"
    if (/marigold|rose|jasmine|chrysanthemum|shevanti|tuberose|gladiolus|carnation|gerbera/i.test(commName)) return "Flowers"
    if (/cow|cattle|bull|calf|buffalo|goat|sheep|chicken|cock|hen|duck|fish|prawn|crab|livestock/i.test(commName)) return "Live Stock,Poultry,Fisheries"
    if (/almond|cashew|walnut|raisin|date|pistachio|anjeer|fig/i.test(commName)) return "Dry Fruits"
    if (/mustard\s*oil|coconut\s*oil|oil|ghee|butter|fat|dalda|palmolein/i.test(commName)) return "Oils and Fats"
    if (/gram|chana|arhar|tur|moong|urad|masoor|lentil|pulse|pea|cowpea|rajma/i.test(commName)) return "Pulses"
    return ""
  }

  function getPriceBadge(r) {
    if (!r) return { label: "🏛️ Wholesale Mandi", bg: "#15803d", color: "#ffffff", verifiedText: "✓ Verified Mandi Trade", isVerified: true }
    const pt = String(r.price_type || "").toLowerCase()
    const st = String(r.source_type || "").toLowerCase()
    const isStatic = Boolean(r.is_static_reference || st === "static_reference" || pt.includes("static") || pt.includes("unverified"))
    const isHist = Boolean(r.is_historical || st === "historical" || pt.includes("historical"))

    if (isStatic) {
      return {
        label: "📋 Reference / Unverified",
        bg: "#64748b",
        color: "#ffffff",
        verifiedText: "⚠️ Unverified Reference Benchmark",
        isVerified: false
      }
    }
    if (isHist) {
      return {
        label: "📜 Historical Benchmark",
        bg: "#b45309",
        color: "#ffffff",
        verifiedText: "🕒 Historical APMC Benchmark",
        isVerified: false
      }
    }
    if (pt.includes("tea board") || pt.includes("tea auction") || (r.source_name && r.source_name.toLowerCase().includes("tea board"))) {
      return {
        label: "🔨 Tea Board Public Auction Price",
        bg: "#7c3aed",
        color: "#ffffff",
        verifiedText: "✓ Official Tea Board Public Auction",
        isVerified: true
      }
    }
    if (pt.includes("e-charak") || pt.includes("echarak") || (r.source_name && r.source_name.toLowerCase().includes("charak"))) {
      return {
        label: "🌿 e-Charak Fortnightly Benchmark",
        bg: "#059669",
        color: "#ffffff",
        verifiedText: "✓ Verified NMPB e-Charak Benchmark",
        isVerified: true
      }
    }
    if (st === "auction" || pt.includes("auction")) {
      return {
        label: "🔨 Auction Price",
        bg: "#9333ea",
        color: "#ffffff",
        verifiedText: "✓ Verified Electronic Auction",
        isVerified: true
      }
    }
    if (st === "procurement" || pt.includes("procurement") || pt.includes("msp")) {
      return {
        label: "📦 Government Procurement (MSP)",
        bg: "#0284c7",
        color: "#ffffff",
        verifiedText: "✓ Official MSP Procurement Benchmark",
        isVerified: true
      }
    }
    if (st === "cooperative" || pt.includes("cooperative")) {
      return {
        label: "🤝 Cooperative Benchmark",
        bg: "#d97706",
        color: "#ffffff",
        verifiedText: "✓ Cooperative Trading Rate",
        isVerified: true
      }
    }
    if (st === "farmgate" || pt.includes("farmgate") || pt.includes("farm gate")) {
      return {
        label: "🚜 Farmgate Benchmark",
        bg: "#0d9488",
        color: "#ffffff",
        verifiedText: "✓ Farmgate Benchmark Price",
        isVerified: true
      }
    }
    if (st === "retail" || pt.includes("retail")) {
      return {
        label: "🛒 Retail Price",
        bg: "#e11d48",
        color: "#ffffff",
        verifiedText: "✓ Retail Market Price",
        isVerified: true
      }
    }
    return {
      label: "🏛️ Wholesale Mandi",
      bg: "#15803d",
      color: "#ffffff",
      verifiedText: "✓ Verified Mandi Trade",
      isVerified: true
    }
  }


  // Only apply location override if preview is true (e.g. Home page "Prices near you")
  useEffect(() => {
    if (preview && location?.state) {
      setFilters(prev => ({ ...prev, state: location.state, district: location.district || prev.district }))
      setApplied(prev => ({ ...prev, state: location.state, district: location.district || prev.district }))
    }
  }, [preview, location?.state, location?.district])

  // Load all available official AGMARKNET mandi prices from Government backend
  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError("")
    setStateFallback(false)
    setSessionFallback(false)
    try {
      // Retrieve complete dataset from Government APMC backend service
      const response = await fetch("/api/mandi-prices?limit=all")
      const payload = await readPriceResponse(response)
      let rows = Array.isArray(payload.records) ? payload.records : []

      // If backend returned paginated subset, retrieve remaining records until all are fetched
      const reportedTotal = Number(payload.total ?? payload.total_count ?? rows.length)
      if (rows.length < reportedTotal) {
        const batchSize = 1000
        let currentOffset = rows.length
        while (currentOffset < reportedTotal) {
          const nextRes = await fetch(`/api/mandi-prices?limit=${batchSize}&offset=${currentOffset}`)
          if (!nextRes.ok) break
          const nextPayload = await readPriceResponse(nextRes)
          const nextRows = Array.isArray(nextPayload.records) ? nextPayload.records : []
          if (!nextRows.length) break
          rows = rows.concat(nextRows)
          currentOffset += nextRows.length
        }
      }

      setAllRecords(rows)
      if (payload.historical_fallback) setHistoricalFallback(payload.historical_fallback)
      else setHistoricalFallback(null)
      if (payload.district_fallback) setStateFallback(true)
      if (payload.session_fallback) {
        setSessionFallback(true)
        setSessionDate(payload.session_date || "")
      }
      if (payload.last_successful_refresh) setLastUpdated(payload.last_successful_refresh)
      setIsLive(payload.live !== false)
      setSourceInfo(payload.source || "")
      setDataSource({ live: payload.live !== false, source: payload.source || "Source: Government of India — AGMARKNET" })

      // Generate dynamic available options from all fetched rows
      if (rows.length > 0) {
        const reportingStates = [...new Set(rows.map(r => r.state).filter(Boolean))].sort()
        const reportingDistricts = [...new Set(rows.map(r => r.district).filter(Boolean))].sort()
        const reportingGrades = [...new Set(rows.map(r => r.grade).filter(Boolean))].sort()
        if (reportingStates.length > 0) setAvailableStates(reportingStates)
        if (reportingDistricts.length > 0) setAvailableDistricts(reportingDistricts)
        if (reportingGrades.length > 0) setAvailableGrades(reportingGrades)
      }

      if (payload.price_map && typeof payload.price_map === "object") {
        setGlobalPriceMap(payload.price_map)
      }
      if (payload.commodity_price_map && typeof payload.commodity_price_map === "object") {
        setGlobalCommodityPriceMap(payload.commodity_price_map)
      }
      if (Array.isArray(payload.categories) && payload.categories.length > 0) {
        setCategories(payload.categories)
      }
    } catch (err) {
      setError(err.message || "Could not load official mandi prices.")
      setAllRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])


  // Complete list of commodity options derived from official catalogue + reporting records
  const commodityOptions = useMemo(() => {
    const map = new Map()
    if (Array.isArray(agmarknetCatalogue?.commodities)) {
      agmarknetCatalogue.commodities.forEach(c => {
        const norm = String(c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        if (norm && !map.has(norm)) {
          map.set(norm, {
            name: c.name,
            category: c.category || c.group_name || getCategoryForCommodity(c.name),
            group_name: c.group_name || c.category || "General",
            id: c.id
          })
        }
      })
    }
    allRecords.forEach(r => {
      const norm = String(r.commodity || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      if (norm && !map.has(norm)) {
        const cat = r.category || getCategoryForCommodity(r.commodity) || "Vegetables"
        map.set(norm, {
          name: r.commodity,
          category: cat,
          group_name: cat,
          id: r.commodity
        })
      }
    })
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
  }, [allRecords, commodityCategoryMap])

  // Dynamic varieties for selected commodity
  const varieties = useMemo(() => {
    const comm = (filters.commodity || "").trim()
    if (!comm) return []
    const commNorm = comm.toLowerCase().replace(/[^a-z0-9]/g, "")
    const set = new Set()

    allRecords.forEach(r => {
      const cn = String(r.commodity || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      if (cn === commNorm || cn.includes(commNorm) || commNorm.includes(cn)) {
        if (r.variety && r.variety.trim()) set.add(r.variety.trim())
      }
    })

    const catComm = (agmarknetCatalogue?.commodities || []).find(c => {
      const cn = String(c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      if (cn === commNorm || cn.includes(commNorm) || commNorm.includes(cn)) return true
      if (Array.isArray(c.aliases) && c.aliases.some(a => String(a).toLowerCase().replace(/[^a-z0-9]/g, "") === commNorm)) return true
      return false
    })
    if (catComm) {
      const vList = catComm.variety_names || (catComm.varieties || []).map(v => typeof v === "string" ? v : v.name)
      vList.forEach(v => {
        if (v && v.trim()) set.add(v.trim())
      })
    }

    return [...set].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
  }, [filters.commodity, allRecords])

  // Dynamic districts based on chosen state
  const filteredDistricts = useMemo(() => {
    if (!filters.state || filters.state === "All India") {
      return availableDistricts
    }
    const stateLower = filters.state.toLowerCase()
    const dists = new Set(
      allRecords
        .filter(r => String(r.state || "").toLowerCase() === stateLower)
        .map(r => r.district)
        .filter(Boolean)
    )
    return [...dists].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
  }, [allRecords, filters.state, availableDistricts])

  // Filter all records with AND logic across all active criteria
  const filteredRecords = useMemo(() => {
    let result = allRecords

    if (applied.category) {
      const catLower = applied.category.toLowerCase().replace(/[^a-z0-9]/g, "")
      result = result.filter(r => {
        const cat = (r.category || getCategoryForCommodity(r.commodity) || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        return cat === catLower
      })
    }

    if (applied.commodity) {
      const commLower = applied.commodity.toLowerCase().replace(/[^a-z0-9]/g, "")
      result = result.filter(r => {
        const rComm = String(r.commodity || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        return rComm === commLower || rComm.includes(commLower) || commLower.includes(rComm)
      })
    }

    if (applied.variety) {
      const varLower = applied.variety.toLowerCase().replace(/[^a-z0-9]/g, "")
      result = result.filter(r => String(r.variety || "").toLowerCase().replace(/[^a-z0-9]/g, "") === varLower)
    }

    if (applied.state && applied.state !== "All India") {
      const stateLower = applied.state.toLowerCase()
      result = result.filter(r => String(r.state || "").toLowerCase() === stateLower)
    }

    if (applied.district) {
      const distLower = applied.district.toLowerCase()
      result = result.filter(r => String(r.district || "").toLowerCase() === distLower)
    }

    if (applied.market) {
      const mktLower = applied.market.toLowerCase().replace(/[^a-z0-9]/g, "")
      result = result.filter(r => String(r.market || "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(mktLower))
    }

    if (applied.grade && applied.grade !== "All Grades") {
      const gradeLower = applied.grade.toLowerCase().replace(/[^a-z0-9]/g, "")
      result = result.filter(r => String(r.grade || "").toLowerCase().replace(/[^a-z0-9]/g, "") === gradeLower)
    }

    if (applied.date) {
      result = result.filter(r => String(r.arrival_date || "").includes(applied.date.trim()))
    }



    return result
  }, [allRecords, applied, commodityCategoryMap])

  const total = allRecords.length === 0 && loading ? null : filteredRecords.length

  // Sliced records for current visible page
  const records = useMemo(() => {
    if (preview) {
      return filteredRecords.slice(0, 8)
    }
    const offset = (currentPage - 1) * pageSize
    return filteredRecords.slice(offset, offset + pageSize)
  }, [filteredRecords, preview, currentPage, pageSize])

  // Dynamic historical fallback when active commodity has 0 current records
  useEffect(() => {
    if (applied.commodity && filteredRecords.length === 0) {
      fetch(`/api/mandi-history?commodity=${encodeURIComponent(applied.commodity)}`)
        .then(res => res.json())
        .then(data => {
          if (data && (data.modal_price || data.is_historical)) {
            setHistoricalFallback(data)
          } else {
            setHistoricalFallback(null)
          }
        })
        .catch(() => setHistoricalFallback(null))
    } else if (filteredRecords.length > 0) {
      setHistoricalFallback(null)
    }
  }, [applied.commodity, filteredRecords.length])

  // Fast normalized price lookup from reported records across the entire dataset
  const priceLookup = useMemo(() => {
    const map = new Map()
    allRecords.forEach(r => {
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
  }, [allRecords])

  // Section 7: All official catalogue commodities matching active category
  const activeCommodities = useMemo(() => {
    const list = Array.isArray(agmarknetCatalogue?.commodities) ? agmarknetCatalogue.commodities : []
    return list.filter(c => {
      const cat = (c.category || c.group_name || getCategoryForCommodity(c.name) || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      if (applied.category) {
        const catNorm = applied.category.toLowerCase().replace(/[^a-z0-9]/g, "")
        const match = cat === catNorm
        if (!match) return false
      }
      if (applied.commodity && String(c.name || "").toLowerCase() !== applied.commodity.toLowerCase()) return false
      return true
    })
  }, [applied.category, applied.commodity, commodityCategoryMap])

  // Section 6 & 8: All registered varieties from official catalogue
  const catalogVarietyItems = useMemo(() => {
    const items = []
    const seenIdentities = new Set()
    activeCommodities.forEach(c => {
      const vNames = c.variety_names || (c.varieties || []).map(v => typeof v === "string" ? v : (v.name || v.variety_name))
      const cat = c.category || c.group_name || getCategoryForCommodity(c.name) || ""
      const cleanVNames = [...new Set((vNames || []).map(n => String(n || "").trim()).filter(Boolean))]
      cleanVNames.forEach(vName => {
        if (applied.variety && vName.toLowerCase() !== applied.variety.toLowerCase()) return

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
  }, [activeCommodities, applied.variety, commodityCategoryMap])

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

  const totalPages = Math.max(1, Math.ceil((total || 0) / (preview ? 8 : pageSize)))

  function submit(e) {
    if (e) e.preventDefault()
    setApplied({ ...filters })
    setCurrentPage(1)
  }

  function clearAllFilters() {
    const cleared = {
      commodity: "",
      variety: "",
      category: "",
      state: "All India",
      district: "",
      market: "",
      grade: "",
      date: ""
    }
    setFilters(cleared)
    setApplied(cleared)
    setVarietySearch("")
    setCurrentPage(1)
  }

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
    setCurrentPage(newPage)
    const el = document.getElementById("mandi-records-container") || document.querySelector(".official-result-bar")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function filterByCrop(cropName) {
    setFilters(prev => ({ ...prev, commodity: cropName, variety: "" }))
    setApplied(prev => ({ ...prev, commodity: cropName, variety: "" }))
    setVarietySearch("")
    setCurrentPage(1)
  }

  const hasActiveFilters = Boolean(
    applied.category ||
    applied.commodity ||
    applied.variety ||
    (applied.state && applied.state !== "All India") ||
    applied.district ||
    applied.market ||
    applied.grade ||
    applied.date
  )

  const filteredCommodities = commodityOptions.filter(item => {
    if (!filters.category) return true
    const catNorm = (filters.category || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const itemCatNorm = (item.category || getCategoryForCommodity(item.name) || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const itemGroupNorm = (item.group_name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    return itemCatNorm === catNorm || itemGroupNorm === catNorm
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
        <form className="official-filters-expanded" onSubmit={submit}>
          <div className="filters-row">
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
                <option value="">All categories (15 groups)</option>
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
                    : `All commodities (${commodityOptions.length || 609} official)`}
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
                <span>Variety {varieties.length > 0 ? `(${varieties.length})` : ""}</span>
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
                  placeholder={`Search ${varieties.length} varieties...`}
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
                          ? `All matching (${displayedVarieties.length} of ${varieties.length})`
                          : `All active varieties (${varieties.length})`)
                      : (varietySearch
                          ? `No varieties match "${varietySearch}"`
                          : "All varieties")}
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
              State / UT {availableStates.length > 0 && filters.state !== "All India" ? `(${availableStates.length} reporting)` : ""}
              <select value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value, district: "" })}>
                <option value="All India">All India ({availableStates.length} states reporting)</option>
                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label>
              District {filteredDistricts.length > 0 ? `(${filteredDistricts.length} available)` : ""}
              {filteredDistricts.length > 0 ? (
                <select value={filters.district} onChange={e => setFilters({ ...filters, district: e.target.value })}>
                  <option value="">All districts ({filteredDistricts.length} reporting)</option>
                  {filteredDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input
                  value={filters.district}
                  onChange={e => setFilters({ ...filters, district: e.target.value })}
                  placeholder="All districts"
                />
              )}
            </label>

            <label>
              Mandi / APMC
              <input
                value={filters.market}
                onChange={e => setFilters({ ...filters, market: e.target.value })}
                placeholder="e.g. Baripada, Alibagh..."
              />
            </label>
          </div>

          <div className="filters-row secondary-filters">
            <label>
              Grade
              <select value={filters.grade} onChange={e => setFilters({ ...filters, grade: e.target.value })}>
                <option value="">All Grades ({availableGrades.length})</option>
                {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>

            <label>
              Arrival Date
              <input
                type="text"
                value={filters.date}
                onChange={e => setFilters({ ...filters, date: e.target.value })}
                placeholder="e.g. 03/11/2026"
              />
            </label>

            <div className="filter-actions">
              <button type="submit" className="btn-filter-apply" disabled={loading}>
                {loading ? "Loading…" : "Apply Filters"}
              </button>
              {hasActiveFilters && (
                <button type="button" className="btn-filter-clear" onClick={clearAllFilters}>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Result Status Bar */}
      <div className="official-result-bar">
        <div>
          <b>
            {preview
              ? "Latest reported official mandi rates"
              : (total === null
                  ? "Loading records…"
                  : `Showing records ${total === 0 ? 0 : (currentPage - 1) * pageSize + 1} – ${Math.min(currentPage * pageSize, total)} of ${total.toLocaleString("en-IN")} official mandi records`)}
          </b>
          <span>
            {applied.state || "All India"}
            {applied.district ? " · " + applied.district : ""}
            {applied.market ? " · " + applied.market : ""}
            {applied.grade ? " · Grade: " + applied.grade : ""}
            {applied.commodity ? (
              <>
                {" · "}
                <b>{applied.commodity}</b>{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, commodity: "", variety: "" }))
                    setApplied(prev => ({ ...prev, commodity: "", variety: "" }))
                    setCurrentPage(1)
                  }}
                  style={{ border: 0, background: "none", color: "#377b4a", cursor: "pointer", textDecoration: "underline", fontSize: 10, padding: 0 }}
                >
                  (show all commodities)
                </button>
              </>
            ) : " · All commodities"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {dataSource && (
            <span className={dataSource.live ? "live" : "sample"} title={dataSource.source}>
              {dataSource.live ? `LIVE · ${dataSource.source}` : dataSource.source}
            </span>
          )}
          {lastUpdated && (
            <span style={{ fontSize: "10px", color: "#475569", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "2px 8px", borderRadius: "4px" }} title="AGMARKNET sync timestamp">
              Last updated: {lastUpdated.slice(0, 10)}
            </span>
          )}
          {!preview && (
            <button onClick={() => fetchRecords()} disabled={loading} style={{ cursor: "pointer" }}>
              ↻ Refresh
            </button>
          )}
        </div>
      </div>

      {/* View Mode Tabs (Cards View is default) */}
      {!preview && (
        <div className="mandi-view-tabs">
          <button
            type="button"
            className={`mandi-view-tab ${viewMode === "cards" ? "active" : ""}`}
            onClick={() => setViewMode("cards")}
          >
            🏷️ Mandi Price Cards ({total !== null ? total.toLocaleString("en-IN") : "…"})
          </button>
          <button
            type="button"
            className={`mandi-view-tab ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            ▦ Compact Grid
          </button>
          <button
            type="button"
            className={`mandi-view-tab ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
          >
            ▤ Table View
          </button>
          <button
            type="button"
            className={`mandi-view-tab ${viewMode === "catalogue" ? "active" : ""}`}
            onClick={() => setViewMode("catalogue")}
          >
            📚 Official Catalogue Directory ({activeCommodities.length} active · 609 registered)
          </button>
        </div>
      )}

      {error && (
        <div className="official-error" style={{ margin: "14px 0" }}>
          <b>Prices could not be loaded.</b>
          <p>{error}</p>
          <span>This page connects to the official Government AGMARKNET feed. Check network connection or retry.</span>
        </div>
      )}

      {/* PRIMARY SECTION 1: CROP PRICE CARDS (Individual APMC Market Records) */}
      {viewMode === "cards" && (
        <section id="mandi-records-container" style={{ margin: "14px 0" }}>
          {records.length > 0 ? (
            <div className="farmer-listings" style={{ display: "grid", gap: "10px" }}>
              {records.map((r, idx) => {
                const categoryName = r.category || getCategoryForCommodity(r.commodity)
                const imgInfo = resolveVarietyImage(r.commodity, r.variety, categoryName)
                const badge = getPriceBadge(r)
                const formattedDate = (r.arrival_date && r.arrival_date !== "Date unavailable") ? r.arrival_date : "Date unavailable"
                const cardKey = [r.state, r.district, r.market, r.commodity, r.variety, r.grade, r.arrival_date, idx].join("-")

                return (
                  <article className="listing-card mandi-listing-card" key={cardKey}>
                    {/* Thumbnail column with badge */}
                    <div className="listing-photo-thumb-container">
                      <div className="listing-photo-thumb" style={{ position: "relative" }}>
                        <img
                          src={imgInfo.url}
                          alt={r.commodity}
                          loading="lazy"
                          onError={e => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = getCategorySvgDataUri(categoryName, `${r.commodity} (${r.variety})`)
                          }}
                        />
                        <span className="listing-photo-badge" style={{ background: badge.bg, color: badge.color, fontWeight: "700" }}>
                          {badge.label}
                        </span>
                      </div>
                      <span style={{ fontSize: "8px", color: "#64748b", display: "block", marginTop: "3px", textAlign: "center" }}>
                        {imgInfo.isExact ? "Exact Match" : (imgInfo.isCategoryFallback ? "Category SVG" : "Representative")}
                      </span>
                    </div>

                    {/* Column 2: Commodity, Variety, Category, Grade, Date */}
                    <div>
                      <small>OFFICIAL COMMODITY</small>
                      <b style={{ fontSize: "14px", color: "#1e3a24", display: "block" }}>{r.commodity}</b>
                      <span style={{ fontWeight: 600, color: "#374151", margin: "2px 0 0" }}>
                        {r.product_type ? (
                          <>Product / Type: <strong style={{ color: "#111827" }}>{r.variety || r.product_type}</strong></>
                        ) : (
                          <>Variety: <strong style={{ color: "#111827" }}>{r.variety || "Other"}</strong></>
                        )}
                      </span>
                      {categoryName && (
                        <span style={{ fontSize: "0.85em", color: "#2d6e42", fontWeight: 600, display: "inline-block", marginTop: "2px" }}>
                          🏷️ {categoryName}
                        </span>
                      )}
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                        {r.grade && <span className="badge-grade">Grade: {r.grade}</span>}
                        <span className="badge-packaging">📅 {formattedDate}</span>
                      </div>
                    </div>

                    {/* Column 3: OFFICIAL MANDI PRICE (Modal prominently displayed) */}
                    <div>
                      <small style={{ color: badge.bg, fontWeight: "700" }}>{r.price_type ? r.price_type.toUpperCase() : badge.label.toUpperCase()}</small>
                      <div style={{ margin: "2px 0" }}>
                        <b style={{ fontSize: "20px", color: badge.isVerified ? "#15803d" : "#92400e", fontWeight: "800", display: "inline-block" }}>
                          ₹{Number(r.modal_price).toLocaleString("en-IN")}
                        </b>
                        <span style={{ fontSize: "11px", fontWeight: "normal", color: "#64748b", marginLeft: "4px" }}>
                          / {r.price_unit ? r.price_unit.replace(/^₹\/?/, "") : (r.unit ? r.unit.replace(/^₹\/?/, "") : "quintal")}
                        </span>
                      </div>
                      <span style={{ fontSize: "10px", color: "#4b5563", fontWeight: 500 }}>
                        Min: ₹{Number(r.min_price).toLocaleString("en-IN")} · Max: ₹{Number(r.max_price).toLocaleString("en-IN")}
                      </span>
                      <div style={{ marginTop: "5px" }}>
                        <span style={{
                          fontSize: "9px",
                          background: badge.isVerified ? "#f0fdf4" : "#fef3c7",
                          color: badge.isVerified ? "#166534" : "#92400e",
                          border: `1px solid ${badge.isVerified ? "#bbf7d0" : "#fde68a"}`,
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontWeight: "700",
                          display: "inline-block"
                        }}>
                          {badge.verifiedText}
                        </span>
                      </div>
                    </div>

                    {/* Column 4: Mandi / APMC Name & Geographic Location */}
                    <div>
                      <small>REPORTING MANDI / APMC</small>
                      <b style={{ fontSize: "13px", color: "#1e293b", display: "block" }}>{r.market}</b>
                      <span style={{ color: "#475569", fontWeight: 500 }}>
                        📍 {r.district ? `${r.district}, ` : ""}{r.state}
                      </span>
                      <span style={{ fontSize: "10px", color: "#64748b" }}>
                        Arrival Date: {formattedDate}
                      </span>
                      <span style={{ fontSize: "9px", color: "#94a3b8", display: "block", marginTop: "3px" }}>
                        {r.source_name || "Ministry of Agriculture (Govt. of India)"}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : !loading && (
            <div className="crop-no-active-records" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "32px 16px", textAlign: "center", color: "#64748b", margin: "16px 0" }}>
              <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#334155" }}>
                {filters.commodity
                  ? `No verified price available for ${filters.commodity}${filters.variety ? ` (${filters.variety})` : ""}.`
                  : (filters.state && filters.state !== "All India"
                      ? `No official mandi report currently available for ${filters.state} matching current filters.`
                      : "No active official AGMARKNET mandi records found for the selected filters.")}
              </p>
              {historicalFallback && (
                <div style={{ marginTop: 14, padding: "10px 16px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, display: "inline-block", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, background: "#d97706", color: "#fff", padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>HISTORICAL BENCHMARK</span>
                    <span style={{ fontSize: 11, color: "#92400e", fontWeight: 600 }}>Previous official session reported on {historicalFallback.arrival_date}:</span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <b style={{ fontSize: 16, color: "#78350f" }}>₹{Number(historicalFallback.modal_price).toLocaleString("en-IN")}</b>
                    <span style={{ fontSize: 11, color: "#92400e", marginLeft: 4 }}>/ {historicalFallback.price_unit ? historicalFallback.price_unit.replace(/^₹\/?/, "") : "quintal"}</span>
                    <span style={{ fontSize: 11, color: "#78716c", marginLeft: 8 }}>· {historicalFallback.market}, {historicalFallback.state}</span>
                  </div>
                  <small style={{ display: "block", fontSize: 10, color: "#b45309", marginTop: 4 }}>
                    * Historical price preserved for agricultural trend reference. Not today's live rate.
                  </small>
                </div>
              )}
              <small style={{ display: "block", marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                All 616 official commodities and 3,115 registered varieties remain registered in the government catalogue.
              </small>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{ marginTop: "12px", background: "#15803d", color: "#fff", border: 0, padding: "7px 16px", borderRadius: "5px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: COMPACT GRID VIEW (Grid Cards for each record) */}
      {viewMode === "grid" && (
        <section id="mandi-records-container" style={{ margin: "14px 0" }}>
          {records.length > 0 ? (
            <div className="crop-price-cards">
              {records.map((r, idx) => {
                const categoryName = r.category || getCategoryForCommodity(r.commodity)
                const imgInfo = resolveVarietyImage(r.commodity, r.variety, categoryName)
                const cardKey = [r.state, r.district, r.market, r.commodity, r.variety, r.grade, r.arrival_date, idx].join("-")

                return (
                  <article className="crop-price-card" key={cardKey}>
                    <div className="crop-photo">
                      <img
                        src={imgInfo.url}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        onError={event => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = getCategorySvgDataUri(categoryName, `${r.commodity} (${r.variety})`)
                        }}
                      />
                      <span className="crop-symbol">{imgInfo.symbol}</span>
                      <span className={imgInfo.isExact ? "crop-img-tag exact-tag" : (imgInfo.isCategoryFallback ? "crop-img-tag cat-tag" : "crop-img-tag rep-tag")}>
                        {imgInfo.isExact ? "Exact Match" : (imgInfo.isCategoryFallback ? "Category SVG" : "Representative")}
                      </span>
                    </div>
                    <div className="crop-card-copy">
                      <small className="crop-category-tag">{categoryName || "AGMARKNET"} · {(r.arrival_date && r.arrival_date !== "Date unavailable") ? r.arrival_date : "Date unavailable"}</small>
                      <b style={{ fontSize: "13px" }}>{r.commodity}</b>
                      <span className="crop-commodity-sub">Variety: {r.variety || "Other"} {r.grade ? `(Grade: ${r.grade})` : ""}</span>
                      <div className="crop-price-info">
                        <span>Modal <strong style={{ fontSize: "14px", color: "#15803d" }}>₹{Number(r.modal_price).toLocaleString("en-IN")}</strong> / {r.price_unit ? r.price_unit.replace(/^₹\/?/, "") : (r.unit ? r.unit.replace(/^₹\/?/, "") : "quintal")}</span>
                        <small>Min: ₹{Number(r.min_price).toLocaleString("en-IN")} · Max: ₹{Number(r.max_price).toLocaleString("en-IN")}</small>
                        <small>{r.market} · {r.district ? r.district + ", " : ""}{r.state}</small>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : !loading && (
            <div className="crop-no-active-records" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "32px 16px", textAlign: "center", color: "#64748b", margin: "16px 0" }}>
              <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#334155" }}>
                No active records match the selected filters today.
              </p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: TABLE VIEW */}
      {viewMode === "table" && !error && (
        <div className="official-table-wrap" style={{ margin: "14px 0" }}>
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
                <th>Price Type / Source</th>
                <th>Min</th>
                <th>Max</th>
                <th>Modal Price / Unit</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const badge = getPriceBadge(r)
                const formattedDate = (r.arrival_date && r.arrival_date !== "Date unavailable") ? r.arrival_date : "Date unavailable"
                return (
                  <tr key={[r.state, r.district, r.market, r.commodity, r.variety, r.arrival_date, i].join("-")}>
                    <td>{formattedDate}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span>{getCommoditySymbol(r.commodity)}</span>
                        <b>{r.commodity || "—"}</b>
                      </span>
                    </td>
                    <td>{r.variety || "—"}</td>
                    <td>{r.grade || "—"}</td>
                    <td>{r.state || "—"}</td>
                    <td>{r.district || "—"}</td>
                    <td>{r.market || "—"}</td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: badge.bg, display: "block" }}>
                        {badge.label}
                      </span>
                      <small style={{ fontSize: "9px", color: "#64748b" }}>{r.source_name || "Government of India (AGMARKNET)"}</small>
                    </td>
                    <td>{r.min_price ? `${money(r.min_price)}` : "—"}</td>
                    <td>{r.max_price ? `${money(r.max_price)}` : "—"}</td>
                    <td className="modal-price" style={{ color: badge.isVerified ? "#15803d" : "#92400e", fontWeight: "700" }}>
                      {money(r.modal_price)}
                      <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "normal", marginLeft: "3px" }}>
                        / {r.price_unit ? r.price_unit.replace(/^₹\/?/, "") : (r.unit ? r.unit.replace(/^₹\/?/, "") : "quintal")}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!records.length && !loading && (
            <div className="official-empty">
              No current AGMARKNET mandi price available for these filters.
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: OFFICIAL CATALOGUE DIRECTORY VIEW (609 commodities & 3,071 varieties) */}
      {viewMode === "catalogue" && (
        <section style={{ margin: "14px 0" }}>
          <div className="catalogue-cards-header">
            <div>
              <h3>Official Government of India AGMARKNET Catalogue Directory</h3>
              <p>Complete master of all 609 registered commodities and 3,071 registered varieties across 16 official categories.</p>
            </div>
          </div>
          <div className="crop-price-cards">
            {catalogVarietyItems.slice(0, cardLimit).map(item => {
              const imgInfo = resolveVarietyImage(item.commodity, item.variety, item.category)
              const priceRecord = findPrice(item.commodity, item.variety)
              const commPrice = findPrice(item.commodity, "")
              return (
                <article
                  className="crop-price-card"
                  key={item.identity}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, commodity: item.commodity, variety: item.variety }))
                    setApplied(prev => ({ ...prev, commodity: item.commodity, variety: item.variety }))
                    setViewMode("cards")
                    setCurrentPage(1)
                  }}
                  style={{ cursor: "pointer" }}
                  title={`Click to view all individual market records for ${item.commodity} - ${item.variety}`}
                >
                  <div className="crop-photo">
                    <img
                      src={imgInfo.url}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      onError={event => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = getCategorySvgDataUri(item.category, `${item.commodity} (${item.variety})`)
                      }}
                    />
                    <span className="crop-symbol">{imgInfo.symbol}</span>
                    <span className={imgInfo.isExact ? "crop-img-tag exact-tag" : "crop-img-tag rep-tag"}>
                      {imgInfo.isExact ? "Exact Match" : "Representative"}
                    </span>
                  </div>
                  <div className="crop-card-copy">
                    <small className="crop-category-tag">{item.category} · AGMARKNET</small>
                    <b style={{ fontSize: "13px" }}>{item.variety}</b>
                    <span className="crop-commodity-sub">{item.commodity}</span>
                    {priceRecord ? (
                      <div className="crop-price-info">
                        <span>Modal <strong>{money(priceRecord.modal_price)}</strong> / quintal</span>
                        <small>Min: {money(priceRecord.min_price)} · Max: {money(priceRecord.max_price)}</small>
                        <small>{priceRecord.market} · {priceRecord.state}</small>
                        {priceRecord.market_count > 1 && (
                          <small style={{ color: "#15803d", fontWeight: "600" }}>{priceRecord.market_count} reporting APMC mandis</small>
                        )}
                      </div>
                    ) : commPrice ? (
                      <div className="crop-price-info">
                        <span>Commodity Modal <strong>{money(commPrice.modal_price)}</strong> / quintal</span>
                        <small>{commPrice.market} · {commPrice.state}</small>
                      </div>
                    ) : (
                      <div className="crop-no-price">
                        <span className="no-price-msg" style={{ color: "#78716c", fontSize: "11px" }}>No current official price available</span>
                        <small style={{ color: "#94a3b8", display: "block", fontSize: "9px", marginTop: "2px" }}>Registered in official Government catalogue</small>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
          {catalogVarietyItems.length > cardLimit && (
            <div className="crop-show-more-bar">
              <button
                type="button"
                className="crop-show-more-btn"
                onClick={() => setCardLimit(prev => prev + 96)}
              >
                Load more (+96 varieties)
              </button>
              <button
                type="button"
                className="crop-show-more-btn"
                style={{ background: "#2b633b", color: "#fff" }}
                onClick={() => setCardLimit(5000)}
              >
                Show all {catalogVarietyItems.length} varieties
              </button>
            </div>
          )}
        </section>
      )}

      {/* PAGINATION CONTROLS */}
      {!preview && total > 0 && viewMode !== "catalogue" && (
        <div className="mandi-pagination-bar">
          <div className="mandi-pagination-info">
            Showing records <b>{(currentPage - 1) * pageSize + 1}</b> – <b>{Math.min(currentPage * pageSize, total)}</b> of <b>{total.toLocaleString("en-IN")}</b> official records
          </div>

          <div className="mandi-pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(1)}
              title="First page"
            >
              « First
            </button>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              title="Previous page"
            >
              ‹ Prev
            </button>

            {/* Quick jump page numbers */}
            {(() => {
              const pages = []
              const start = Math.max(1, currentPage - 2)
              const end = Math.min(totalPages, currentPage + 2)
              for (let p = start; p <= end; p++) {
                pages.push(
                  <button
                    key={p}
                    type="button"
                    className={`pagination-btn ${p === currentPage ? "active" : ""}`}
                    onClick={() => handlePageChange(p)}
                    disabled={loading}
                  >
                    {p}
                  </button>
                )
              }
              return pages
            })()}

            <span className="pagination-current">
              Page <b>{currentPage}</b> of <b>{totalPages}</b>
            </span>

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              title="Next page"
            >
              Next ›
            </button>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(totalPages)}
              title="Last page"
            >
              Last »
            </button>

            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              style={{
                marginLeft: "8px",
                padding: "4px 8px",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                fontSize: "11px",
                background: "#fff",
                color: "#334155"
              }}
              title="Records per page"
            >
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
              <option value={96}>96 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Preview mode "View All" Button */}
      {preview && onViewAll && (
        <button className="crop-card-more" onClick={onViewAll} style={{ width: "100%", marginTop: "12px", cursor: "pointer" }}>
          View all current market prices &amp; full AGMARKNET directory ({total !== null ? total.toLocaleString("en-IN") : "16,000+"} records) →
        </button>
      )}

      <p className="official-source" style={{ marginTop: "20px" }}>
        Source:{" "}
        <a href="https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi" target="_blank" rel="noreferrer">
          Government of India — AGMARKNET (Ministry of Agriculture &amp; Farmers Welfare · data.gov.in) ↗
        </a>{" "}
        · All displayed rates are official APMC wholesale mandi transactions in ₹ per quintal.
      </p>
    </div>
  )
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
