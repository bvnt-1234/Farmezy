import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

const cataloguePath = path.join(rootDir, "data", "agmarknet-catalogue.json")
const rawCatalogue = JSON.parse(fs.readFileSync(cataloguePath, "utf8"))
const commodities = Array.isArray(rawCatalogue) ? rawCatalogue : (rawCatalogue.commodities || [])

console.log("=".repeat(85))
console.log("   CARD AUTHORITY & DATA INTEGRITY VALIDATION TEST")
console.log("=".repeat(85))

// 1. Build Official AGMARKNET Masters
const officialCommoditySet = new Set()
const officialVarietyPairMap = new Map() // identity -> { category, commodity, variety }
let totalOfficialRelationships = 0

for (const c of commodities) {
  const cName = (c.name || c.commodity || "").trim()
  const cat = (c.category || c.group_name || "Others").trim()
  officialCommoditySet.add(cName.toLowerCase())

  const vars = c.variety_names || (c.varieties || []).map(v => typeof v === "string" ? v.trim() : (v.name || "").trim())
  for (const v of vars) {
    totalOfficialRelationships++
    const identity = `${cat}:::${cName}:::${v}`
    officialVarietyPairMap.set(identity, { category: cat, commodity: cName, variety: v })
  }
}

console.log(`[OFFICIAL MASTER] Total Official Commodities: ${officialCommoditySet.size}`)
console.log(`[OFFICIAL MASTER] Total Official Commodity-Variety Relationships: ${totalOfficialRelationships}`)

// 2. Simulate Frontend Card Generation (OfficialPrices.jsx logic)
const activeCommodities = commodities
const catalogVarietyItems = []
const seenIdentities = new Set()
let duplicateCards = 0
let blankCards = 0
let invalidGeneratedRelationships = 0
let imageGeneratedCards = 0
let metadataAsTextCount = 0

const forbiddenMetadataPhrases = [
  "premium assorted", "wholesome nuts", "sweet vineyard", "unsplash", "wikimedia",
  ".jpg", ".png", ".svg", "http://", "https://", "curated photography"
]

for (const c of activeCommodities) {
  const vNames = c.variety_names || (c.varieties || []).map(v => typeof v === "string" ? v : (v.name || v.variety_name))
  const cat = c.category || c.group_name || "Others"
  const cleanVNames = [...new Set((vNames || []).map(n => String(n || "").trim()).filter(Boolean))]

  for (const vName of cleanVNames) {
    const identity = `${cat}:::${c.name}:::${vName}`

    // Check duplicate
    if (seenIdentities.has(identity)) {
      duplicateCards++
      continue
    }
    seenIdentities.add(identity)

    // Check blank
    if (!c.name || !vName || !cat) {
      blankCards++
    }

    // Check official existence
    if (!officialCommoditySet.has(c.name.toLowerCase())) {
      invalidGeneratedRelationships++
      console.error(`Invalid Commodity: ${c.name}`)
    }

    if (!officialVarietyPairMap.has(identity)) {
      invalidGeneratedRelationships++
      console.error(`Invalid Relationship: ${identity}`)
    }

    // Check if image generated the card
    // Cards must strictly have provenance from official master
    if (!c.id && !c.agmarknet_name) {
      imageGeneratedCards++
    }

    // Check visible card text for leaked image metadata
    const title = vName
    const subTitle = c.name
    const cardText = `${title} ${subTitle} ${cat}`.toLowerCase()
    for (const phrase of forbiddenMetadataPhrases) {
      if (cardText.includes(phrase)) {
        metadataAsTextCount++
        console.error(`Metadata leaked in card text: "${phrase}" in "${cardText}"`)
      }
    }

    catalogVarietyItems.push({
      identity,
      commodity: c.name,
      variety: vName,
      category: cat
    })
  }
}

const validDisplayedRelationships = catalogVarietyItems.length
const officialRelationshipsAccidentallyRemoved = totalOfficialRelationships - validDisplayedRelationships

console.log("\n" + "-".repeat(50))
console.log("CATEGORY-BY-CATEGORY CARD INSPECTION")
console.log("-".repeat(50))

const targetCategories = ["Dry Fruits", "Flowers", "Vegetables", "Cereals", "Fruits", "Spices"]
for (const tc of targetCategories) {
  const catItems = catalogVarietyItems.filter(item => item.category === tc)
  const catComms = new Set(catItems.map(i => i.commodity))
  console.log(`- ${tc.padEnd(16)}: ${String(catComms.size).padStart(3)} commodities, ${String(catItems.length).padStart(4)} valid variety cards`)

  // Check specific crop examples
  if (tc === "Dry Fruits") {
    const almondCards = catItems.filter(i => i.commodity.toLowerCase().includes("almond"))
    console.log(`   * Almond(Badam) variety cards: ${almondCards.map(i => i.variety).join(", ")}`)
    const cashewCards = catItems.filter(i => i.commodity.toLowerCase().includes("cashew"))
    console.log(`   * Cashewnuts variety cards: ${cashewCards.length} varieties (e.g. ${cashewCards.slice(0, 3).map(i => i.variety).join(", ")})`)
    const waterChestnutCards = catItems.filter(i => i.commodity.toLowerCase().includes("water chestnut"))
    console.log(`   * Water chestnut variety cards: ${waterChestnutCards.map(i => i.variety).join(", ")}`)
  }
}

console.log("\n" + "=".repeat(85))
console.log("   CARD AUTHORITY VALIDATION REPORT")
console.log("=".repeat(85))
console.log(`Total official relationships:             ${totalOfficialRelationships}`)
console.log(`Valid displayed relationships:            ${validDisplayedRelationships}`)
console.log(`Invalid generated relationships:          ${invalidGeneratedRelationships}`)
console.log(`Duplicate cards:                          ${duplicateCards}`)
console.log(`Image-generated cards:                    ${imageGeneratedCards}`)
console.log(`Blank cards:                              ${blankCards}`)
console.log(`Official relationships removed:           ${officialRelationshipsAccidentallyRemoved}`)
console.log(`Image metadata in card text:              ${metadataAsTextCount}`)
console.log("=".repeat(85))

const allPassed = (
  totalOfficialRelationships === 3071 &&
  validDisplayedRelationships === 3071 &&
  invalidGeneratedRelationships === 0 &&
  duplicateCards === 0 &&
  imageGeneratedCards === 0 &&
  blankCards === 0 &&
  officialRelationshipsAccidentallyRemoved === 0 &&
  metadataAsTextCount === 0
)

if (allPassed) {
  console.log("\n>>> ALL VALIDATION CHECKS PASSED: ZERO INVALID/DUPLICATE/BLANK CARDS <<<")
  process.exit(0)
} else {
  console.error("\n>>> VALIDATION FAILED <<<")
  process.exit(1)
}

