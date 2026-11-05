import { useCallback, useEffect, useMemo, useState } from "react"
import { translateCrop, translateCategory, translateUnit, t as defaultTranslate } from "./i18n.js"
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

export default function OfficialPrices({ location, preview = false, onViewAll, farmerListings = [], onSelectListing, lang = "English", t = (k) => defaultTranslate(k, lang) }) {
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
  const [internalListings, setInternalListings] = useState([])
  const [selectedCropDetail, setSelectedCropDetail] = useState(null)

  useEffect(() => {
    if (!farmerListings || farmerListings.length === 0) {
      fetch("/api/listings")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.listings)) {
            setInternalListings(data.listings)
          }
        })
        .catch(err => console.warn("Could not fetch farmer listings:", err.message))
    }
  }, [farmerListings])

  const activeFarmerListings = useMemo(() => {
    return (Array.isArray(farmerListings) && farmerListings.length > 0)
      ? farmerListings
      : internalListings
  }, [farmerListings, internalListings])

  const normalizeString = useCallback(str => {
    return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim()
  }, [])

  const matchFarmerListingsForCrop = useCallback((listingsList, targetCommodity, targetVariety) => {
    if (!Array.isArray(listingsList) || !targetCommodity) return []
    const commNorm = normalizeString(targetCommodity)
    const varNorm = normalizeString(targetVariety)

    return listingsList.filter(item => {
      const itemCropNorm = normalizeString(item.crop)
      if (!itemCropNorm) return false

      const cropMatches = itemCropNorm === commNorm || 
        itemCropNorm.includes(commNorm) || 
        commNorm.includes(itemCropNorm)
      if (!cropMatches) return false

      if (!varNorm) return true

      const itemVarNorm = normalizeString(item.variety)
      if (!itemVarNorm) {
        const genericVarieties = ["other", "local", "common", "faq", "general", "standard"]
        return genericVarieties.includes(varNorm)
      }

      if (itemVarNorm === varNorm) return true
      if (varNorm.length >= 3 && itemVarNorm.includes(varNorm)) return true
      if (itemVarNorm.length >= 3 && varNorm.includes(itemVarNorm)) return true

      const genericVarieties = ["other", "local", "common", "faq", "general", "standard"]
      if (genericVarieties.includes(varNorm) && genericVarieties.includes(itemVarNorm)) return true

      return false
    })
  }, [normalizeString])

  const officialRecordsForSelectedCrop = useMemo(() => {
    if (!selectedCropDetail?.commodity) return []
    const commNorm = normalizeString(selectedCropDetail.commodity)
    const varNorm = normalizeString(selectedCropDetail.variety)

    return allRecords.filter(r => {
      const rCommNorm = normalizeString(r.commodity)
      if (rCommNorm !== commNorm && !rCommNorm.includes(commNorm) && !commNorm.includes(rCommNorm)) {
        return false
      }
      if (varNorm) {
        const rVarNorm = normalizeString(r.variety)
        if (rVarNorm !== varNorm && !rVarNorm.includes(varNorm) && !varNorm.includes(rVarNorm)) {
          return false
        }
      }
      return true
    })
  }, [allRecords, selectedCropDetail, normalizeString])

  const farmerListingsForSelectedCrop = useMemo(() => {
    if (!selectedCropDetail?.commodity) return []
    return matchFarmerListingsForCrop(
      activeFarmerListings,
      selectedCropDetail.commodity,
      selectedCropDetail.variety
    )
  }, [activeFarmerListings, selectedCropDetail, matchFarmerListingsForCrop])

  const handleOpenFarmerDetails = useCallback((listing) => {
    if (typeof onSelectListing === "function") {
      onSelectListing(listing)
    }
  }, [onSelectListing])

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
                  <article
    className="listing-card mandi-listing-card"
    key={cardKey}
    style={{ cursor: "pointer" }}
    onClick={() => {
      setSelectedCropDetail({
        commodity: r.commodity,
        variety: r.variety,
        category: categoryName,
        record: r
      })
    }}
  >
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
                        
                      </div>
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
                  <article
    className="crop-price-card"
    key={cardKey}
    style={{ cursor: "pointer" }}
    onClick={() => {
      setSelectedCropDetail({
        commodity: r.commodity,
        variety: r.variety,
        category: categoryName,
        record: r
      })
    }}
  >
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
                <th>{t("Date")}</th>
                <th>{t("Commodity")}</th>
                <th>{t("Variety")}</th>
                <th>{t("Grade")}</th>
                <th>{t("State")}</th>
                <th>{t("District")}</th>
                <th>{t("Market / Mandi")}</th>
                <th>Price Type / Source</th>
                <th>{t("Min Price")}</th>
                <th>{t("Max Price")}</th>
                <th>{t("Modal Price")} / {t("Unit")}</th>
                <th>Market &amp; Farmer Details</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const badge = getPriceBadge(r)
                const formattedDate = (r.arrival_date && r.arrival_date !== "Date unavailable") ? r.arrival_date : "Date unavailable"
                return (
                  <tr
  key={[r.state, r.district, r.market, r.commodity, r.variety, r.arrival_date, i].join("-")}
  style={{ cursor: "pointer" }}
  onClick={() => {
    setSelectedCropDetail({
      commodity: r.commodity,
      variety: r.variety,
      category: r.category,
      record: r
    })
  }}
>
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


      {/* IN-PAGE FARMER LISTINGS SECTION (when commodity is filtered) */}
      {applied.commodity && (
        <section className="inpage-farmer-listings-section" style={{ margin: "24px 0" }}>
          <div className="section-title-bar farmer-bar">
            <div className="section-title-left">
              <span className="section-icon">🚜</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#166534" }}>
                  B. Farmer Listings for {applied.commodity} {applied.variety ? `(${applied.variety})` : ""}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#4b5563" }}>
                  Direct farmgate produce available from registered farmers matching this crop
                </p>
              </div>
            </div>
            <span className="section-count-badge farmer-count">
              {matchFarmerListingsForCrop(activeFarmerListings, applied.commodity, applied.variety).length} Farmer Listing{matchFarmerListingsForCrop(activeFarmerListings, applied.commodity, applied.variety).length === 1 ? "" : "s"}
            </span>
          </div>

          {matchFarmerListingsForCrop(activeFarmerListings, applied.commodity, applied.variety).length > 0 ? (
            <div className="farmer-listings-split-grid" style={{ marginTop: "14px" }}>
              {matchFarmerListingsForCrop(activeFarmerListings, applied.commodity, applied.variety).map(item => {
                const categoryName = item.category || getCategoryForCommodity(item.crop)
                const fallbackImg = resolveCommodityImage(item.crop)
                const displayImg = item.image || fallbackImg.url

                return (
                  <article className="farmer-split-card" key={`inpage-listing-${item.id}`}>
                    <div className="farmer-split-card-header">
                      <div className="farmer-id-row">
                        <span className="farmer-avatar-badge">🧑‍🌾</span>
                        <div>
                          <b className="farmer-name-text">{item.farmerName || "Registered Farmer"}</b>
                          <span className="farmer-crop-type-sub">
                            {item.crop} · {item.variety || "Local / Standard"}
                          </span>
                        </div>
                      </div>
                      <div className="farmer-badges-row">
                        <span className="badge-farmer-direct">🚜 Farmgate Direct</span>
                        <span className="badge-farming-method">{item.organic || "Conventional"}</span>
                        <span className="badge-grade">Grade: {item.grade || "FAQ"}</span>
                      </div>
                    </div>

                    <div className="farmer-split-card-body">
                      <div className="farmer-split-thumb-box">
                        <img
                          src={displayImg}
                          alt={item.crop}
                          loading="lazy"
                          className="farmer-split-thumb"
                          onError={e => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = getCategorySvgDataUri(categoryName, item.crop)
                          }}
                        />
                        {item.imageSource === "farmer" && (
                          <span className="thumb-farmer-verified-tag">📸 Farmer Photo</span>
                        )}
                      </div>

                      <div className="farmer-split-details-col">
                        <div className="farmer-price-qty-bar">
                          <div>
                            <small className="label-asking-price">Farmer's Asking Price</small>
                            <div className="farmer-asking-price">
                              <b>₹{Number(item.price || 0).toLocaleString("en-IN")}</b>
                              <span className="price-unit-text">/ {item.priceUnit || item.unit || "kg"}</span>
                            </div>
                          </div>
                          <div>
                            <small className="label-asking-price">Available Quantity</small>
                            <div className="farmer-qty-value">
                              <b>{item.quantity}</b> {item.unit || "kg"}
                            </div>
                          </div>
                          {item.minOrder && (
                            <div>
                              <small className="label-asking-price">Min. Order</small>
                              <div className="farmer-qty-value">
                                {item.minOrder} {item.unit || "kg"}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="farmer-dates-bar">
                          <div className="date-item">
                            <span className="date-icon">🌾</span>
                            <span>Harvest Date: <b>{item.harvestDate || "Not specified"}</b></span>
                          </div>
                          <div className="date-item">
                            <span className="date-icon">📦</span>
                            <span>Available From: <b>{item.availableFrom || "Immediate"}</b></span>
                          </div>
                          <div className="date-item">
                            <span className="date-icon">⏳</span>
                            <span>Available Until / Expiry: <b>{item.expiryDate || item.date || "Not specified"}</b></span>
                          </div>
                        </div>

                        <div className="farmer-location-box">
                          <small className="location-box-title">📍 Farmgate Pickup Location</small>
                          <p className="farmer-full-address">
                            {item.address || item.farmerLocation || "Direct farmgate pickup"}
                          </p>
                          <div className="location-spec-chips">
                            {(item.village || item.locality) && (
                              <span className="loc-chip">🏘️ Locality: {item.village || item.locality}</span>
                            )}
                            {item.city && (
                              <span className="loc-chip">🏙️ City: {item.city}</span>
                            )}
                            {(item.district || item.farmerDistrict) && (
                              <span className="loc-chip">🗺️ District: {item.district || item.farmerDistrict}</span>
                            )}
                            {(item.state || item.farmerState) && (
                              <span className="loc-chip">🌐 State: {item.state || item.farmerState}</span>
                            )}
                            {item.pincode && (
                              <span className="loc-chip">📮 PIN: {item.pincode}</span>
                            )}
                          </div>
                        </div>

                        <div className="farmer-split-actions">
                          <button
                            type="button"
                            className="btn-view-farmer-crop-details"
                            onClick={() => handleOpenFarmerDetails(item)}
                            title="Open full dynamic crop details with WhatsApp contact and order options"
                          >
                            🔍 View Complete Crop Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="no-farmer-listings-box">
              <span className="empty-farmer-icon">🧑‍🌾</span>
              <h4>No farmer listings currently available for this variety.</h4>
              <p>There are currently no active farmgate listings for {applied.commodity} {applied.variety ? `(${applied.variety})` : ""}.</p>
              <small>Check other varieties of {applied.commodity} or explore all available produce in the Farmer Marketplace.</small>
            </div>
          )}
        </section>
      )}

      {/* Preview mode "View All" Button */}
      {preview && onViewAll && (
        <button className="crop-card-more" onClick={onViewAll} style={{ width: "100%", marginTop: "12px", cursor: "pointer" }}>
          View all current market prices &amp; full AGMARKNET directory ({total !== null ? total.toLocaleString("en-IN") : "16,000+"} records) →
        </button>
      )}


      {/* =========================================================================
          DYNAMIC MARKET & FARMER DETAILS MODAL (DUAL SECTIONS: AGMARKNET + FARMER)
         ========================================================================= */}
      {selectedCropDetail && (
        <div className="market-farmer-modal-overlay" onClick={() => setSelectedCropDetail(null)}>
          <div className="market-farmer-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-crop-title">
            <div className="market-farmer-topbar">
              <div className="topbar-left">
                <button
                  type="button"
                  className="btn-back-market-farmer"
                  onClick={() => setSelectedCropDetail(null)}
                >
                  ← Back to Market Prices
                </button>
                <span className="market-farmer-title" id="modal-crop-title">
                  🌾 Market Prices &amp; Farmer Listings · {selectedCropDetail.commodity} {selectedCropDetail.variety ? `(${selectedCropDetail.variety})` : ""}
                </span>
              </div>
              <button
                type="button"
                className="btn-close-market-farmer"
                onClick={() => setSelectedCropDetail(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="market-farmer-content">
              {/* SECTION A: OFFICIAL AGMARKNET MARKET INFORMATION */}
              <section className="market-farmer-section section-official">
                <div className="section-title-bar official-bar">
                  <div className="section-title-left">
                    <span className="section-icon">🏛️</span>
                    <div>
                      <h3>A. Official AGMARKNET Market Information</h3>
                      <p>Original Government of India APMC wholesale mandi price records (Preserved per reporting mandi)</p>
                    </div>
                  </div>
                  <span className="section-count-badge official-count">
                    {officialRecordsForSelectedCrop.length} Reporting Mandi Record{officialRecordsForSelectedCrop.length === 1 ? "" : "s"}
                  </span>
                </div>

                {officialRecordsForSelectedCrop.length > 0 ? (
                  <div className="official-mandi-records-container">
                    <div className="table-responsive">
                      <table className="official-mandi-detail-table">
                        <thead>
                          <tr>
                            <th>Mandi / Market</th>
                            <th>State &amp; District</th>
                            <th>Commodity &amp; Variety</th>
                            <th>Grade</th>
                            <th>Arrival Date</th>
                            <th>Min Price</th>
                            <th>Max Price</th>
                            <th>Modal Price (Benchmark)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {officialRecordsForSelectedCrop.map((r, mIdx) => {
                            const badge = getPriceBadge(r)
                            return (
                              <tr key={`mandi-rec-${r.state}-${r.district}-${r.market}-${r.arrival_date}-${mIdx}`}>
                                <td>
                                  <strong className="mandi-name-highlight">{r.market}</strong>
                                  <small className="mandi-source-sub">{r.source_name || "AGMARKNET"}</small>
                                </td>
                                <td>
                                  <span>{r.district ? `${r.district}, ` : ""}{r.state}</span>
                                </td>
                                <td>
                                  <b style={{ color: "#1e3a24" }}>{r.commodity}</b>
                                  <span style={{ display: "block", fontSize: "11px", color: "#475569" }}>
                                    {r.variety || "Other"}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge-grade">{r.grade || "FAQ"}</span>
                                </td>
                                <td>
                                  <span className="badge-packaging">📅 {r.arrival_date || "Date unavailable"}</span>
                                </td>
                                <td className="price-min">
                                  ₹{Number(r.min_price).toLocaleString("en-IN")}
                                </td>
                                <td className="price-max">
                                  ₹{Number(r.max_price).toLocaleString("en-IN")}
                                </td>
                                <td className="price-modal">
                                  <b className="modal-price-val">₹{Number(r.modal_price).toLocaleString("en-IN")}</b>
                                  <small className="unit-label">/ {r.price_unit ? r.price_unit.replace(/^₹\/?/, "") : (r.unit ? r.unit.replace(/^₹\/?/, "") : "quintal")}</small>
                                  <span className="verified-mandi-badge" style={{ background: badge.bg }}>
                                    {badge.verifiedText}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="no-official-records-notice">
                    <p>No active wholesale mandi report recorded for this specific variety in today's session.</p>
                    <small>Registered in the official Government of India AGMARKNET catalogue across all 3,115 varieties.</small>
                  </div>
                )}
              </section>

              {/* SECTION B: FARMER LISTINGS FOR THIS CROP */}
              <section className="market-farmer-section section-farmers">
                <div className="section-title-bar farmer-bar">
                  <div className="section-title-left">
                    <span className="section-icon">🚜</span>
                    <div>
                      <h3>B. Farmer Listings for This Crop</h3>
                      <p>
                        Direct farmgate produce listed by verified farmers matching {selectedCropDetail.commodity} {selectedCropDetail.variety ? `(${selectedCropDetail.variety})` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="section-count-badge farmer-count">
                    {farmerListingsForSelectedCrop.length} Farmer Listing{farmerListingsForSelectedCrop.length === 1 ? "" : "s"} Available
                  </span>
                </div>

                {farmerListingsForSelectedCrop.length > 0 ? (
                  <div className="farmer-listings-split-grid">
                    {farmerListingsForSelectedCrop.map(item => {
                      const categoryName = item.category || getCategoryForCommodity(item.crop)
                      const fallbackImg = resolveCommodityImage(item.crop)
                      const displayImg = item.image || fallbackImg.url

                      return (
                        <article className="farmer-split-card" key={`split-listing-${item.id}`}>
                          <div className="farmer-split-card-header">
                            <div className="farmer-id-row">
                              <span className="farmer-avatar-badge">🧑‍🌾</span>
                              <div>
                                <b className="farmer-name-text">{item.farmerName || "Registered Farmer"}</b>
                                <span className="farmer-crop-type-sub">
                                  {item.crop} · {item.variety || "Local / Standard"}
                                </span>
                              </div>
                            </div>
                            <div className="farmer-badges-row">
                              <span className="badge-farmer-direct">🚜 Farmgate Direct</span>
                              <span className="badge-farming-method">{item.organic || "Conventional"}</span>
                              <span className="badge-grade">Grade: {item.grade || "FAQ"}</span>
                            </div>
                          </div>

                          <div className="farmer-split-card-body">
                            <div className="farmer-split-thumb-box">
                              <img
                                src={displayImg}
                                alt={item.crop}
                                loading="lazy"
                                className="farmer-split-thumb"
                                onError={e => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = getCategorySvgDataUri(categoryName, item.crop)
                                }}
                              />
                              {item.imageSource === "farmer" && (
                                <span className="thumb-farmer-verified-tag">📸 Farmer Photo</span>
                              )}
                            </div>

                            <div className="farmer-split-details-col">
                              <div className="farmer-price-qty-bar">
                                <div>
                                  <small className="label-asking-price">Farmer's Asking Price</small>
                                  <div className="farmer-asking-price">
                                    <b>₹{Number(item.price || 0).toLocaleString("en-IN")}</b>
                                    <span className="price-unit-text">/ {item.priceUnit || item.unit || "kg"}</span>
                                  </div>
                                </div>
                                <div>
                                  <small className="label-asking-price">Available Quantity</small>
                                  <div className="farmer-qty-value">
                                    <b>{item.quantity}</b> {item.unit || "kg"}
                                  </div>
                                </div>
                                {item.minOrder && (
                                  <div>
                                    <small className="label-asking-price">Min. Order</small>
                                    <div className="farmer-qty-value">
                                      {item.minOrder} {item.unit || "kg"}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="farmer-dates-bar">
                                <div className="date-item">
                                  <span className="date-icon">🌾</span>
                                  <span>Harvest Date: <b>{item.harvestDate || "Not specified"}</b></span>
                                </div>
                                <div className="date-item">
                                  <span className="date-icon">📦</span>
                                  <span>Available From: <b>{item.availableFrom || "Immediate"}</b></span>
                                </div>
                                <div className="date-item">
                                  <span className="date-icon">⏳</span>
                                  <span>Available Until / Expiry: <b>{item.expiryDate || item.date || "Not specified"}</b></span>
                                </div>
                              </div>

                              <div className="farmer-location-box">
                                <small className="location-box-title">📍 Farmgate Pickup Location</small>
                                <p className="farmer-full-address">
                                  {item.address || item.farmerLocation || "Direct farmgate pickup"}
                                </p>
                                <div className="location-spec-chips">
                                  {(item.village || item.locality) && (
                                    <span className="loc-chip">🏘️ Locality: {item.village || item.locality}</span>
                                  )}
                                  {item.city && (
                                    <span className="loc-chip">🏙️ City: {item.city}</span>
                                  )}
                                  {(item.district || item.farmerDistrict) && (
                                    <span className="loc-chip">🗺️ District: {item.district || item.farmerDistrict}</span>
                                  )}
                                  {(item.state || item.farmerState) && (
                                    <span className="loc-chip">🌐 State: {item.state || item.farmerState}</span>
                                  )}
                                  {item.pincode && (
                                    <span className="loc-chip">📮 PIN: {item.pincode}</span>
                                  )}
                                </div>
                              </div>

                              <div className="farmer-split-actions">
                                <button
                                  type="button"
                                  className="btn-view-farmer-crop-details"
                                  onClick={() => handleOpenFarmerDetails(item)}
                                  title="Open full dynamic crop details with WhatsApp contact and order options"
                                >
                                  🔍 View Complete Crop Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                ) : (
                  <div className="no-farmer-listings-box">
                    <span className="empty-farmer-icon">🧑‍🌾</span>
                    <h4>No farmer listings currently available for this variety.</h4>
                    <p>There are currently no active farmgate listings for {selectedCropDetail.commodity} {selectedCropDetail.variety ? `(${selectedCropDetail.variety})` : ""}.</p>
                    <small>Check other varieties of {selectedCropDetail.commodity} or explore all available produce in the Farmer Marketplace.</small>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
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
