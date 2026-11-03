import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const envFile = path.join(root, ".env")
const dataDir = path.join(root, "data")
const catalogueFile = path.join(dataDir, "agmarknet-catalogue.json")
const tempCatalogueFile = path.join(dataDir, "agmarknet-catalogue.tmp.json")
const mandiHistoryFile = path.join(dataDir, "mandi-history.json")
const baselineFile = path.join(dataDir, "user-baselines.json")
const masterFile = path.join(dataDir, "commodity-master.json")
const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"

// Load environment variables
try {
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  }
} catch (e) {
  console.warn("Could not read .env:", e.message)
}

const key = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY
if (!key) {
  console.error("DATA_GOV_API_KEY is missing from backend/.env")
  process.exit(1)
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function normalizeKey(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function categoryForCommodity(name) {
  const value = String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  if (/redchilli|chillired|drychilli|chillidry/.test(value)) return "Spices and Condiments"
  const categories = [
    ["Cereals and Grains", /wheat|rice|paddy|maize|corn|jowar|sorghum|bajra|ragi|barley|oat|millet|cheena|kangni|kodon|sanwa/],
    ["Pulses and Legumes", /gram|chana|chickpea|lentil|masur|moong|mung|urd|arhar|tur|pea|cowpea|lobia|kulthi|rajma|moth/],
    ["Dry Fruits and Nuts", /almond|badam|cashew|pistachio|pista|walnut|akhrot|raisin|kismis|date|khajoor|fig|anjeer|apricot|khubani/],
    ["Oilseeds", /groundnut|soyabean|soybean|mustard|sarson|rai|sunflower|sesame|til|gingelly|castor|linseed|alsi|safflower|kardi|niger/],
    ["Processed Agricultural Products", /oil|coconutoil|mustardoil|sunfloweroil|jaggery|gur/],
    ["Fruits", /apple|mango|banana|orange|grape|guava|papaya|pomegranate|watermelon|muskmelon|pineapple|coconut|lemon|lime|jackfruit|sapota|litchi|strawberry|sweetlime|pear|peach|plum|aonla|amla|fig|kiwi|fruit/],
    ["Vegetables", /tomato|potato|onion|garlic|ginger|brinjal|eggplant|cabbage|cauliflower|carrot|beans|bhindi|okra|chilli|chili|cucumber|pumpkin|gourd|drumstick|radish|raddish|beetroot|spinach|palak|methi|vegetable/],
    ["Spices and Condiments", /turmeric|haldi|chilli|chili|ginger|sonth|garlic|coriander|dhania|cumin|jeera|pepper|cardamom|elaichi|clove|laung|cinnamon|dalchini|fennel|saunf|fenugreek|ajwain|nutmeg|mace|spice/],
    ["Fibre Crops", /cotton|kapas|jute|sunnhemp|hemp/],
    ["Commercial and Plantation Crops", /sugarcane|tobacco|arecanut|supari|rubber|coffee|tea/],
    ["Flowers", /marigold|genda|rose|gulab|jasmine|mogra|chrysanthemum|tuberose|gladiolus/]
  ]
  return categories.find(([, pattern]) => pattern.test(value))?.[0] || "Other Agricultural Products"
}

export async function refreshCatalogue() {
  console.log("=== Starting Cumulative AGMARKNET Catalogue Refresh ===")
  console.log("Resource ID:", resourceId)

  // 1. Data structures for cumulative storage
  const commoditiesMap = new Map() // normKey -> Commodity Object
  const statesMap = new Map()      // state -> Map(district -> Set(market))
  const allHistoricalRows = []
  const seenHistoricalKeys = new Set()

  // Track earliest and latest observation dates
  let earliestDate = "2025-05-19"
  let latestDate = "2026-10-31"

  // 2. Load Existing Catalogue if present (Cumulative base)
  if (existsSync(catalogueFile)) {
    try {
      const existing = JSON.parse(readFileSync(catalogueFile, "utf8"))
      if (existing && Array.isArray(existing.commodities)) {
        console.log(`Loaded ${existing.commodities.length} existing commodities from previous catalogue.`)
        for (const c of existing.commodities) {
          const key = normalizeKey(c.name)
          const vMap = new Map()
          if (Array.isArray(c.varieties)) {
            for (const v of c.varieties) {
              const vName = typeof v === "string" ? v : v.name
              const vNorm = normalizeKey(vName)
              vMap.set(vNorm, typeof v === "object" ? { ...v, active_today: false } : {
                name: vName,
                variety_id: null,
                registered: true,
                observed_in_history: true,
                active_today: false,
                source: "AGMARKNET"
              })
            }
          }
          commoditiesMap.set(key, {
            id: c.id,
            name: c.name,
            agmarknet_name: c.agmarknet_name || c.name,
            display_name: c.display_name || c.name,
            aliases: c.aliases || [],
            category: c.category || categoryForCommodity(c.name),
            group_id: c.group_id,
            group_name: c.group_name || c.category,
            varietiesMap: vMap,
            grades: new Set(c.grades || []),
            languages: c.languages || [],
            is_msp: Boolean(c.is_msp),
            arrival_unit: c.arrival_unit || "Tonne",
            price_unit: c.price_unit || "Quintal",
            first_seen: c.first_seen || "2025-05-19",
            last_seen: c.last_seen || "31/10/2026",
            active_today: false, // will become true if observed in today's daily arrivals
            provenance: c.provenance || "Government of India AGMARKNET",
            source: c.source || "AGMARKNET"
          })
        }
      }
      if (existing && typeof existing.states === "object") {
        for (const [st, stData] of Object.entries(existing.states)) {
          if (!statesMap.has(st)) statesMap.set(st, new Map())
          const dMap = statesMap.get(st)
          if (stData && typeof stData.districts === "object") {
            for (const [dist, mrkts] of Object.entries(stData.districts)) {
              if (!dMap.has(dist)) dMap.set(dist, new Set())
              const mSet = dMap.get(dist)
              if (Array.isArray(mrkts)) {
                for (const m of mrkts) mSet.add(m)
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not read previous catalogue file:", e.message)
    }
  }

  // 3. Ingest Government Historical Baseline (user-baselines.json from commodity_price.csv)
  if (existsSync(baselineFile)) {
    try {
      const bData = JSON.parse(readFileSync(baselineFile, "utf8"))
      const bDate = bData.date || "2025-05-19"
      if (bData && typeof bData.baselines === "object") {
        console.log(`Ingesting ${Object.keys(bData.baselines).length} commodities from historical AGMARKNET baseline (${bDate})...`)
        for (const [rawName] of Object.entries(bData.baselines)) {
          const formatted = rawName.charAt(0).toUpperCase() + rawName.slice(1)
          const key = normalizeKey(formatted)
          if (!commoditiesMap.has(key)) {
            commoditiesMap.set(key, {
              name: formatted,
              agmarknet_name: formatted,
              category: categoryForCommodity(formatted),
              varieties: new Set(["Standard"]),
              grades: new Set(["FAQ"]),
              first_seen: bDate,
              last_seen: bDate,
              active_today: false,
              provenance: "AGMARKNET Mandi Baseline (commodity_price.csv)",
              source: "Government of India (AGMARKNET)"
            })
          } else {
            const entry = commoditiesMap.get(key)
            if (!entry.first_seen || entry.first_seen > bDate) entry.first_seen = bDate
          }
        }
      }
    } catch (err) {
      console.warn("Could not parse user-baselines.json:", err.message)
    }
  }

  // 4. Ingest DMI AGMARKNET / e-NAM Official Mandi Registry (commodity-master.json)
  if (existsSync(masterFile)) {
    try {
      const mData = JSON.parse(readFileSync(masterFile, "utf8"))
      if (Array.isArray(mData)) {
        console.log(`Merging ${mData.length} statutory DMI AGMARKNET / e-NAM gazetted commodities...`)
        for (const item of mData) {
          const key = normalizeKey(item.commodity)
          const agmarknetKey = item.agmarknet_name ? normalizeKey(item.agmarknet_name) : key

          const targetKey = commoditiesMap.has(agmarknetKey) ? agmarknetKey : (commoditiesMap.has(key) ? key : agmarknetKey)

          if (!commoditiesMap.has(targetKey)) {
            // New statutory commodity not yet seen in today's active arrivals
            commoditiesMap.set(targetKey, {
              name: item.commodity,
              agmarknet_name: item.agmarknet_name || item.commodity,
              category: item.category || categoryForCommodity(item.commodity),
              varieties: new Set(item.varieties || ["Standard"]),
              grades: new Set(["FAQ", "Grade Range-1"]),
              first_seen: "2025-05-19",
              last_seen: "2025-05-19",
              active_today: false,
              provenance: "Directorate of Marketing & Inspection (DMI AGMARKNET Registry)",
              source: item.source || "DMI AGMARKNET / e-NAM Standard Registry"
            })
          } else {
            // Merge official trade varieties into observed commodity
            const entry = commoditiesMap.get(targetKey)
            if (Array.isArray(item.varieties)) {
              for (const v of item.varieties) entry.varieties.add(v)
            }
            if (item.agmarknet_name) entry.agmarknet_name = item.agmarknet_name
            if (item.category) entry.category = item.category
          }
        }
      }
    } catch (err) {
      console.warn("Could not read commodity-master.json:", err.message)
    }
  }

  // 5. Fetch and Merge Today's Official AGMARKNET Records from data.gov.in
  let totalRecordsScanned = 0
  let totalPagesScanned = 0
  let reportedApiTotal = null
  let apiSucceeded = false

  const pageSize = 1000
  let offset = 0

  try {
    while (true) {
      const url = new URL("https://api.data.gov.in/resource/" + resourceId)
      url.searchParams.set("api-key", key)
      url.searchParams.set("format", "json")
      url.searchParams.set("limit", String(pageSize))
      url.searchParams.set("offset", String(offset))

      console.log(`Fetching Government API page ${totalPagesScanned + 1} (offset: ${offset}, limit: ${pageSize})...`)
      let response = null
      let retries = 3
      while (retries > 0) {
        try {
          response = await fetch(url, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(30000)
          })
          if (response.ok) break
          console.warn(`HTTP ${response.status} from API, retrying... (${retries - 1} left)`)
        } catch (fetchErr) {
          console.warn(`Fetch error (${fetchErr.message}), retrying... (${retries - 1} left)`)
        }
        retries--
        if (retries > 0) await sleep(1500)
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to fetch page after retries. Last status: ${response ? response.status : "network error"}`)
      }

      const payload = await response.json()
      apiSucceeded = true

      if (reportedApiTotal === null && Number.isFinite(Number(payload.total))) {
        reportedApiTotal = Number(payload.total)
        console.log(`Official total records reported by Government API: ${reportedApiTotal}`)
      }

      const records = Array.isArray(payload.records) ? payload.records : []
      if (records.length === 0) {
        console.log("End of live records stream.")
        break
      }

      for (const row of records) {
        totalRecordsScanned++
        const comm = String(row.commodity || "").trim()
        if (!comm) continue

        const key = normalizeKey(comm)
        if (!commoditiesMap.has(key)) {
          commoditiesMap.set(key, {
            name: comm,
            agmarknet_name: comm,
            category: categoryForCommodity(comm),
            varieties: new Set(),
            grades: new Set(),
            first_seen: String(row.arrival_date || "31/10/2026"),
            last_seen: String(row.arrival_date || "31/10/2026"),
            active_today: true,
            provenance: "Government of India AGMARKNET (data.gov.in / DMI)",
            source: "AGMARKNET Daily Mandi Feed (data.gov.in)"
          })
        }

        const commEntry = commoditiesMap.get(key)
        commEntry.active_today = true
        if (row.arrival_date) {
          commEntry.last_seen = String(row.arrival_date)
          if (!commEntry.first_seen) commEntry.first_seen = String(row.arrival_date)
          latestDate = String(row.arrival_date)
        }

        const variety = String(row.variety || "").trim()
        if (variety && commEntry.varietiesMap) {
          const vNorm = normalizeKey(variety)
          if (!commEntry.varietiesMap.has(vNorm)) {
            commEntry.varietiesMap.set(vNorm, {
              name: variety,
              variety_id: null,
              registered: false,
              observed_in_history: true,
              active_today: true,
              source: "AGMARKNET Daily Mandi Arrival Record"
            })
          } else {
            const vObj = commEntry.varietiesMap.get(vNorm)
            vObj.observed_in_history = true
            vObj.active_today = true
          }
        }

        const grade = String(row.grade || "").trim()
        if (grade) commEntry.grades.add(grade)

        const state = String(row.state || "").trim()
        const district = String(row.district || "").trim()
        const market = String(row.market || "").trim()

        if (state) {
          if (!statesMap.has(state)) statesMap.set(state, new Map())
          const stateDistricts = statesMap.get(state)
          if (district) {
            if (!stateDistricts.has(district)) stateDistricts.set(district, new Set())
            if (market) stateDistricts.get(district).add(market)
          }
        }

        // Store clean historical record for mandi-history.json
        const cleanHist = {
          state, district, market,
          commodity: comm,
          variety, grade,
          arrival_date: String(row.arrival_date || ""),
          min_price: Number(row.min_price || 0),
          modal_price: Number(row.modal_price || 0),
          max_price: Number(row.max_price || 0)
        }
        const histKey = [state, district, market, comm, variety, cleanHist.arrival_date].join("|")
        if (!seenHistoricalKeys.has(histKey) && cleanHist.modal_price > 0) {
          seenHistoricalKeys.add(histKey)
          allHistoricalRows.push(cleanHist)
        }
      }

      totalPagesScanned++
      offset += records.length

      if (records.length < pageSize || (reportedApiTotal && offset >= reportedApiTotal)) {
        console.log(`Reached end of available records (offset ${offset} >= total ${reportedApiTotal}).`)
        break
      }

      await sleep(350)
    }
  } catch (err) {
    console.error("API error during catalogue refresh:", err.message)
    if (!apiSucceeded && !existsSync(catalogueFile)) {
      console.error("Critical: Could not reach Government API and no catalogue exists.")
      process.exit(1)
    }
    console.warn("Proceeding with cumulative aggregation of records preserved so far.")
  }

  // 6. Build final sorted cumulative catalogue
  const sortedCommodities = Array.from(commoditiesMap.values())
    .map(c => {
      const varietyObjects = Array.from(c.varietiesMap ? c.varietiesMap.values() : []).sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
      const varietyNames = varietyObjects.map(v => v.name)
      const registeredVarieties = varietyObjects.filter(v => v.registered).map(v => ({ variety_id: v.variety_id, name: v.name }))
      const historicalVarieties = varietyObjects.filter(v => v.observed_in_history).map(v => v.name)
      const currentArrivalVarieties = varietyObjects.filter(v => v.active_today).map(v => v.name)
      const grds = Array.from(c.grades).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
      return {
        id: c.id,
        name: c.name,
        agmarknet_name: c.agmarknet_name || c.name,
        display_name: c.display_name || c.name,
        group_id: c.group_id,
        group_name: c.group_name || c.category,
        category: c.category || categoryForCommodity(c.name),
        is_msp: Boolean(c.is_msp),
        arrival_unit: c.arrival_unit || "Tonne",
        price_unit: c.price_unit || "Quintal",
        aliases: c.aliases || [],
        varieties: varietyObjects,
        variety_names: varietyNames,
        registered_varieties: registeredVarieties,
        historical_varieties: historicalVarieties,
        current_arrival_varieties: currentArrivalVarieties,
        variety_count: varietyObjects.length,
        registered_variety_count: registeredVarieties.length,
        historical_variety_count: historicalVarieties.length,
        current_arrivals_count: currentArrivalVarieties.length,
        grades: grds,
        languages: c.languages || [],
        first_seen: c.first_seen,
        last_seen: c.last_seen,
        active_today: Boolean(c.active_today),
        provenance: c.provenance || "Government of India AGMARKNET",
        source: c.source || "AGMARKNET"
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))

  let totalRegisteredCount = 0
  let totalHistoricalCount = 0
  let totalArrivalsCount = 0
  const allUniqueVarieties = new Set()
  const allUniqueGrades = new Set()

  for (const c of sortedCommodities) {
    totalRegisteredCount += c.registered_variety_count
    totalHistoricalCount += c.historical_variety_count
    totalArrivalsCount += c.current_arrivals_count
    for (const v of c.variety_names) allUniqueVarieties.add(v)
    for (const g of c.grades) allUniqueGrades.add(g)
  }

  const formattedStates = {}
  let totalDistrictsCount = 0
  let totalMarketsCount = 0

  for (const [state, distMap] of statesMap.entries()) {
    formattedStates[state] = { districts: {} }
    for (const [dist, mrktSet] of distMap.entries()) {
      totalDistrictsCount++
      const mrkts = Array.from(mrktSet).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
      totalMarketsCount += mrkts.length
      formattedStates[state].districts[dist] = mrkts
    }
  }

  const catalogue = {
    updated_at: new Date().toISOString(),
    source: "Government of India AGMARKNET / e-NAM Complete Official Mandi Catalogue",
    resource_id: resourceId,
    cumulative: true,
    stats: {
      total_commodities: sortedCommodities.length,
      total_official_commodities: sortedCommodities.length,
      total_registered_variety_associations: totalRegisteredCount,
      total_observed_historical_varieties: totalHistoricalCount,
      total_varieties_with_current_arrivals: totalArrivalsCount,
      total_consolidated_variety_associations: sortedCommodities.reduce((acc, c) => acc + c.variety_count, 0),
      total_unique_varieties: allUniqueVarieties.size,
      total_grades: allUniqueGrades.size,
      total_states: Object.keys(formattedStates).length,
      total_districts: totalDistrictsCount,
      total_markets: totalMarketsCount,
      official_groups_represented: new Set(sortedCommodities.map(c => c.category)).size,
      date_range: {
        earliest_observation: earliestDate,
        latest_observation: latestDate
      },
      scanned_records_in_last_sync: totalRecordsScanned,
      scanned_pages_in_last_sync: totalPagesScanned
    },
    commodities: sortedCommodities,
    states: formattedStates
  }

  // Atomic write of agmarknet-catalogue.json
  mkdirSync(dataDir, { recursive: true })
  writeFileSync(tempCatalogueFile, JSON.stringify(catalogue, null, 2), "utf8")
  renameSync(tempCatalogueFile, catalogueFile)

  // Also update mandi-history.json if records were retrieved
  if (allHistoricalRows.length > 0) {
    try {
      const historyPayload = {
        collectedAt: new Date().toISOString(),
        date_range: { earliest: earliestDate, latest: latestDate },
        total_records: allHistoricalRows.length,
        rows: allHistoricalRows
      }
      writeFileSync(mandiHistoryFile, JSON.stringify(historyPayload, null, 2), "utf8")
      console.log(`Saved ${allHistoricalRows.length} historical records to ${mandiHistoryFile}`)
    } catch (e) {
      console.warn("Could not write mandi-history.json:", e.message)
    }
  }

  console.log("=== Cumulative AGMARKNET Catalogue Successfully Built & Saved ===")
  console.log(`Catalogue File: ${catalogueFile}`)
  console.log(`Total Unique Commodities: ${sortedCommodities.length}`)
  console.log(`Total Unique Varieties: ${totalVarietiesCount}`)
  console.log(`Total Commodity-Variety Combinations: ${totalCombosCount}`)
  console.log(`Total Grades: ${allUniqueGrades.size}`)
  console.log(`Date Range: ${earliestDate} to ${latestDate}`)
  console.log(`States/UTs: ${Object.keys(formattedStates).length}`)
  console.log(`Districts: ${totalDistrictsCount}`)
  console.log(`Markets/APMCs: ${totalMarketsCount}`)

  return catalogue
}

if (process.argv[1] && process.argv[1].endsWith("refresh-catalogue.js")) {
  refreshCatalogue()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("Refresh script fatal error:", err)
      process.exit(1)
    })
}
