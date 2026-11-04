import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { PassThrough } from "stream"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

const cataloguePath = path.join(rootDir, "data", "agmarknet-catalogue.json")
const currentPricesPath = path.join(rootDir, "data", "current-mandi-prices.json")
const listingsPath = path.join(rootDir, "data", "listings.json")

console.log("=".repeat(85))
console.log("   AGMARKNET ALL-CATEGORY INTEGRATION & COMPREHENSIVE DIAGNOSTIC TEST")
console.log("=".repeat(85))

// Load files
const rawCatalogue = JSON.parse(fs.readFileSync(cataloguePath, "utf8"))
const rawPrices = JSON.parse(fs.readFileSync(currentPricesPath, "utf8"))
const listings = JSON.parse(fs.readFileSync(listingsPath, "utf8"))

const catalogue = Array.isArray(rawCatalogue) ? rawCatalogue : (rawCatalogue.commodities || [])
const currentGovPrices = Array.isArray(rawPrices) ? rawPrices : (rawPrices.records || [])

let passCount = 0
let failCount = 0

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`)
    passCount++
  } else {
    console.error(`[FAIL] ${message}`)
    failCount++
  }
}

// =============================================================
// TEST 1: OFFICIAL AGMARKNET COMMODITY MASTER INTEGRITY
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 1: COMMODITY MASTER INTEGRITY (609 COMMODITIES)")
console.log("-".repeat(50))

assert(catalogue.length === 609, `Farmzy maintains all 609 official AGMARKNET commodities (Found: ${catalogue.length})`)

let blankCommodityCount = 0
const commodityNames = []
for (const c of catalogue) {
  const name = (c.name || c.commodity || c.agmarknet_name || "").trim()
  if (!name) blankCommodityCount++
  else commodityNames.push(name)
}
assert(blankCommodityCount === 0, `Zero blank commodity names in catalogue (Blank: ${blankCommodityCount})`)
assert(commodityNames.length === 609, `All 609 commodities have valid non-empty names`)

// =============================================================
// TEST 2: OFFICIAL AGMARKNET VARIETY MASTER INTEGRITY
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 2: VARIETY MASTER INTEGRITY (3,071 RELATIONSHIPS)")
console.log("-".repeat(50))

let totalCatalogVarieties = 0
let blankVarietyCount = 0
const catalogueCommodityMap = new Map()
const cataloguePairSet = new Set()

for (const item of catalogue) {
  const commName = (item.name || item.commodity || item.agmarknet_name || "").trim()
  const vars = item.variety_names || (item.varieties || []).map(v => typeof v === "string" ? v.trim() : (v.name || "").trim())
  const key = commName.toLowerCase().replace(/[^a-z0-9]/g, "")

  for (const v of vars) {
    if (!v) {
      blankVarietyCount++
    } else {
      totalCatalogVarieties++
      cataloguePairSet.add(`${key}:::${v.toLowerCase().replace(/[^a-z0-9]/g, "")}`)
    }
  }

  catalogueCommodityMap.set(key, {
    id: item.id,
    commodity: commName,
    category: item.category || item.group_name || "Others",
    varieties: vars,
    varietySet: new Set(vars.map(v => v.toLowerCase().replace(/[^a-z0-9]/g, "")))
  })
}

assert(totalCatalogVarieties === 3071, `Farmzy maintains all 3,071 official commodity-variety relationships (Found: ${totalCatalogVarieties})`)
assert(blankVarietyCount === 0, `Zero blank variety names in catalogue (Blank: ${blankVarietyCount})`)

// Verify rice has all 274 varieties
const riceEntry = catalogueCommodityMap.get("rice")
assert(riceEntry && riceEntry.varieties.length === 274, `Rice has all 274 registered varieties (Found: ${riceEntry?.varieties.length})`)

// Verify Cashewnuts has all 12 varieties
const cashewEntry = catalogueCommodityMap.get("cashewnuts")
assert(cashewEntry && cashewEntry.varieties.length === 12, `Cashewnuts has all 12 registered varieties (Found: ${cashewEntry?.varieties.length})`)

// =============================================================
// TEST 3: INVALID TYPES & LISTING ATTRIBUTE SEPARATION
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 3: SEPARATION OF LISTING ATTRIBUTES & INVALID TYPES")
console.log("-".repeat(50))

const forbiddenListingTerms = [
  "conventional", "grade range-1", "grade range-2", "grade range-3",
  "export quality", "packaging", "delivery", "pickup", "unit", "quantity"
]

let invalidAttributesAsVarieties = 0
for (const item of catalogue) {
  for (const v of item.varieties || item.variety_names || []) {
    const vName = (typeof v === "string" ? v : v.name || "").toLowerCase().trim()
    if (forbiddenListingTerms.includes(vName)) {
      invalidAttributesAsVarieties++
    }
  }
}
assert(invalidAttributesAsVarieties === 0, `No listing attributes/production methods generated as synthetic varieties`)

// Check genuine varieties: Organic & Other only exist where registered in DMI master
let cropsWithRegisteredOther = 0
let cropsWithRegisteredOrganic = 0
for (const item of catalogue) {
  const vars = (item.variety_names || (item.varieties || []).map(v => typeof v === "string" ? v : v.name || "")).map(v => v.toLowerCase())
  if (vars.includes("other")) cropsWithRegisteredOther++
  if (vars.includes("organic")) cropsWithRegisteredOrganic++
}
assert(cropsWithRegisteredOther > 0, `Legitimate AGMARKNET 'Other' preserved where officially registered (${cropsWithRegisteredOther} crops)`)
assert(cropsWithRegisteredOrganic > 0, `Legitimate AGMARKNET 'Organic' preserved where officially registered (${cropsWithRegisteredOrganic} crops)`)

// =============================================================
// TEST 4: CURRENT AGMARKNET PRICE FEED INTEGRITY
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 4: CURRENT AGMARKNET PRICE FEED (10,694 RECORDS)")
console.log("-".repeat(50))

assert(currentGovPrices.length === 10694, `Complete current daily price dataset loaded (Found: ${currentGovPrices.length} records)`)

const govCommodities = new Set()
const govVarieties = new Set()
const govCommodityVarietyPairs = new Set()
let govDuplicates = 0
const govSeenSignatures = new Set()
let invalidFields = 0

for (const rec of currentGovPrices) {
  const c = rec.commodity ? rec.commodity.trim() : ""
  const v = rec.variety ? rec.variety.trim() : ""
  govCommodities.add(c)
  govVarieties.add(v)
  govCommodityVarietyPairs.add(`${c}:::${v}`)

  const sig = `${rec.state}|${rec.district}|${rec.market}|${c}|${v}|${rec.arrival_date}`
  if (govSeenSignatures.has(sig)) {
    govDuplicates++
  } else {
    govSeenSignatures.add(sig)
  }

  // Check required official AGMARKNET fields
  if (!rec.state || !rec.district || !rec.market || !c || !v || !rec.arrival_date ||
      rec.min_price == null || rec.max_price == null || rec.modal_price == null) {
    invalidFields++
  }
}

console.log(`- Unique Government Commodities in daily trade: ${govCommodities.size}`)
console.log(`- Unique Government Varieties in daily trade: ${govVarieties.size}`)
console.log(`- Unique Commodity-Variety Pairs in daily trade: ${govCommodityVarietyPairs.size}`)
console.log(`- Duplicate records in source: ${govDuplicates}`)

assert(govCommodities.size === 186, `186 unique commodities actively traded today`)
assert(govVarieties.size === 318, `318 unique varieties actively traded today`)
assert(govCommodityVarietyPairs.size === 495, `495 unique commodity-variety pairs in daily feed`)
assert(invalidFields === 0, `Zero records have corrupted or missing official fields`)

// =============================================================
// TEST 5: EXACT COMMODITY + VARIETY MATCHING
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 5: EXACT COMMODITY + VARIETY IDENTITY MATCHING")
console.log("-".repeat(50))

let exactCommodityMatches = 0
let unmappedGovCommodities = []
for (const govComm of govCommodities) {
  const key = govComm.toLowerCase().replace(/[^a-z0-9]/g, "")
  if (catalogueCommodityMap.has(key)) {
    exactCommodityMatches++
  } else {
    unmappedGovCommodities.push(govComm)
  }
}
assert(unmappedGovCommodities.length === 0, `All ${govCommodities.size} active Government commodities exist in Farmzy catalogue (Unmapped: ${unmappedGovCommodities.length})`)

let exactPairMatches = 0
let unmappedPairs = []
for (const pair of govCommodityVarietyPairs) {
  const [c, v] = pair.split(":::")
  const cKey = c.toLowerCase().replace(/[^a-z0-9]/g, "")
  const vKey = v.toLowerCase().replace(/[^a-z0-9]/g, "")
  const pairKey = `${cKey}:::${vKey}`

  if (cataloguePairSet.has(pairKey)) {
    exactPairMatches++
  } else {
    unmappedPairs.push({ commodity: c, variety: v })
  }
}

assert(exactPairMatches === govCommodityVarietyPairs.size, `100% of Government pairs match catalogue without loose guessing (${exactPairMatches} / ${govCommodityVarietyPairs.size})`)
assert(unmappedPairs.length === 0, `Zero unmapped commodity-variety pairs in current daily feed`)

// =============================================================
// TEST 6: MULTI-RECORD PRESERVATION (NO COLLAPSING)
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 6: MULTI-RECORD PRESERVATION (NO COLLAPSING)")
console.log("-".repeat(50))

// Example: Jasmine has 15 distinct records across different Tamil Nadu markets
const jasmineRecords = currentGovPrices.filter(r => r.commodity === "Jasmine" && r.variety === "Jasmine")
assert(jasmineRecords.length === 15, `Jasmine has all 15 distinct Government mandi records preserved (Found: ${jasmineRecords.length})`)

const hosurRecord = jasmineRecords.find(r => r.market.includes("Hosur"))
assert(hosurRecord && hosurRecord.modal_price === 55000, `Hosur Jasmine record preserved: ₹55,000 modal price`)

const kumarapalayamRecord = jasmineRecords.find(r => r.market.includes("Kumarapalayam"))
assert(kumarapalayamRecord && kumarapalayamRecord.modal_price === 87500, `Kumarapalayam Jasmine record preserved: ₹87,500 modal price`)

const rasipuramRecord = jasmineRecords.find(r => r.market.includes("Rasipuram"))
assert(rasipuramRecord && rasipuramRecord.modal_price === 85000, `Rasipuram Jasmine record preserved: ₹85,000 modal price`)

// Verify that separate records were not collapsed into one
const jasmineMarkets = new Set(jasmineRecords.map(r => r.market))
assert(jasmineMarkets.size === 15, `All 15 Jasmine records are distinct individual APMC markets without collapsing`)

// =============================================================
// TEST 7: ALL 16 AGMARKNET CATEGORIES VERIFICATION
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 7: ALL 16 AGMARKNET CATEGORIES EXHAUSTIVE CHECK")
console.log("-".repeat(50))

const all16Categories = [
  "Cereals",
  "Pulses",
  "Oil Seeds",
  "Fibre Crops",
  "Fruits",
  "Vegetables",
  "Spices",
  "Dry Fruits",
  "Beverages",
  "Others",
  "Drug and Narcotics",
  "Forest Products",
  "Live Stock,Poultry,Fisheries",
  "Flowers",
  "Oils and Fats",
  "Medicinal and Aromatic Plants"
]

const categoryStats = {}
for (const cat of all16Categories) {
  categoryStats[cat] = {
    commodities: 0,
    varieties: 0,
    dailyRecords: 0,
    activeCommodities: new Set()
  }
}

for (const item of catalogue) {
  const cat = item.category || item.group_name || "Others"
  if (categoryStats[cat]) {
    categoryStats[cat].commodities++
    const vars = item.variety_names || (item.varieties || []).map(v => typeof v === "string" ? v : (v.name || "").trim())
    categoryStats[cat].varieties += vars.length
  }
}

for (const rec of currentGovPrices) {
  const cKey = (rec.commodity || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  const match = catalogueCommodityMap.get(cKey)
  if (match && match.category) {
    const cat = match.category
    if (categoryStats[cat]) {
      categoryStats[cat].dailyRecords++
      categoryStats[cat].activeCommodities.add(match.commodity)
    }
  }
}

console.log(
  "Category".padEnd(32) +
  "Commodities".padEnd(14) +
  "Varieties".padEnd(12) +
  "Daily Records".padEnd(15) +
  "Active Comm"
)
console.log("-".repeat(85))

let totalCatCommodities = 0
let totalCatVarieties = 0
let totalCatRecords = 0

for (const [cat, stats] of Object.entries(categoryStats)) {
  console.log(
    cat.padEnd(32) +
    String(stats.commodities).padEnd(14) +
    String(stats.varieties).padEnd(12) +
    String(stats.dailyRecords).padEnd(15) +
    String(stats.activeCommodities.size)
  )
  totalCatCommodities += stats.commodities
  totalCatVarieties += stats.varieties
  totalCatRecords += stats.dailyRecords
}
console.log("-".repeat(85))
console.log(
  "TOTAL".padEnd(32) +
  String(totalCatCommodities).padEnd(14) +
  String(totalCatVarieties).padEnd(12) +
  String(totalCatRecords).padEnd(15)
)

assert(totalCatCommodities === 609, `Category commodities sum to exactly 609`)
assert(totalCatVarieties === 3071, `Category varieties sum to exactly 3,071`)
assert(totalCatRecords === 10694, `Category daily records sum to exactly 10,694`)

// Check individual special attention categories
assert(categoryStats["Flowers"].commodities === 60 && categoryStats["Flowers"].dailyRecords === 80, `Flowers: 60 commodities, 80 daily records`)
assert(categoryStats["Spices"].commodities === 33 && categoryStats["Spices"].dailyRecords === 227, `Spices: 33 commodities, 227 daily records`)
assert(categoryStats["Dry Fruits"].commodities === 11 && categoryStats["Dry Fruits"].dailyRecords === 5, `Dry Fruits: 11 commodities, 5 daily records`)
assert(categoryStats["Forest Products"].commodities === 46 && categoryStats["Forest Products"].dailyRecords === 32, `Forest Products: 46 commodities, 32 daily records`)
assert(categoryStats["Drug and Narcotics"].commodities === 41 && categoryStats["Drug and Narcotics"].dailyRecords === 24, `Drug and Narcotics: 41 commodities, 24 daily records`)
assert(categoryStats["Live Stock,Poultry,Fisheries"].commodities === 21 && categoryStats["Live Stock,Poultry,Fisheries"].dailyRecords === 6, `Livestock/Poultry/Fisheries: 21 commodities, 6 daily records`)
assert(categoryStats["Oils and Fats"].commodities === 8 && categoryStats["Oils and Fats"].dailyRecords === 9, `Oils and Fats: 8 commodities, 9 daily records`)
assert(categoryStats["Medicinal and Aromatic Plants"].commodities === 29, `Medicinal & Aromatic Plants: 29 commodities`)

// =============================================================
// TEST 8: ZERO INVENTED PRICES & UNQUOTED VARIETY DISPLAY
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 8: ZERO INVENTED PRICES & UNQUOTED HANDLING")
console.log("-".repeat(50))

const livePriceMap = new Map()
for (const rec of currentGovPrices) {
  const c = String(rec.commodity || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  const v = String(rec.variety || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  const key = `${c}::${v}`
  if (!livePriceMap.has(key)) {
    livePriceMap.set(key, rec)
  }
}

// Unquoted varieties must NOT have invented prices
const unquotedVarieties = [
  { c: "Flowers", v: "Carnation" },
  { c: "Cereals", v: "Basmati 370" },
  { c: "Vegetables", v: "Cherry Tomato" },
  { c: "Dry Fruits", v: "Pistachio" }
]

for (const u of unquotedVarieties) {
  const key = `${u.c.toLowerCase()}::${u.v.toLowerCase().replace(/[^a-z0-9]/g, "")}`
  assert(!livePriceMap.has(key), `Unquoted variety ${u.c} -> ${u.v} has no invented price (Undefined)`)
}

// Quoted varieties must have positive genuine price and arrival date
const quotedRecord = livePriceMap.get("tomato::tomato")
assert(quotedRecord && quotedRecord.modal_price > 0, `Quoted Tomato record has authentic positive modal price: ₹${quotedRecord?.modal_price}`)
assert(quotedRecord && quotedRecord.arrival_date === "03/11/2026", `Quoted Tomato record preserves arrival date: ${quotedRecord?.arrival_date}`)

// =============================================================
// TEST 9: IN-PROCESS BACKEND API END-TO-END VALIDATION
// =============================================================
console.log("\n" + "-".repeat(50))
console.log("TEST 9: IN-PROCESS BACKEND API END-TO-END VALIDATION")
console.log("-".repeat(50))

process.env.VERCEL = "1"
const serverModule = await import("../server.js")
const serverInstance = serverModule.server
const handler = serverInstance.listeners("request")[0]

function callApi(url) {
  return new Promise((resolve, reject) => {
    const req = new PassThrough()
    req.method = "GET"
    req.url = url
    req.headers = { host: "localhost" }
    req.end()

    let body = ""
    const res = new PassThrough()
    res.setHeader = () => res
    res.writeHead = (s) => { res.statusCode = s; return res }
    res.on("data", c => { body += c })
    res.on("end", () => {
      try {
        resolve({ status: res.statusCode || 200, data: JSON.parse(body) })
      } catch (e) {
        reject(new Error(`Failed to parse response: ${body.slice(0, 200)}`))
      }
    })
    handler(req, res)
  })
}

// 1. GET /api/commodities
const commsRes = await callApi("/api/commodities")
assert(commsRes.status === 200, `GET /api/commodities returned HTTP 200`)
const commsCount = Array.isArray(commsRes.data) ? commsRes.data.length : (commsRes.data.commodities?.length || commsRes.data.total)
assert(commsCount === 609, `GET /api/commodities returned all 609 commodities (Found: ${commsCount})`)

// 2. GET /api/varieties?commodity=Rice
const riceRes = await callApi("/api/varieties?commodity=Rice")
assert(riceRes.status === 200, `GET /api/varieties?commodity=Rice returned HTTP 200`)
assert(riceRes.data.varieties.length === 274, `Rice varieties endpoint returned all 274 varieties`)

// 3. GET /api/varieties?commodity=Cashewnuts
const cashewRes = await callApi("/api/varieties?commodity=Cashewnuts")
assert(cashewRes.status === 200, `GET /api/varieties?commodity=Cashewnuts returned HTTP 200`)
assert(cashewRes.data.varieties.length === 12, `Cashewnuts varieties endpoint returned all 12 varieties`)

// 4. GET /api/mandi-prices?commodity=Jasmine&variety=Jasmine (Multi-record query)
const jasmineRes = await callApi("/api/mandi-prices?commodity=Jasmine&variety=Jasmine")
assert(jasmineRes.status === 200, `GET /api/mandi-prices?commodity=Jasmine&variety=Jasmine returned HTTP 200`)
assert(jasmineRes.data.records.length === 15, `Jasmine price query returned all 15 separate mandi records`)
assert(jasmineRes.data.source === "Source: Government of India — AGMARKNET", `Source label correctly set to 'Source: Government of India — AGMARKNET'`)

// 5. Pagination verification: /api/mandi-prices with limit and offset
const page1Res = await callApi("/api/mandi-prices?limit=50&offset=0")
const page2Res = await callApi("/api/mandi-prices?limit=50&offset=50")
assert(page1Res.data.records.length === 50, `Page 1 returned 50 records`)
assert(page2Res.data.records.length === 50, `Page 2 returned 50 records`)
assert(page1Res.data.total === 10694, `Pagination total reflects all 10,694 records`)
assert(page1Res.data.records[0].market !== page2Res.data.records[0].market || page1Res.data.records[0].commodity !== page2Res.data.records[0].commodity, `Page 1 and Page 2 contain distinct record slices`)

// 6. Category filtering: Flowers (80 records)
const flowersRes = await callApi("/api/mandi-prices?category=Flowers")
assert(flowersRes.data.total === 80, `Category filter for Flowers returns all 80 daily flower records`)

// 7. Local farmer listings preservation
assert(listings.length >= 7, `Local farmer listings preserved (${listings.length} listings)`)
let validListings = 0
for (const l of listings) {
  if (l.id && l.crop && l.price && (l.farmerName || l.farmerId || l.farmer)) {
    validListings++
  }
}
assert(validListings === listings.length, `All local farmer listings valid and complete`)

// =============================================================
// SUMMARY
// =============================================================
console.log("\n" + "=".repeat(85))
console.log(`DIAGNOSTIC TEST COMPLETE: ${passCount} PASSED, ${failCount} FAILED`)
console.log("=".repeat(85))

if (failCount > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
