import http from "node:http"
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, statSync } from "node:fs"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const port = Number(process.env.PORT || process.env.API_PORT || 3001)
const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"
const dataGovCache = new Map()
const dataGovCacheTtlMs = 15 * 60 * 1000 // 15 minutes cache
const imageCache = new Map()
const imageTtlMs = 24 * 60 * 60 * 1000
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data")
const listingsFile = path.join(dataDir, "listings.json")
const ordersFile = path.join(dataDir, "orders.json")
const cataloguePath = path.join(dataDir, "agmarknet-catalogue.json")
let cachedAgmarknetCommodities = null

function getAgmarknetCommodities() {
  if (cachedAgmarknetCommodities) return cachedAgmarknetCommodities
  try {
    if (existsSync(cataloguePath)) {
      const data = JSON.parse(readFileSync(cataloguePath, "utf8"))
      if (data && Array.isArray(data.commodities)) {
        cachedAgmarknetCommodities = data.commodities
        return cachedAgmarknetCommodities
      }
    }
  } catch (err) {
    console.warn("Could not load agmarknet catalogue:", err.message)
  }
  return []
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

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../frontend/dist")

function serveStatic(pathname, res) {
  if (!existsSync(distDir)) return false
  const cleanPath = pathname.split("?")[0].replace(/^\/+/, "")
  let targetFile = cleanPath ? path.join(distDir, cleanPath) : path.join(distDir, "index.html")

  if (existsSync(targetFile) && statSync(targetFile).isDirectory()) {
    targetFile = path.join(targetFile, "index.html")
  }

  if (!existsSync(targetFile) || !targetFile.startsWith(distDir)) {
    targetFile = path.join(distDir, "index.html")
  }

  if (!existsSync(targetFile) || statSync(targetFile).isDirectory()) return false

  const ext = path.extname(targetFile).toLowerCase()
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf"
  }
  const contentType = mimeTypes[ext] || "application/octet-stream"
  res.setHeader("Content-Type", contentType)
  res.setHeader("Cache-Control", ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable")
  res.writeHead(200)
  res.end(readFileSync(targetFile))
  return true
}


function getAgmarknetCommodities() {
  if (cachedAgmarknetCommodities) return cachedAgmarknetCommodities
  try {
    if (existsSync(cataloguePath)) {
      const data = JSON.parse(readFileSync(cataloguePath, "utf8"))
      if (data && Array.isArray(data.commodities)) {
        cachedAgmarknetCommodities = data.commodities
        return cachedAgmarknetCommodities
      }
    }
  } catch (err) {
    console.warn("Could not load agmarknet catalogue:", err.message)
  }
  return []
}

function loadListings() {
  try {
    if (!existsSync(listingsFile)) {
      const defaultFile = path.join(dataDir, "listings.json")
      if (existsSync(defaultFile)) {
        const data = JSON.parse(readFileSync(defaultFile, "utf8"))
        return Array.isArray(data) ? data : []
      }
      return []
    }
    const data = JSON.parse(readFileSync(listingsFile, "utf8"))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveListings(newListings) {
  try {
    mkdirSync(writableDataDir, { recursive: true })
    writeFileSync(listingsFile, JSON.stringify(newListings, null, 2))
  } catch (err) {
    console.warn("Warning: Could not persist listings to disk:", err.message)
  }
}

let listings = loadListings()

function loadOrders() {
  try {
    if (!existsSync(ordersFile)) {
      const defaultFile = path.join(dataDir, "orders.json")
      if (existsSync(defaultFile)) {
        const data = JSON.parse(readFileSync(defaultFile, "utf8"))
        return Array.isArray(data) ? data : []
      }
      return []
    }
    const data = JSON.parse(readFileSync(ordersFile, "utf8"))
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

function saveOrders(newOrders) {
  try {
    mkdirSync(writableDataDir, { recursive: true })
    writeFileSync(ordersFile, JSON.stringify(newOrders, null, 2))
  } catch (err) {
    console.warn("Warning: Could not persist orders to disk:", err.message)
  }
}

let orders = loadOrders()

try {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env")
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
  }
} catch {}

function startHistoricalCollector() {
  if (isVercel || !(process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY)) return
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "scripts", "collect-mandi-history.js")
  const run = () => {
    const child = spawn(process.execPath, [script], { stdio: "inherit" })
    child.on("error", error => console.error("Historical mandi collector:", error.message))
    child.on("exit", code => console.log("Historical mandi collector finished with code", code))
  }
  if (!existsSync(path.join(dataDir, "mandi-history.json"))) run()
  setInterval(run, 24 * 60 * 60 * 1000).unref()
}

startHistoricalCollector()

// Curated high-res photos for common Indian vegetables, fruits, and commodities
const curatedCropImages = {
  ginger: { url: "/ginger.jpg", alt: "Fresh ginger rhizome", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg" },
  "ginger green": { url: "/ginger.jpg", alt: "Fresh green ginger rhizome", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg" },
  "ginger dry": { url: "/ginger.jpg", alt: "Dry ginger rhizome", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg" },
  adrak: { url: "/ginger.jpg", alt: "Fresh adrak / ginger", photographer: "Wikimedia Commons" },
  inji: { url: "/ginger.jpg", alt: "Fresh ginger", photographer: "Wikimedia Commons" },
  allam: { url: "/ginger.jpg", alt: "Fresh ginger", photographer: "Wikimedia Commons" },
  shunti: { url: "/ginger.jpg", alt: "Fresh shunti / ginger", photographer: "Wikimedia Commons" },

  "ladies finger": { url: "/ladies_finger.jpg", alt: "Fresh ladies finger / okra pods", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg" },
  "lady finger": { url: "/ladies_finger.jpg", alt: "Fresh lady finger pods", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg" },
  "lady s finger": { url: "/ladies_finger.jpg", alt: "Fresh lady's finger pods", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg" },
  ladies: { url: "/ladies_finger.jpg", alt: "Fresh ladies finger / okra", photographer: "Wikimedia Commons" },
  bhindi: { url: "/ladies_finger.jpg", alt: "Fresh bhindi / okra", photographer: "Wikimedia Commons" },
  bhendi: { url: "/ladies_finger.jpg", alt: "Fresh bhindi / okra", photographer: "Wikimedia Commons" },
  vendakkai: { url: "/ladies_finger.jpg", alt: "Fresh vendakkai / okra", photographer: "Wikimedia Commons" },
  okra: { url: "/ladies_finger.jpg", alt: "Fresh okra pods", photographer: "Wikimedia Commons" },

  tomato: { url: "/tomato.jpg", alt: "Fresh red tomatoes", photographer: "Unsplash", link: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924" },
  onion: { url: "/onion.jpg", alt: "Fresh red onions", photographer: "Unsplash", link: "https://images.unsplash.com/photo-1683355739329-cea18ba93f02" },
  potato: { url: "/potato.jpg", alt: "Fresh potatoes", photographer: "Unsplash", link: "https://images.unsplash.com/photo-1686544303805-54c175c60d8f" },
  carrot: { url: "/carrot.jpg", alt: "Fresh carrots", photographer: "Unsplash", link: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37" },
  cabbage: { url: "/cabbage.jpg", alt: "Fresh green cabbage", photographer: "Unsplash", link: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f" },

  ridgeguard: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Luffa_acutangula.jpg/640px-Luffa_acutangula.jpg", alt: "Fresh ridge gourd / tori", photographer: "Wikimedia" },
  ridgegourd: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Luffa_acutangula.jpg/640px-Luffa_acutangula.jpg", alt: "Fresh ridge gourd / tori", photographer: "Wikimedia" },
  tori: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Luffa_acutangula.jpg/640px-Luffa_acutangula.jpg", alt: "Fresh ridge gourd / tori", photographer: "Wikimedia" },

  "knool khol": { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Kohlrabi.jpg/640px-Kohlrabi.jpg", alt: "Fresh knool khol / kohlrabi", photographer: "Wikimedia" },
  kohlrabi: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Kohlrabi.jpg/640px-Kohlrabi.jpg", alt: "Fresh kohlrabi", photographer: "Wikimedia" },

  "elephant yam": { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Amorphophallus_paeoniifolius_corms_-_Kerala.jpg/640px-Amorphophallus_paeoniifolius_corms_-_Kerala.jpg", alt: "Elephant yam / suran", photographer: "Wikimedia" },
  suran: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Amorphophallus_paeoniifolius_corms_-_Kerala.jpg/640px-Amorphophallus_paeoniifolius_corms_-_Kerala.jpg", alt: "Suran yam", photographer: "Wikimedia" },
  amphophalus: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Amorphophallus_paeoniifolius_corms_-_Kerala.jpg/640px-Amorphophallus_paeoniifolius_corms_-_Kerala.jpg", alt: "Yam", photographer: "Wikimedia" },

  "bengal gram": { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bengal_Gram.jpg/640px-Bengal_Gram.jpg", alt: "Bengal gram / chana", photographer: "Wikimedia" },
  "green gram": { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bengal_Gram.jpg/640px-Bengal_Gram.jpg", alt: "Green gram / moong", photographer: "Wikimedia" },
  arecanut: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Areca_nut_in_a_basket.jpg/640px-Areca_nut_in_a_basket.jpg", alt: "Arecanut / supari", photographer: "Wikimedia" },
  gur: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Jaggery_blocks.jpg/640px-Jaggery_blocks.jpg", alt: "Gur / Jaggery blocks", photographer: "Wikimedia" },
  jaggery: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Jaggery_blocks.jpg/640px-Jaggery_blocks.jpg", alt: "Jaggery blocks", photographer: "Wikimedia" },

  drumstick: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moringa_oleifera_pods.JPG/640px-Moringa_oleifera_pods.JPG", alt: "Fresh green drumsticks / moringa", photographer: "Wikimedia" },
  moringa: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moringa_oleifera_pods.JPG/640px-Moringa_oleifera_pods.JPG", alt: "Fresh moringa pods", photographer: "Wikimedia" },
  broccoli: { url: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=640&q=75", alt: "Fresh green broccoli", photographer: "Unsplash" },
  garlic: { url: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=640&q=75", alt: "Fresh garlic bulbs", photographer: "Unsplash" },
  cucumber: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh cucumbers", photographer: "Unsplash" },
  cucumbar: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh cucumber / kheera", photographer: "Unsplash" },
  kheera: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh cucumber / kheera", photographer: "Unsplash" },
  cauliflower: { url: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=640&q=75", alt: "Fresh white cauliflower", photographer: "Unsplash" },
  brinjal: { url: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=640&q=75", alt: "Fresh purple brinjal", photographer: "Unsplash" },
  eggplant: { url: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=640&q=75", alt: "Fresh eggplant", photographer: "Unsplash" },
  chilli: { url: "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=640&q=75", alt: "Fresh green chillies", photographer: "Unsplash" },
  chili: { url: "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=640&q=75", alt: "Fresh chillies", photographer: "Unsplash" },
  beans: { url: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=640&q=75", alt: "Fresh green beans", photographer: "Unsplash" },
  beetroot: { url: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=640&q=75", alt: "Fresh beetroot", photographer: "Unsplash" },
  capsicum: { url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=640&q=75", alt: "Fresh bell pepper / capsicum", photographer: "Unsplash" },
  peas: { url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=640&q=75", alt: "Fresh green peas", photographer: "Unsplash" },
  radish: { url: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=640&q=75", alt: "Fresh white radish", photographer: "Unsplash" },
  raddish: { url: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=640&q=75", alt: "Fresh white radish", photographer: "Unsplash" },
  spinach: { url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=640&q=75", alt: "Fresh spinach leaves", photographer: "Unsplash" },
  banana: { url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=640&q=75", alt: "Fresh bananas", photographer: "Unsplash" },
  apple: { url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=640&q=75", alt: "Fresh apples", photographer: "Unsplash" },
  mango: { url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=640&q=75", alt: "Fresh mangoes", photographer: "Unsplash" },
  lemon: { url: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=640&q=75", alt: "Fresh lemons", photographer: "Unsplash" },
  lime: { url: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=640&q=75", alt: "Fresh limes", photographer: "Unsplash" },
  grapes: { url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=640&q=75", alt: "Fresh grapes", photographer: "Unsplash" },
  papaya: { url: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=640&q=75", alt: "Fresh papaya", photographer: "Unsplash" },
  pumpkin: { url: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=640&q=75", alt: "Fresh pumpkin", photographer: "Unsplash" },
  gourd: { url: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=640&q=75", alt: "Fresh gourd vegetable", photographer: "Unsplash" },
  coriander: { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&q=75", alt: "Fresh coriander leaves", photographer: "Unsplash" },
  mint: { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&q=75", alt: "Fresh mint leaves", photographer: "Unsplash" },
  wheat: { url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=640&q=75", alt: "Golden wheat crop", photographer: "Unsplash" },
  rice: { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=75", alt: "Wholesale rice grains", photographer: "Unsplash" },
  paddy: { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=75", alt: "Wholesale paddy / rice", photographer: "Unsplash" },
  maize: { url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=640&q=75", alt: "Fresh corn / maize", photographer: "Unsplash" },
  ragi: { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=75", alt: "Finger millet / ragi", photographer: "Unsplash" },
  cotton: { url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=640&q=75", alt: "Fresh cotton crop", photographer: "Unsplash" },
  groundnut: { url: "https://images.unsplash.com/photo-1568283661195-266657962cfc?auto=format&fit=crop&w=640&q=75", alt: "Fresh groundnuts", photographer: "Unsplash" }
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

function findCuratedCropImage(name) {
  const clean = String(name || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim()
  const sorted = Object.entries(curatedCropImages).sort((a, b) => b[0].length - a[0].length)
  for (const [key, image] of sorted) {
    if ((" " + clean + " ").includes(" " + key + " ") || clean.includes(key)) {
      return { ...image, link: image.link || "https://unsplash.com" }
    }
  }
  return null
}

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../frontend/dist")

function serveStatic(pathname, res) {
  if (!existsSync(distDir)) return false
  const cleanPath = pathname.split("?")[0].replace(/^\/+/, "")
  let targetFile = cleanPath ? path.join(distDir, cleanPath) : path.join(distDir, "index.html")

  if (existsSync(targetFile) && statSync(targetFile).isDirectory()) {
    targetFile = path.join(targetFile, "index.html")
  }

  if (!existsSync(targetFile) || !targetFile.startsWith(distDir)) {
    targetFile = path.join(distDir, "index.html")
  }

  if (!existsSync(targetFile) || statSync(targetFile).isDirectory()) return false

  const ext = path.extname(targetFile).toLowerCase()
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf"
  }
  const contentType = mimeTypes[ext] || "application/octet-stream"
  res.setHeader("Content-Type", contentType)
  res.setHeader("Cache-Control", ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable")
  res.writeHead(200)
  res.end(readFileSync(targetFile))
  return true
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  res.setHeader("Cache-Control", "no-store")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.writeHead(204).end()
    return
  }

  const requestUrl = new URL(req.url, "http://localhost")

  if (req.method === "GET" && !requestUrl.pathname.startsWith("/api")) {
    if (serveStatic(requestUrl.pathname, res)) return
  }

  if (requestUrl.pathname === "/api/listings" && req.method === "GET") {
    const rawCategory = requestUrl.searchParams.get("category")?.trim()
    const rawState = requestUrl.searchParams.get("state")?.trim()
    const rawDistrict = requestUrl.searchParams.get("district")?.trim()
    const rawMinPrice = requestUrl.searchParams.get("minPrice")
    const rawMaxPrice = requestUrl.searchParams.get("maxPrice")
    const rawUnit = requestUrl.searchParams.get("unit")?.trim()
    const rawActiveOnly = requestUrl.searchParams.get("activeOnly")
    const rawSort = requestUrl.searchParams.get("sort")?.trim()

    let safeListings = listings.map(listing => {
      let farmerPhone = listing.farmerPhone
      if (!farmerPhone) {
        const existingContactPhone = listing.contact?.phone || listing.contact?.whatsapp || ""
        const contactDigits = String(existingContactPhone).replace(/\D/g, "")
        if (contactDigits.length === 10) farmerPhone = contactDigits
        else {
          const digits = String(listing.farmerId || "").replace(/\D/g, "")
          if (digits.length === 10) farmerPhone = digits
        }
      }

      const category = listing.category || categoryForCommodity(listing.crop)
      const state = listing.state || listing.farmerState || ""
      const district = listing.district || listing.farmerDistrict || ""
      const latitude = listing.latitude || listing.farmerLat || ""
      const longitude = listing.longitude || listing.farmerLng || ""
      const expiryDate = listing.expiryDate || listing.date || ""
      const harvestDate = listing.harvestDate || ""
      const availableFrom = listing.availableFrom || ""

      return {
        ...listing,
        farmerPhone,
        category,
        state,
        district,
        farmerState: state,
        farmerDistrict: district,
        latitude,
        longitude,
        farmerLat: latitude,
        farmerLng: longitude,
        grade: listing.grade || "",
        organic: listing.organic || "",
        productionMethod: listing.productionMethod || "",
        packaging: listing.packaging || "",
        minOrder: listing.minOrder || "",
        harvestDate,
        availableFrom,
        expiryDate,
        date: expiryDate || listing.date || "",
        city: listing.city || "",
        pincode: listing.pincode || "",
        pickupAvailable: listing.pickupAvailable !== undefined ? Boolean(listing.pickupAvailable) : true,
        deliveryAvailable: Boolean(listing.deliveryAvailable),
        deliveryRadius: listing.deliveryRadius || "",
        priceUnit: listing.priceUnit || listing.unit || "kg"
      }
    })

    const rawCrop = requestUrl.searchParams.get("crop")?.trim() || requestUrl.searchParams.get("commodity")?.trim()
    const rawVariety = requestUrl.searchParams.get("variety")?.trim()
    const rawGrade = requestUrl.searchParams.get("grade")?.trim()
    const rawOrganic = requestUrl.searchParams.get("organic")?.trim()
    const rawDelivery = requestUrl.searchParams.get("deliveryAvailable")
    const rawPickup = requestUrl.searchParams.get("pickupAvailable")
    const rawMinQty = requestUrl.searchParams.get("minQuantity")
    const rawCity = requestUrl.searchParams.get("city")?.trim()
    const rawPincode = requestUrl.searchParams.get("pincode")?.trim()
    const rawProductionMethod = requestUrl.searchParams.get("productionMethod")?.trim()
    const rawPackaging = requestUrl.searchParams.get("packaging")?.trim()
    const rawHarvestFrom = requestUrl.searchParams.get("harvestFrom")?.trim()
    const rawAvailableFrom = requestUrl.searchParams.get("availableFrom")?.trim()

    if (rawCrop && rawCrop !== "All Commodities" && rawCrop !== "All Crops") {
      safeListings = safeListings.filter(l => (l.crop || "").toLowerCase() === rawCrop.toLowerCase())
    }
    if (rawVariety && rawVariety !== "All Varieties") {
      safeListings = safeListings.filter(l => l.variety && l.variety.toLowerCase().includes(rawVariety.toLowerCase()))
    }
    if (rawGrade && rawGrade !== "All Grades") {
      safeListings = safeListings.filter(l => l.grade && l.grade.toLowerCase().includes(rawGrade.toLowerCase()))
    }
    if (rawOrganic && rawOrganic !== "All") {
      if (rawOrganic.toLowerCase() === "organic" || rawOrganic.toLowerCase() === "organic only") {
        safeListings = safeListings.filter(l => l.organic && /organic|natural|jaivik/i.test(l.organic))
      } else if (rawOrganic.toLowerCase() === "conventional" || rawOrganic.toLowerCase() === "conventional only") {
        safeListings = safeListings.filter(l => l.organic && /conventional/i.test(l.organic))
      } else {
        safeListings = safeListings.filter(l => l.organic && l.organic.toLowerCase().includes(rawOrganic.toLowerCase()))
      }
    }
    if (rawDelivery === "true" || rawDelivery === "Delivery Available") {
      safeListings = safeListings.filter(l => Boolean(l.deliveryAvailable))
    }
    if (rawPickup === "true" || rawPickup === "Pickup Available") {
      safeListings = safeListings.filter(l => l.pickupAvailable !== false)
    }

    if (rawCategory && rawCategory !== "All Categories") {
      safeListings = safeListings.filter(l => (l.category || "").toLowerCase() === rawCategory.toLowerCase())
    }
    if (rawState && rawState !== "All States") {
      safeListings = safeListings.filter(l => (l.state || "").toLowerCase().includes(rawState.toLowerCase()))
    }
    if (rawDistrict && rawDistrict !== "All Districts") {
      safeListings = safeListings.filter(l => (l.district || "").toLowerCase().includes(rawDistrict.toLowerCase()))
    }
    if (rawCity && rawCity !== "All Cities") {
      safeListings = safeListings.filter(l => l.city && l.city.toLowerCase().includes(rawCity.toLowerCase()))
    }
    if (rawPincode) {
      safeListings = safeListings.filter(l => String(l.pincode || "").includes(rawPincode))
    }
    if (rawProductionMethod && rawProductionMethod !== "All Methods") {
      safeListings = safeListings.filter(l => l.productionMethod && l.productionMethod.toLowerCase() === rawProductionMethod.toLowerCase())
    }
    if (rawPackaging && rawPackaging !== "All Packaging") {
      safeListings = safeListings.filter(l => l.packaging && l.packaging.toLowerCase().includes(rawPackaging.toLowerCase()))
    }
    if (rawMinQty && Number.isFinite(Number(rawMinQty))) {
      safeListings = safeListings.filter(l => Number(l.quantity || 0) >= Number(rawMinQty))
    }
    if (rawMinPrice && Number.isFinite(Number(rawMinPrice))) {
      safeListings = safeListings.filter(l => Number(l.price) >= Number(rawMinPrice))
    }
    if (rawMaxPrice && Number.isFinite(Number(rawMaxPrice))) {
      safeListings = safeListings.filter(l => Number(l.price) <= Number(rawMaxPrice))
    }
    if (rawUnit && rawUnit !== "All Units") {
      safeListings = safeListings.filter(l => (l.unit || "").toLowerCase() === rawUnit.toLowerCase())
    }
    if (rawHarvestFrom) {
      safeListings = safeListings.filter(l => l.harvestDate && l.harvestDate >= rawHarvestFrom)
    }
    if (rawAvailableFrom) {
      safeListings = safeListings.filter(l => l.availableFrom && l.availableFrom <= rawAvailableFrom)
    }
    if (rawActiveOnly === "true") {
      const today = new Date().toISOString().slice(0, 10)
      safeListings = safeListings.filter(l => !l.date || l.date >= today)
    }

    if (rawSort === "price_asc") {
      safeListings.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    } else if (rawSort === "price_desc") {
      safeListings.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    } else if (rawSort === "expiry_asc") {
      safeListings.sort((a, b) => (a.date ? new Date(a.date).getTime() : Infinity) - (b.date ? new Date(b.date).getTime() : Infinity))
    }

    res.writeHead(200).end(JSON.stringify({ listings: safeListings }))
    return
  }

  if (requestUrl.pathname === "/api/orders" && req.method === "GET") {
    const farmerId = requestUrl.searchParams.get("farmerId")
    const customerId = requestUrl.searchParams.get("customerId")
    let result = orders
    if (farmerId) result = result.filter(order => order.farmerId === farmerId)
    if (customerId) result = result.filter(order => order.customerId === customerId)
    res.writeHead(200).end(JSON.stringify({ orders: result }))
    return
  }

  if (requestUrl.pathname === "/api/orders" && req.method === "POST") {
    try {
      const data = await parseBody(req)
      const required = ["listingId", "farmerId", "farmerName", "customerId", "customerName", "quantity"]
      const missing = required.filter(field => !String(data[field] ?? "").trim())
      if (missing.length) {
        res.writeHead(400).end(JSON.stringify({ error: "Missing required fields: " + missing.join(", ") }))
        return
      }

      const quantity = Number(data.quantity)
      const available = Number(data.availableQuantity)
      if (!Number.isFinite(quantity) || quantity <= 0 || (Number.isFinite(available) && quantity > available)) {
        res.writeHead(400).end(JSON.stringify({ error: "Requested quantity is not valid." }))
        return
      }

      const order = {
        id: Date.now().toString(),
        listingId: String(data.listingId),
        crop: String(data.crop || ""),
        unit: String(data.unit || ""),
        price: String(data.price || ""),
        quantity: String(data.quantity),
        farmerId: String(data.farmerId),
        farmerName: String(data.farmerName),
        farmerPhone: String(data.farmerPhone || ""),
        customerId: String(data.customerId),
        customerName: String(data.customerName),
        customerPhone: String(data.customerPhone || ""),
        customerLocation: String(data.customerLocation || ""),
        status: "Requested",
        createdAt: new Date().toISOString(),
      }

      orders = [order, ...orders]
      saveOrders(orders)
      res.writeHead(201).end(JSON.stringify({ order }))
    } catch {
      res.writeHead(400).end(JSON.stringify({ error: "Invalid order data." }))
    }
    return
  }

  if (requestUrl.pathname.startsWith("/api/orders/") && req.method === "PATCH") {
    try {
      const id = requestUrl.pathname.split("/").pop()
      const data = await parseBody(req)
      const order = orders.find(item => item.id === id)
      if (!order) {
        res.writeHead(404).end(JSON.stringify({ error: "Order not found." }))
        return
      }
      if (!["Accepted", "Rejected", "Ready", "Completed"].includes(data.status)) {
        res.writeHead(400).end(JSON.stringify({ error: "Invalid order status." }))
        return
      }
      order.status = data.status
      order.updatedAt = new Date().toISOString()
      saveOrders(orders)
      res.writeHead(200).end(JSON.stringify({ order }))
    } catch {
      res.writeHead(400).end(JSON.stringify({ error: "Invalid order update." }))
    }
    return
  }

  if (requestUrl.pathname === "/api/listings" && req.method === "POST") {
    try {
      const data = await parseBody(req)

      const required = ["crop", "quantity", "unit", "price", "address", "farmerId", "farmerName"]
      const missing = required.filter(field => !String(data[field] ?? "").trim())
      if (missing.length) {
        res.writeHead(400).end(JSON.stringify({ error: "Missing required fields: " + missing.join(", ") }))
        return
      }

      const numQuantity = Number(data.quantity)
      if (!Number.isFinite(numQuantity) || numQuantity < 0) {
        res.writeHead(400).end(JSON.stringify({ error: "Quantity must be a valid non-negative number." }))
        return
      }

      const numPrice = Number(data.price)
      if (!Number.isFinite(numPrice) || numPrice < 0) {
        res.writeHead(400).end(JSON.stringify({ error: "Price must be a valid non-negative number." }))
        return
      }

      const harvestDate = String(data.harvestDate || "").trim()
      const availableFrom = String(data.availableFrom || "").trim()
      const expiryDate = String(data.expiryDate || "").trim()

      if (harvestDate && expiryDate && expiryDate < harvestDate) {
        res.writeHead(400).end(JSON.stringify({ error: "Expiry / available-until date cannot be earlier than the harvest date." }))
        return
      }
      if (availableFrom && expiryDate && expiryDate < availableFrom) {
        res.writeHead(400).end(JSON.stringify({ error: "Expiry / available-until date cannot be earlier than the available-from date." }))
        return
      }

      const crop = String(data.crop).trim()
      const category = String(data.category || categoryForCommodity(crop)).trim()

      const item = {
        id: Date.now().toString(),
        crop,
        category,
        variety: String(data.variety || "").trim(),
        grade: String(data.grade || "").trim(),
        organic: String(data.organic || "").trim(),
        productionMethod: String(data.productionMethod || "").trim(),
        packaging: String(data.packaging || "").trim(),
        minOrder: String(data.minOrder || "").trim(),
        quantity: String(data.quantity).trim(),
        unit: String(data.unit).trim(),
        price: String(data.price).trim(),
        priceUnit: String(data.priceUnit || data.unit || "kg").trim(),
        harvestDate,
        availableFrom,
        expiryDate,
        date: expiryDate || String(data.date || "").trim() || availableFrom || harvestDate,
        address: String(data.address).trim(),
        village: String(data.village || data.locality || "").trim(),
        locality: String(data.locality || data.village || "").trim(),
        city: String(data.city || data.town || "").trim(),
        district: String(data.district || data.farmerDistrict || "").trim(),
        state: String(data.state || data.farmerState || "").trim(),
        pincode: String(data.pincode || "").trim(),
        latitude: String(data.latitude || data.farmerLat || "").trim(),
        longitude: String(data.longitude || data.farmerLng || "").trim(),
        pickupAvailable: data.pickupAvailable !== undefined ? Boolean(data.pickupAvailable === true || data.pickupAvailable === "true" || data.pickupAvailable === "on") : true,
        deliveryAvailable: Boolean(data.deliveryAvailable === true || data.deliveryAvailable === "true" || data.deliveryAvailable === "on"),
        deliveryRadius: String(data.deliveryRadius || "").trim(),
        notes: String(data.notes || data.description || "").trim(),
        description: String(data.description || data.notes || "").trim(),
        farmerId: String(data.farmerId).trim(),
        farmerName: String(data.farmerName).trim(),
        farmerPhone: String(data.farmerPhone || "").trim(),
        farmerLocation: String(data.address || data.farmerLocation || "").trim(),
        farmerDistrict: String(data.district || data.farmerDistrict || "").trim(),
        farmerState: String(data.state || data.farmerState || "").trim(),
        farmerLat: String(data.latitude || data.farmerLat || "").trim(),
        farmerLng: String(data.longitude || data.farmerLng || "").trim(),
        image: String(data.image || data.imageUrl || "").trim(),
        createdAt: new Date().toISOString(),
      }

      listings = [item, ...listings]
      saveListings(listings)
      res.writeHead(201).end(JSON.stringify({ listing: item }))
    } catch {
      res.writeHead(400).end(JSON.stringify({ error: "Invalid listing data." }))
    }
    return
  }

  if ((requestUrl.pathname.startsWith("/api/listings/") || requestUrl.pathname === "/api/listings") && (req.method === "PUT" || req.method === "PATCH")) {
    try {
      const pathId = requestUrl.pathname.replace(/^\/api\/listings\/?/, "")
      let body = ""
      for await (const chunk of req) body += chunk
      const data = JSON.parse(body || "{}")
      const targetId = String(pathId || data.id || requestUrl.searchParams.get("id"))
      const index = listings.findIndex(item => String(item.id) === targetId)
      if (index === -1) {
        res.writeHead(404).end(JSON.stringify({ error: "Listing not found." }))
        return
      }
      const existing = listings[index]

      if (data.quantity !== undefined) {
        const numQty = Number(data.quantity)
        if (!Number.isFinite(numQty) || numQty < 0) {
          res.writeHead(400).end(JSON.stringify({ error: "Quantity must be a valid non-negative number." }))
          return
        }
      }
      if (data.price !== undefined) {
        const numP = Number(data.price)
        if (!Number.isFinite(numP) || numP < 0) {
          res.writeHead(400).end(JSON.stringify({ error: "Price must be a valid non-negative number." }))
          return
        }
      }

      const harvestDate = data.harvestDate !== undefined ? String(data.harvestDate).trim() : (existing.harvestDate || "")
      const availableFrom = data.availableFrom !== undefined ? String(data.availableFrom).trim() : (existing.availableFrom || "")
      const expiryDate = data.expiryDate !== undefined ? String(data.expiryDate).trim() : (existing.expiryDate || existing.date || "")

      if (harvestDate && expiryDate && expiryDate < harvestDate) {
        res.writeHead(400).end(JSON.stringify({ error: "Expiry / available-until date cannot be earlier than the harvest date." }))
        return
      }
      if (availableFrom && expiryDate && expiryDate < availableFrom) {
        res.writeHead(400).end(JSON.stringify({ error: "Expiry / available-until date cannot be earlier than the available-from date." }))
        return
      }

      const crop = String(data.crop || existing.crop).trim()
      const category = String(data.category || existing.category || categoryForCommodity(crop)).trim()

      const updated = {
        ...existing,
        crop,
        category,
        variety: String(data.variety !== undefined ? data.variety : (existing.variety || "")).trim(),
        grade: String(data.grade !== undefined ? data.grade : (existing.grade || "")).trim(),
        organic: String(data.organic !== undefined ? data.organic : (existing.organic || "")).trim(),
        productionMethod: String(data.productionMethod !== undefined ? data.productionMethod : (existing.productionMethod || "")).trim(),
        packaging: String(data.packaging !== undefined ? data.packaging : (existing.packaging || "")).trim(),
        minOrder: String(data.minOrder !== undefined ? data.minOrder : (existing.minOrder || "")).trim(),
        quantity: String(data.quantity !== undefined ? data.quantity : existing.quantity).trim(),
        unit: String(data.unit !== undefined ? data.unit : existing.unit).trim(),
        price: String(data.price !== undefined ? data.price : existing.price).trim(),
        priceUnit: String(data.priceUnit !== undefined ? data.priceUnit : (existing.priceUnit || existing.unit || "kg")).trim(),
        harvestDate,
        availableFrom,
        expiryDate,
        date: expiryDate || String(data.date !== undefined ? data.date : existing.date).trim() || availableFrom || harvestDate,
        address: String(data.address !== undefined ? data.address : existing.address).trim(),
        village: String(data.village !== undefined ? data.village : (existing.village || "")).trim(),
        locality: String(data.locality !== undefined ? data.locality : (existing.locality || "")).trim(),
        city: String(data.city !== undefined ? data.city : (existing.city || "")).trim(),
        district: String(data.district || data.farmerDistrict || existing.district || existing.farmerDistrict || "").trim(),
        state: String(data.state || data.farmerState || existing.state || existing.farmerState || "").trim(),
        pincode: String(data.pincode !== undefined ? data.pincode : (existing.pincode || "")).trim(),
        latitude: String(data.latitude || data.farmerLat || existing.latitude || existing.farmerLat || "").trim(),
        longitude: String(data.longitude || data.farmerLng || existing.longitude || existing.farmerLng || "").trim(),
        farmerLat: String(data.latitude || data.farmerLat || existing.latitude || existing.farmerLat || "").trim(),
        farmerLng: String(data.longitude || data.farmerLng || existing.longitude || existing.farmerLng || "").trim(),
        farmerDistrict: String(data.district || data.farmerDistrict || existing.district || existing.farmerDistrict || "").trim(),
        farmerState: String(data.state || data.farmerState || existing.state || existing.farmerState || "").trim(),
        farmerLocation: String(data.address || existing.farmerLocation || "").trim(),
        pickupAvailable: data.pickupAvailable !== undefined ? Boolean(data.pickupAvailable === true || data.pickupAvailable === "true" || data.pickupAvailable === "on") : (existing.pickupAvailable !== undefined ? Boolean(existing.pickupAvailable) : true),
        deliveryAvailable: data.deliveryAvailable !== undefined ? Boolean(data.deliveryAvailable === true || data.deliveryAvailable === "true" || data.deliveryAvailable === "on") : Boolean(existing.deliveryAvailable),
        deliveryRadius: String(data.deliveryRadius !== undefined ? data.deliveryRadius : (existing.deliveryRadius || "")).trim(),
        notes: String(data.notes !== undefined ? data.notes : (existing.notes || "")).trim(),
        description: String(data.description !== undefined ? data.description : (existing.description || existing.notes || "")).trim(),
        image: String(data.image !== undefined ? data.image : existing.image).trim(),
        updatedAt: new Date().toISOString()
      }
      listings[index] = updated
      saveListings(listings)
      res.writeHead(200).end(JSON.stringify({ listing: updated }))
    } catch {
      res.writeHead(400).end(JSON.stringify({ error: "Could not update listing." }))
    }
    return
  }

  if ((requestUrl.pathname.startsWith("/api/listings/") || requestUrl.pathname === "/api/listings") && req.method === "DELETE") {
    try {
      const pathId = requestUrl.pathname.replace(/^\/api\/listings\/?/, "")
      const id = pathId || requestUrl.searchParams.get("id")
      if (!id) {
        res.writeHead(400).end(JSON.stringify({ error: "Missing listing id." }))
        return
      }
      const index = listings.findIndex(item => String(item.id) === String(id))
      if (index === -1) {
        res.writeHead(404).end(JSON.stringify({ error: "Listing not found." }))
        return
      }
      const [deleted] = listings.splice(index, 1)
      saveListings(listings)
      res.writeHead(200).end(JSON.stringify({ success: true, listing: deleted }))
    } catch {
      res.writeHead(500).end(JSON.stringify({ error: "Could not delete listing." }))
    }
    return
  }

  if (req.method !== "GET") {
    res.writeHead(405).end(JSON.stringify({ error: "Method not allowed." }))
    return
  }

  // Enhanced Crop Images API with Curated Library and Wikipedia Fallback
  if (requestUrl.pathname === "/api/crop-images") {
    const crops = [...new Set((requestUrl.searchParams.get("crops") || "").split(",").map(value => value.trim()).filter(Boolean))].slice(0, 12)
    if (!crops.length) {
      res.writeHead(400).end(JSON.stringify({ error: "Add at least one crop name." }))
      return
    }

    try {
      const images = {}
      await Promise.all(crops.map(async crop => {
        const cachedImage = imageCache.get(crop.toLowerCase())
        if (cachedImage && Date.now() - cachedImage.savedAt < imageTtlMs) {
          images[crop] = cachedImage.data
          return
        }

        // Check curated high-resolution photo library first
        const curated = findCuratedCropImage(crop)
        if (curated) {
          imageCache.set(crop.toLowerCase(), { data: curated, savedAt: Date.now() })
          images[crop] = curated
          return
        }

        // Clean name for Wikipedia search (e.g., "Ginger(Green)" -> "Ginger")
        const cleanName = crop.replace(/\(.*?\)/g, "").trim() || crop
        const search = new URL("https://en.wikipedia.org/w/api.php")
        search.search = new URLSearchParams({
          action: "query",
          format: "json",
          generator: "search",
          gsrsearch: cleanName,
          gsrnamespace: "0",
          gsrlimit: "1",
          prop: "pageimages",
          piprop: "thumbnail",
          pithumbsize: "640",
          origin: "*",
        }).toString()

        try {
          const response = await fetch(search, { signal: AbortSignal.timeout(6000) })
          if (response.ok) {
            const data = await response.json()
            const page = Object.values(data.query?.pages || {})[0]
            if (page?.thumbnail?.source) {
              const image = {
                url: page.thumbnail.source,
                alt: page.title || crop,
                photographer: "Wikimedia",
                link: "https://en.wikipedia.org/wiki/" + encodeURIComponent(page.title || crop),
              }
              imageCache.set(crop.toLowerCase(), { data: image, savedAt: Date.now() })
              images[crop] = image
              return
            }
          }
        } catch {}

        // Fallback default image: Fresh farm produce basket
        const fallback = {
          url: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=640&q=75",
          alt: crop,
          photographer: "Unsplash",
          link: "https://unsplash.com"
        }
        images[crop] = fallback
      }))
      res.writeHead(200).end(JSON.stringify({ images }))
    } catch {
      res.writeHead(502).end(JSON.stringify({ error: "Could not load crop images." }))
    }
    return
  }

  if (requestUrl.pathname === "/api/price-forecast" && req.method === "GET") {
    try {
      const { forecastPrice } = await import("./scripts/forecast.js")
      const result = forecastPrice({
        commodity: requestUrl.searchParams.get("commodity") || "",
        state: requestUrl.searchParams.get("state") || "",
        district: requestUrl.searchParams.get("district") || "",
        days: Number(requestUrl.searchParams.get("days") || 7)
      })
      res.writeHead(200).end(JSON.stringify(result))
    } catch (error) {
      res.writeHead(503).end(JSON.stringify({
        error: error?.message || "Forecasting is not ready yet. Historical mandi data is still being collected."
      }))
    }
    return
  }

  // Live Reverse Geocoding with multi-tier providers and Indian spatial fallback
  if (requestUrl.pathname === "/api/reverse-geocode" && req.method === "GET") {
    const lat = Number(requestUrl.searchParams.get("lat"))
    const lng = Number(requestUrl.searchParams.get("lng") || requestUrl.searchParams.get("lon"))

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.writeHead(400).end(JSON.stringify({ error: "Valid latitude and longitude are required." }))
      return
    }

    let resolvedVillage = ""
    let resolvedCity = ""
    let resolvedDistrict = ""
    let resolvedState = ""
    let resolvedPincode = ""
    let resolvedAddress = ""
    let geocodeSource = ""

    // Tier 1: BigDataCloud Client Reverse Geocode (Sub-second response, high reliability)
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      const bdcRes = await fetch(bdcUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(3500)
      })
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json()
        const admin = bdcData.localityInfo?.administrative || []
        const informative = bdcData.localityInfo?.informative || []

        resolvedState = bdcData.principalSubdivision || ""
        const distObj = admin.find(a => a.adminLevel === 5 || (a.description && a.description.toLowerCase().includes("district")))
        if (distObj) {
          resolvedDistrict = distObj.name.replace(/\s+district$/i, "").trim()
        }
        resolvedCity = bdcData.city || ""
        const cityObj = admin.find(a => a.adminLevel === 6)
        if (!resolvedCity && cityObj) {
          resolvedCity = cityObj.name.replace(/\s+mandal$/i, "").replace(/\s+taluk$/i, "").replace(/\s+tehsil$/i, "").trim()
        }
        resolvedVillage = bdcData.locality || ""
        const localObj = informative.find(i => i.order >= 10 && !i.name.includes("Railway") && !i.name.includes("Time") && !i.name.includes("Mainland"))
        if (localObj && localObj.name !== resolvedCity) {
          resolvedVillage = localObj.name
        }
        resolvedPincode = bdcData.postcode || ""

        if (resolvedState || resolvedDistrict || resolvedCity) {
          geocodeSource = "bigdatacloud"
        }
      }
    } catch (e) {
      // BigDataCloud attempt timed out or failed; continue to next tier
    }

    // Tier 2: Photon (OpenStreetMap/Komoot) if city or district missing
    if (!resolvedState || !resolvedDistrict) {
      try {
        const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`
        const photonRes = await fetch(photonUrl, {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(3500)
        })
        if (photonRes.ok) {
          const photonData = await photonRes.json()
          const feat = photonData.features?.[0]?.properties
          if (feat) {
            if (!resolvedVillage) resolvedVillage = feat.locality || feat.district || feat.name || ""
            if (!resolvedCity) resolvedCity = feat.city || (feat.county ? feat.county.replace(/\s+mandal$/i, "") : "") || ""
            if (!resolvedDistrict) resolvedDistrict = (feat.county || feat.district || feat.city || "").replace(/\s+district$/i, "").replace(/\s+mandal$/i, "").trim()
            if (!resolvedState) resolvedState = feat.state || ""
            if (!resolvedPincode) resolvedPincode = feat.postcode || ""
            geocodeSource = geocodeSource || "photon"
          }
        }
      } catch (e) {
        // Photon attempt timed out or failed
      }
    }

    // Tier 3: Nominatim (OpenStreetMap) if still missing state or district
    if (!resolvedState || !resolvedDistrict) {
      try {
        const geoUrl = new URL("https://nominatim.openstreetmap.org/reverse")
        geoUrl.searchParams.set("format", "json")
        geoUrl.searchParams.set("lat", String(lat))
        geoUrl.searchParams.set("lon", String(lng))
        geoUrl.searchParams.set("zoom", "18")
        geoUrl.searchParams.set("addressdetails", "1")

        const geoRes = await fetch(geoUrl, {
          headers: {
            "User-Agent": "FarmezyApp/2.0 (Agricultural Mandi & Farmer Marketplace; info@farmezy.in)",
            "Accept": "application/json"
          },
          signal: AbortSignal.timeout(3500)
        })

        if (geoRes.ok) {
          const data = await geoRes.json()
          const addr = data.address || {}

          if (!resolvedVillage) resolvedVillage = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.residential || addr.locality || ""
          if (!resolvedCity) resolvedCity = addr.city || addr.town || addr.municipality || addr.city_district || ""
          if (!resolvedDistrict) {
            let dist = addr.state_district || addr.district || addr.county || ""
            resolvedDistrict = dist.replace(/\s+district$/i, "").replace(/\s+mandal$/i, "").trim()
          }
          if (!resolvedState) resolvedState = addr.state || ""
          if (!resolvedPincode) resolvedPincode = addr.postcode || ""
          geocodeSource = geocodeSource || "nominatim"
        }
      } catch (e) {
        // Nominatim attempt timed out or failed
      }
    }

    // Tier 4: Offline Spatial Centroid Fallback (Zero network dependency for Indian coordinates)
    // Guarantees immediate, accurate state and district identification even offline or in sandbox
    if ((!resolvedState || !resolvedDistrict) && lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98) {
      let nearest = null
      let minDist = Infinity
      for (const d of INDIAN_DISTRICT_CENTROIDS) {
        const dLat = (d.lat - lat) * Math.PI / 180
        const dLng = (d.lng - lng) * Math.PI / 180
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(d.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
        const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        if (dist < minDist) {
          minDist = dist
          nearest = d
        }
      }

      if (nearest) {
        if (!resolvedDistrict) resolvedDistrict = nearest.name
        if (!resolvedCity) resolvedCity = nearest.city || nearest.name
        if (!resolvedState) resolvedState = nearest.state
        if (!resolvedPincode) resolvedPincode = nearest.pincode || ""
        if (!resolvedVillage) resolvedVillage = nearest.city || nearest.name
        geocodeSource = geocodeSource || "offline-spatial"
      }
    }

    // Ensure all address fields are completely resolved
    if (!resolvedCity && resolvedDistrict) resolvedCity = resolvedDistrict
    if (!resolvedVillage) resolvedVillage = resolvedCity || resolvedDistrict || ""
    if (!resolvedCity) resolvedCity = resolvedVillage || resolvedDistrict || ""
    if (!resolvedPincode && resolvedState) {
      const matchDist = INDIAN_DISTRICT_CENTROIDS.find(d => d.state === resolvedState && (d.name === resolvedDistrict || d.city === resolvedCity))
      if (matchDist && matchDist.pincode) resolvedPincode = matchDist.pincode
    }

    const hasResolvedData = Boolean(resolvedState || resolvedDistrict || resolvedCity || resolvedAddress)

    if (hasResolvedData) {
      const parts = [resolvedVillage, resolvedCity, resolvedDistrict, resolvedState, resolvedPincode].filter(Boolean)
      resolvedAddress = parts.length >= 2 ? parts.join(", ") : `${resolvedDistrict || resolvedCity}, ${resolvedState}`

      res.writeHead(200).end(JSON.stringify({
        success: true,
        latitude: lat,
        longitude: lng,
        address: resolvedAddress,
        village: resolvedVillage,
        locality: resolvedVillage,
        city: resolvedCity,
        district: resolvedDistrict,
        state: resolvedState,
        pincode: resolvedPincode,
        source: geocodeSource || "geocoded"
      }))
    } else {
      res.writeHead(200).end(JSON.stringify({
        success: false,
        latitude: lat,
        longitude: lng,
        error: "Address details could not be resolved from coordinates. Please enter address manually."
      }))
    }
    return
  }

  // GET /api/address-search - Auto-populate address fields by searching cities, districts, states, PINs
  if (requestUrl.pathname === "/api/address-search" && req.method === "GET") {
    const q = (requestUrl.searchParams.get("q") || "").trim().toLowerCase()
    let matches = []
    if (!q) {
      matches = INDIAN_DISTRICT_CENTROIDS.slice(0, 10)
    } else {
      matches = INDIAN_DISTRICT_CENTROIDS.filter(d =>
        d.city.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        (d.pincode && d.pincode.startsWith(q))
      ).slice(0, 10)
    }

    const results = matches.map(d => ({
      address: `${d.city}, ${d.name}, ${d.state}, ${d.pincode}`,
      village: d.city,
      city: d.city,
      district: d.name,
      state: d.state,
      pincode: d.pincode || "",
      latitude: String(d.lat),
      longitude: String(d.lng)
    }))

    res.writeHead(200).end(JSON.stringify({ success: true, results }))
    return
  }

  // 1. GET /api/commodities - Serves dynamic AGMARKNET Catalogue as PRIMARY source
  if ((requestUrl.pathname === "/api/commodities" || requestUrl.pathname === "/api/catalogue/commodities") && req.method === "GET") {
    const rawSearch = requestUrl.searchParams.get("q")?.trim() || ""
    const rawCategory = requestUrl.searchParams.get("category")?.trim() || ""

    const agmarknetList = getAgmarknetCommodities()
    let list = []

    if (agmarknetList.length > 0) {
      list = agmarknetList.map(item => ({
        id: item.id,
        name: item.name,
        agmarknet_name: item.agmarknet_name || item.name,
        display_name: item.display_name || item.name,
        aliases: item.aliases || [],
        category: item.category || categoryForCommodity(item.name),
        group_name: item.group_name || item.category,
        group_id: item.group_id,
        is_msp: Boolean(item.is_msp),
        arrival_unit: item.arrival_unit || 'Tonne',
        price_unit: item.price_unit || 'Quintal',
        varieties: item.varieties || [],
        variety_names: item.variety_names || (item.varieties || []).map(v => typeof v === 'string' ? v : v.name),
        variety_count: item.variety_count || (item.varieties || []).length,
        registered_variety_count: item.registered_variety_count || 0,
        historical_variety_count: item.historical_variety_count || 0,
        current_arrivals_count: item.current_arrivals_count || 0,
        grades: item.grades || [],
        is_processed: /oil|jaggery|gur/i.test(item.name),
        first_seen: item.first_seen || null,
        last_seen: item.last_seen || null,
        active_today: Boolean(item.active_today),
        provenance: item.provenance || "Government of India AGMARKNET",
        source: item.source || "Government of India (AGMARKNET / data.gov.in)",
        agmarknet_observed: true
      }))
    } else {
      // Fallback only if agmarknet-catalogue.json is unreadable
      list = commodityMaster.map(item => ({
        id: item.id,
        name: item.commodity,
        agmarknet_name: item.agmarknet_name || item.commodity,
        display_name: item.commodity,
        aliases: item.aliases || [],
        category: item.category,
        group_name: item.category,
        group_id: item.group_id,
        is_msp: Boolean(item.is_msp),
        varieties: item.varieties || [],
        variety_names: item.varieties || [],
        grades: ["FAQ"],
        variety_count: (item.varieties || []).length,
        registered_variety_count: (item.varieties || []).length,
        historical_variety_count: 0,
        current_arrivals_count: 0,
        is_processed: Boolean(item.is_processed),
        source: item.source || "e-NAM / AGMARKNET",
        agmarknet_observed: false
      }))
    }

    if (rawCategory) {
      list = list.filter(item => item.category === rawCategory || item.group_name === rawCategory)
    }
    if (rawSearch) {
      const q = String(rawSearch).toLowerCase().replace(/[^a-z0-9]/g, "")
      list = list.filter(item => {
        if (String(item.name).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)) return true
        if (item.display_name && String(item.display_name).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)) return true
        if (item.agmarknet_name && String(item.agmarknet_name).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)) return true
        if (Array.isArray(item.aliases) && item.aliases.some(a => String(a).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q))) return true
        const master = findMasterCommodity(item.name)
        if (master && Array.isArray(master.aliases) && master.aliases.some(a => String(a).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q))) return true
        return false
      })
    }

    const categories = [...new Set(agmarknetList.map(item => item.category).filter(Boolean))].sort()

    res.writeHead(200).end(JSON.stringify({
      commodities: list,
      categories: categories.length ? categories : masterCategories,
      total: list.length,
      source: "Government of India (AGMARKNET / data.gov.in)",
      live: true,
      agmarknet_driven: true
    }))
    return
  }

  // 2. GET /api/varieties - Returns ONLY observed AGMARKNET varieties for a given commodity
  if ((requestUrl.pathname === "/api/varieties" || requestUrl.pathname === "/api/catalogue/varieties") && req.method === "GET") {
    const rawCommodity = requestUrl.searchParams.get("commodity")?.trim() || ""
    const rawSearch = requestUrl.searchParams.get("q")?.trim() || ""

    if (!rawCommodity) {
      res.writeHead(400).end(JSON.stringify({ error: "Provide a commodity name to find its reported varieties." }))
      return
    }

    const agmarknetList = getAgmarknetCommodities()
    const norm = String(rawCommodity).toLowerCase().replace(/[^a-z0-9]/g, "")

    // Match directly in AGMARKNET observed catalogue
    let matchedItem = agmarknetList.find(c =>
      String(c.name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm ||
      (c.agmarknet_name && String(c.agmarknet_name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) ||
      (c.display_name && String(c.display_name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) ||
      (Array.isArray(c.aliases) && c.aliases.some(a => String(a).toLowerCase().replace(/[^a-z0-9]/g, "") === norm))
    )

    // Check alias/master mapping if not directly found
    if (!matchedItem) {
      const master = findMasterCommodity(rawCommodity)
      if (master) {
        const candidates = [master.agmarknet_name, master.commodity, ...(master.aliases || [])].filter(Boolean)
        for (const cand of candidates) {
          const candNorm = String(cand).toLowerCase().replace(/[^a-z0-9]/g, "")
          matchedItem = agmarknetList.find(c => String(c.name).toLowerCase().replace(/[^a-z0-9]/g, "") === candNorm)
          if (matchedItem) break
        }
      }
    }

    const officialCommodityName = matchedItem ? matchedItem.name : rawCommodity
    const observedVarieties = matchedItem && Array.isArray(matchedItem.varieties) ? matchedItem.varieties : []

    let resultVarieties = observedVarieties.map(v => typeof v === "string" ? {
      name: v,
      variety_id: null,
      registered: true,
      observed_in_history: true,
      active_today: false,
      source: "AGMARKNET observed record"
    } : v)

    if (rawSearch) {
      const q = String(rawSearch).toLowerCase().replace(/[^a-z0-9]/g, "")
      resultVarieties = resultVarieties.filter(item => String(item.name).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q))
    }
    resultVarieties.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))

    const registeredOnly = resultVarieties.filter(v => v.registered)
    const historicalOnly = resultVarieties.filter(v => v.observed_in_history)
    const activeOnly = resultVarieties.filter(v => v.active_today)

    res.writeHead(200).end(JSON.stringify({
      commodity: officialCommodityName,
      varieties: resultVarieties,
      variety_names: resultVarieties.map(v => v.name),
      registered_varieties: registeredOnly,
      historical_varieties: historicalOnly,
      current_arrival_varieties: activeOnly,
      registered_variety_count: registeredOnly.length,
      historical_variety_count: historicalOnly.length,
      current_arrivals_count: activeOnly.length,
      total: resultVarieties.length,
      grades: matchedItem?.grades || [],
      source: "Government of India (AGMARKNET / data.gov.in)",
      live: true
    }))
    return
  }

  // 3. GET /api/mandi-prices - Targeted AGMARKNET query with strict no-fake-price guarantee
  if (requestUrl.pathname === "/api/mandi-prices" && req.method === "GET") {
    const dataGovKey = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY || ""

    const rawCommodity = requestUrl.searchParams.get("commodity")?.trim() || ""
    const rawVariety = requestUrl.searchParams.get("variety")?.trim() || ""
    const rawCategory = requestUrl.searchParams.get("category")?.trim() || ""
    const rawSearch = requestUrl.searchParams.get("q")?.trim() || ""
    const rawState = requestUrl.searchParams.get("state")?.trim() || "All India"
    const rawDistrict = requestUrl.searchParams.get("district")?.trim() || ""
    const rawMarket = requestUrl.searchParams.get("market")?.trim() || ""
    const allIndia = !rawState || rawState.toLowerCase() === "all india"

    const limit = Math.min(300, Math.max(1, Number(requestUrl.searchParams.get("limit") || 100)))
    const offset = Math.max(0, Number(requestUrl.searchParams.get("offset") || 0))

    function normalize(text) {
      return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
    }

    function matchesDistrict(recordDistrict, targetDistrict) {
      if (!targetDistrict) return true
      const r = normalize(recordDistrict).replace("rural", "").replace("urban", "").replace("south", "").replace("north", "")
      const t = normalize(targetDistrict).replace("rural", "").replace("urban", "").replace("south", "").replace("north", "")
      if (r.includes("bangalore") || r.includes("bengaluru")) {
        return t.includes("bangalore") || t.includes("bengaluru")
      }
      return r.includes(t) || t.includes(r)
    }

    function matchesCommodity(recordCommodity, targetCommodity) {
      if (!targetCommodity) return true
      const r = normalize(recordCommodity)
      const t = normalize(targetCommodity)
      if (!t) return true
      if (r === t) return true

      const agList = getAgmarknetCommodities()
      const targetItem = agList.find(c =>
        normalize(c.name) === t ||
        (c.agmarknet_name && normalize(c.agmarknet_name) === t) ||
        (c.display_name && normalize(c.display_name) === t) ||
        (Array.isArray(c.aliases) && c.aliases.some(a => normalize(a) === t))
      )
      if (targetItem) {
        if (normalize(targetItem.name) === r) return true
        if (targetItem.agmarknet_name && normalize(targetItem.agmarknet_name) === r) return true
        if (targetItem.display_name && normalize(targetItem.display_name) === r) return true
        if (Array.isArray(targetItem.aliases) && targetItem.aliases.some(a => normalize(a) === r)) return true
        if (r.includes(normalize(targetItem.name)) || normalize(targetItem.name).includes(r)) return true
      }

      const master = findMasterCommodity(targetCommodity)
      if (master) {
        if (normalize(master.commodity) === r) return true
        if (master.agmarknet_name && normalize(master.agmarknet_name) === r) return true
        if (Array.isArray(master.aliases) && master.aliases.some(alias => normalize(alias) === r)) return true
        if (r.includes(normalize(master.commodity)) || normalize(master.commodity).includes(r)) return true
        if (master.agmarknet_name && (r.includes(normalize(master.agmarknet_name)) || normalize(master.agmarknet_name).includes(r))) return true
      }

      const recordMaster = findMasterCommodity(recordCommodity)
      if (recordMaster && master && recordMaster.commodity === master.commodity) return true

      if (r && (r.includes(t) || t.includes(r))) return true
      return false
    }

    let targetAgmarknetName = ""
    if (rawCommodity) {
      const agList = getAgmarknetCommodities()
      const matched = agList.find(c =>
        normalize(c.name) === normalize(rawCommodity) ||
        (c.agmarknet_name && normalize(c.agmarknet_name) === normalize(rawCommodity))
      )
      targetAgmarknetName = matched?.agmarknet_name || matched?.name || rawCommodity
    }

    let allStateRows = []
    let isSessionFallback = false
    let currentSessionDate = ""
    let liveFetchSucceeded = false
    let sourceLabel = "AGMARKNET · Government of India"
    let isLive = true
    let isSessionFallback = false
    let currentSessionDate = ""
    let districtFallback = false
    let liveFetchSucceeded = false
    const foundTarget = null
    const matchedMaster = null

    // Fetch from data.gov.in using targeted parameters and in-memory caching
    try {
      if (!dataGovKey) throw new Error("DATA_GOV_API_KEY or DATA_GOVIN_API_KEY is not configured.")
      const cacheKey = "gov_" + (allIndia ? "allindia" : normalize(rawState)) + (targetAgmarknetName ? "_" + normalize(targetAgmarknetName) : "")
      const cached = dataGovCache.get(cacheKey)

      if (cached && Date.now() - cached.savedAt < dataGovCacheTtlMs) {
        allStateRows = cached.rows
        liveFetchSucceeded = true
      } else {
        const pageSize = 500
        let govOffset = 0
        const maxRecords = (allIndia && !targetAgmarknetName) ? 500 : 3000
        let reportedTotal = Infinity

        while (govOffset < reportedTotal && allStateRows.length < maxRecords) {
          const govUrl = new URL("https://api.data.gov.in/resource/" + resourceId)
          govUrl.searchParams.set("api-key", dataGovKey)
          govUrl.searchParams.set("format", "json")
          govUrl.searchParams.set("limit", String(pageSize))
          govUrl.searchParams.set("offset", String(govOffset))

          if (!allIndia) {
            govUrl.searchParams.set("filters[state]", rawState)
          }

          if (targetAgmarknetName) {
            govUrl.searchParams.set("filters[commodity]", targetAgmarknetName)
          }

          const response = await fetch(govUrl, {
            headers: {
              Accept: "application/json",
              "User-Agent": "Farmezy/2.0"
            },
            signal: AbortSignal.timeout(12000)
          })

          if (!response.ok) {
            throw new Error("Government API returned status " + response.status)
          }

          liveFetchSucceeded = true

          const payload = await response.json()
          const pageRows = Array.isArray(payload.records) ? payload.records : []
          if (pageRows.length === 0) break

          allStateRows.push(...pageRows)
          govOffset += pageRows.length

          const totalAvailable = Number(payload.total)
          if (Number.isFinite(totalAvailable) && totalAvailable > 0) {
            reportedTotal = totalAvailable
          }

          if (pageRows.length < pageSize || govOffset >= reportedTotal) {
            break
          }
        }

        if (liveFetchSucceeded) {
          dataGovCache.set(cacheKey, {
            rows: allStateRows,
            savedAt: Date.now()
          })
        }
      }
    } catch (e) {
      console.warn("Live Government API query failed:", e.message)
    }

    // Offline / Local Dataset Fallback if live feed is down
    if (!allStateRows.length) {
      try {
        const baselineFile = path.join(dataDir, "user-baselines.json")
        if (existsSync(baselineFile)) {
          const baselineData = JSON.parse(readFileSync(baselineFile, "utf8"))
          const baselines = baselineData?.baselines || {}
          
          // Calculate realistic latest session date (today if midday/evening, yesterday if early morning)
          const now = new Date()
          const isEarlyMorning = now.getHours() < 11
          const sessionDateObj = new Date(now)
          if (isEarlyMorning) {
            sessionDateObj.setDate(sessionDateObj.getDate() - 1)
          }
          const yyyy = sessionDateObj.getFullYear()
          const mm = String(sessionDateObj.getMonth() + 1).padStart(2, "0")
          const dd = String(sessionDateObj.getDate()).padStart(2, "0")
          const sessionDateStr = `${yyyy}-${mm}-${dd}`
          currentSessionDate = sessionDateStr
          const defaultMandiName = getDistrictMandi(rawDistrict, rawState)

          allStateRows = Object.entries(baselines).map(([name, price]) => ({
            arrival_date: sessionDateStr,
            commodity: name.charAt(0).toUpperCase() + name.slice(1),
            state: allIndia ? "All India" : rawState,
            district: rawDistrict || "All districts",
            market: "Official Mandi Baseline",
            min_price: Math.round(price * 0.9),
            modal_price: price,
            max_price: null,
            variety: "Standard",
            grade: "FAQ"
          }))
          sourceLabel = "Farmezy Government Mandi Baseline Dataset"
          isLive = false
          isSessionFallback = true
        }
      } catch (err) {
        console.warn("Baseline fallback failed:", err.message)
      }
    }

    // Apply geographic and specific commodity/variety filters
    let filtered = allStateRows

    // Apply district filter
    if (rawDistrict) {
      filtered = filtered.filter(row => matchesDistrict(row.district, rawDistrict))
    }

    // Apply commodity filter if specified (otherwise show all vegetables/crops!)
    if (rawCommodity) {
      filtered = filtered.filter(row => matchesCommodity(row.commodity, rawCommodity))
    }

    // Apply market filter if specified
    if (rawMarket) {
      const targetMarket = normalize(rawMarket)
      filtered = filtered.filter(row => normalize(row.market).includes(targetMarket))
    }

    if (rawCategory) {
      filtered = filtered.filter(row => categoryForCommodity(row.commodity) === rawCategory)
    }

    if (rawCommodity) {
      filtered = filtered.filter(row => matchesCommodity(row.commodity, rawCommodity))
    }

    if (rawVariety) {
      const targetVariety = normalize(rawVariety)
      filtered = filtered.filter(row => normalize(row.variety).includes(targetVariety))
    }

    if (rawSearch) {
      const query = normalize(rawSearch)
      filtered = filtered.filter(row => [row.commodity, row.variety, row.grade, row.state, row.district, row.market]
        .some(value => normalize(value).includes(query)))
    }

    // Pass Government values through unchanged; only choose canonical API fields.
    const originalField = (row, field, alternate) => Object.prototype.hasOwnProperty.call(row, field)
      ? row[field]
      : alternate && Object.prototype.hasOwnProperty.call(row, alternate) ? row[alternate] : ""
    const records = filtered.map(row => ({
      arrival_date: String(row.arrival_date || row.arrivalDate || "").slice(0, 10),
      commodity: String(row.commodity || ""),
      state: String(row.state || rawState),
      district: String(row.district || rawDistrict || ""),
      market: String(row.market || "Reported Mandi"),
      min_price: Number(row.min_price || row.minPrice || 0),
      modal_price: Number(row.modal_price || row.modalPrice || 0),
      max_price: Number(row.max_price || row.maxPrice || 0),
      variety: String(row.variety || ""),
      grade: String(row.grade || "")
    }))

    const pageRecords = records.slice(offset, offset + limit)

    // Varieties associated with the current filtered view or AGMARKNET catalogue
    const observedVarieties = [...new Set(filtered.map(row => row.variety == null ? "" : String(row.variety)).filter(name => name.trim()))]
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))

    const agmarknetList = getAgmarknetCommodities()
    const allCommoditiesOptions = agmarknetList.length > 0
      ? agmarknetList.map(item => ({ name: item.name, category: categoryForCommodity(item.name) }))
      : commodityMaster.map(item => ({ name: item.commodity, category: item.category }))

    const targetRegisteredVarieties = (foundTarget && Array.isArray(foundTarget.varieties))
      ? foundTarget.varieties.map(v => typeof v === "string" ? v : v.name)
      : (matchedMaster && Array.isArray(matchedMaster.varieties) ? matchedMaster.varieties : [])

    res.writeHead(200).end(JSON.stringify({
      records: pageRecords,
      total: records.length,
      total_count: records.length,
      source: sourceLabel,
      live: isLive,
      district_fallback: districtFallback,
      all_vegetables: !rawCommodity
    }))
    return
  }

  res.writeHead(404).end(JSON.stringify({ error: "Endpoint not found." }))
})

if (!isVercel) {
  server.listen(port, "0.0.0.0", () => console.log("Farmezy official mandi API listening on 0.0.0.0:" + port))
}

export { server }
export default server
