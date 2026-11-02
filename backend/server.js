import http from "node:http"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { findProduceDefinition, validateImageCandidate, cleanCropName } from "./produce-taxonomy.js"

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data")
const listingsFile = path.join(dataDir, "listings.json")
const ordersFile = path.join(dataDir, "orders.json")
const imageCacheFile = path.join(dataDir, "image-cache.json")

try {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env")
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
    }
  }
} catch {}

const port = Number(process.env.API_PORT || 3001)
const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"
const dataGovCache = new Map()
const dataGovCacheTtlMs = 15 * 60 * 1000 // 15 minutes cache

function loadImageCache() {
  try {
    if (!existsSync(imageCacheFile)) return new Map()
    const raw = JSON.parse(readFileSync(imageCacheFile, "utf8"))
    return new Map(Object.entries(raw))
  } catch {
    return new Map()
  }
}

const imageCache = loadImageCache()
const imageTtlMs = 24 * 60 * 60 * 1000

function saveImageCache() {
  try {
    mkdirSync(dataDir, { recursive: true })
    const serializable = Object.fromEntries(imageCache.entries())
    writeFileSync(imageCacheFile, JSON.stringify(serializable, null, 2))
  } catch {}
}

function loadListings() {
  try {
    if (!existsSync(listingsFile)) return []
    const data = JSON.parse(readFileSync(listingsFile, "utf8"))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveListings(listings) {
  mkdirSync(dataDir, { recursive: true })
  writeFileSync(listingsFile, JSON.stringify(listings, null, 2))
}

let listings = loadListings()

function loadOrders() {
  try {
    if (!existsSync(ordersFile)) return []
    const data = JSON.parse(readFileSync(ordersFile, "utf8"))
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

function saveOrders(orders) {
  mkdirSync(dataDir, { recursive: true })
  writeFileSync(ordersFile, JSON.stringify(orders, null, 2))
}

let orders = loadOrders()

function startHistoricalCollector() {
  if (!(process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY)) return
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
  ginger: { url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg", alt: "Fresh ginger rhizome (Zingiber officinale)", photographer: "Sanjay Acharya (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Fresh_ginger_rhizome_01.jpg" },
  "ginger green": { url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg", alt: "Fresh green ginger rhizome (Zingiber officinale)", photographer: "Sanjay Acharya (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Fresh_ginger_rhizome_01.jpg" },
  "ginger dry": { url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg", alt: "Dry ginger rhizome (Zingiber officinale)", photographer: "Sanjay Acharya (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Fresh_ginger_rhizome_01.jpg" },
  adrak: { url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg", alt: "Fresh adrak / ginger (Zingiber officinale)", photographer: "Sanjay Acharya (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Fresh_ginger_rhizome_01.jpg" },
  inji: { url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg", alt: "Fresh inji / ginger (Zingiber officinale)", photographer: "Sanjay Acharya (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Fresh_ginger_rhizome_01.jpg" },
  allam: { url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg", alt: "Fresh allam / ginger (Zingiber officinale)", photographer: "Sanjay Acharya (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Fresh_ginger_rhizome_01.jpg" },
  shunti: { url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg", alt: "Fresh shunti / ginger (Zingiber officinale)", photographer: "Sanjay Acharya (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Fresh_ginger_rhizome_01.jpg" },

  "ladies finger": { url: "/ladies_finger.jpg", alt: "Fresh ladies finger / okra pods", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg" },
  "lady finger": { url: "/ladies_finger.jpg", alt: "Fresh lady finger pods", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg" },
  "lady s finger": { url: "/ladies_finger.jpg", alt: "Fresh lady's finger pods", photographer: "Wikimedia Commons", link: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg" },
  ladies: { url: "/ladies_finger.jpg", alt: "Fresh ladies finger / okra", photographer: "Wikimedia Commons" },
  bhindi: { url: "/ladies_finger.jpg", alt: "Fresh bhindi / okra", photographer: "Wikimedia Commons" },
  bhendi: { url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg", alt: "Fresh green okra / bhendi pods (Abelmoschus esculentus)", photographer: "Diptanshu Sharma (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Bucket_of_raw_okra_pods.jpg" },
  vendakkai: { url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg", alt: "Fresh green okra / vendakkai pods (Abelmoschus esculentus)", photographer: "Diptanshu Sharma (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Bucket_of_raw_okra_pods.jpg" },
  okra: { url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg", alt: "Fresh green okra pods (Abelmoschus esculentus)", photographer: "Diptanshu Sharma (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Bucket_of_raw_okra_pods.jpg" },
  "ladies finger": { url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg", alt: "Fresh green ladies finger pods (Abelmoschus esculentus)", photographer: "Diptanshu Sharma (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Bucket_of_raw_okra_pods.jpg" },
  "lady finger": { url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Bucket_of_raw_okra_pods.jpg", alt: "Fresh green lady finger pods (Abelmoschus esculentus)", photographer: "Diptanshu Sharma (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Bucket_of_raw_okra_pods.jpg" },

  tomato: { url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=640&q=75", alt: "Fresh red vine tomatoes (Solanum lycopersicum)", photographer: "Thomas Martinsen (Unsplash)", link: "https://unsplash.com/photos/fresh-red-tomatoes-on-vine-Xb_a0YjD3Gg?utm_source=farmezy&utm_medium=referral" },
  onion: { url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=640&q=75", alt: "Fresh red onion bulbs (Allium cepa)", photographer: "Ksenia Chernaya (Unsplash)", link: "https://unsplash.com/photos/pile-of-red-onions-qJz5Hh3n4s4?utm_source=farmezy&utm_medium=referral" },
  potato: { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&q=75", alt: "Fresh raw harvested potatoes (Solanum tuberosum)", photographer: "Lars Blankers (Unsplash)", link: "https://unsplash.com/photos/bunch-of-potatoes-B0s3xndEpng?utm_source=farmezy&utm_medium=referral" },
  carrot: { url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=640&q=75", alt: "Fresh raw orange carrots (Daucus carota)", photographer: "Harshal S. Hirve (Unsplash)", link: "https://unsplash.com/photos/a-pile-of-carrots-sitting-on-top-of-each-other-uQg13wbq6FM?utm_source=farmezy&utm_medium=referral" },
  cabbage: { url: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=640&q=75", alt: "Fresh green cabbage head (Brassica oleracea)", photographer: "Kenan Kitchen (Unsplash)", link: "https://unsplash.com/photos/green-cabbage-on-white-surface-u_kX97B_f5A?utm_source=farmezy&utm_medium=referral" },

  "ash gourd": { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Benincasa_hispida-1-selvapuram-coimbatore-India.jpg", alt: "Fresh authentic ash gourd / wax gourd (Benincasa hispida)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Benincasa_hispida-1-selvapuram-coimbatore-India.jpg" },
  ashgourd: { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Benincasa_hispida-1-selvapuram-coimbatore-India.jpg", alt: "Fresh authentic ash gourd / wax gourd (Benincasa hispida)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Benincasa_hispida-1-selvapuram-coimbatore-India.jpg" },
  "winter melon": { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Benincasa_hispida-1-selvapuram-coimbatore-India.jpg", alt: "Fresh authentic ash gourd / wax gourd (Benincasa hispida)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Benincasa_hispida-1-selvapuram-coimbatore-India.jpg" },
  petha: { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Benincasa_hispida-1-selvapuram-coimbatore-India.jpg", alt: "Fresh authentic ash gourd / petha (Benincasa hispida)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Benincasa_hispida-1-selvapuram-coimbatore-India.jpg" },
  kumbalakai: { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Benincasa_hispida-1-selvapuram-coimbatore-India.jpg", alt: "Fresh authentic ash gourd / kumbalakai (Benincasa hispida)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Benincasa_hispida-1-selvapuram-coimbatore-India.jpg" },

  "bitter gourd": { url: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Momordica_charantia.jpg", alt: "Fresh authentic bitter gourd / bitter melon (Momordica charantia)", photographer: "Eric in SF (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Momordica_charantia.jpg" },
  "bitter melon": { url: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Momordica_charantia.jpg", alt: "Fresh authentic bitter gourd / bitter melon (Momordica charantia)", photographer: "Eric in SF (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Momordica_charantia.jpg" },
  karela: { url: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Momordica_charantia.jpg", alt: "Fresh authentic bitter gourd / karela (Momordica charantia)", photographer: "Eric in SF (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Momordica_charantia.jpg" },
  hagalakayi: { url: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Momordica_charantia.jpg", alt: "Fresh authentic bitter gourd / hagalakayi (Momordica charantia)", photographer: "Eric in SF (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Momordica_charantia.jpg" },
  pavakkai: { url: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Momordica_charantia.jpg", alt: "Fresh authentic bitter gourd / pavakkai (Momordica charantia)", photographer: "Eric in SF (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Momordica_charantia.jpg" },

  "snake gourd": { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },
  snakegourd: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },
  snakeguard: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },
  "snake guard": { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },
  chichinda: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd / chichinda (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },
  padavalakai: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd / padavalakai (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },
  padavalkayi: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd / padavalkayi (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },
  pudalangai: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd / pudalangai (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },
  potlakaya: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Trichosanthes_cucumerina_%28snake_gourd%29.jpg", alt: "Fresh authentic snake gourd / potlakaya (Trichosanthes cucumerina)", photographer: "Augustus Binu (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Trichosanthes_cucumerina_(snake_gourd).jpg" },

  "ridge gourd": { url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Luffa_acutangula.jpg", alt: "Fresh green ridge gourd / luffa (Luffa acutangula)", photographer: "SarKaLay (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Luffa_acutangula.jpg" },
  ridgeguard: { url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Luffa_acutangula.jpg", alt: "Fresh green ridge gourd / tori (Luffa acutangula)", photographer: "SarKaLay (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Luffa_acutangula.jpg" },
  ridgegourd: { url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Luffa_acutangula.jpg", alt: "Fresh green ridge gourd / tori (Luffa acutangula)", photographer: "SarKaLay (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Luffa_acutangula.jpg" },
  tori: { url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Luffa_acutangula.jpg", alt: "Fresh green ridge gourd / tori (Luffa acutangula)", photographer: "SarKaLay (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Luffa_acutangula.jpg" },
  turai: { url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Luffa_acutangula.jpg", alt: "Fresh green ridge gourd / turai (Luffa acutangula)", photographer: "SarKaLay (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Luffa_acutangula.jpg" },

  "knool khol": { url: "https://upload.wikimedia.org/wikipedia/commons/6/60/Kohlrabi.jpg", alt: "Fresh knool khol / kohlrabi", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org/wiki/File:Kohlrabi.jpg" },
  kohlrabi: { url: "https://upload.wikimedia.org/wikipedia/commons/6/60/Kohlrabi.jpg", alt: "Fresh kohlrabi", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org/wiki/File:Kohlrabi.jpg" },

  "elephant foot yam": { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg", alt: "Elephant foot yam / suran corm (Amorphophallus paeoniifolius)", photographer: "Wee Hong (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg" },
  "elephant yam": { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg", alt: "Elephant foot yam / suran corm (Amorphophallus paeoniifolius)", photographer: "Wee Hong (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg" },
  suran: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg", alt: "Elephant foot yam / suran corm (Amorphophallus paeoniifolius)", photographer: "Wee Hong (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg" },
  amphophalus: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg", alt: "Elephant foot yam (Amorphophallus paeoniifolius)", photographer: "Wee Hong (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg" },

  "bengal gram": { url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Cicer_arietinum_%284217744781%29.jpg", alt: "Dried whole chickpea / Bengal gram grains (Cicer arietinum)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cicer_arietinum_(4217744781).jpg" },
  chana: { url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Cicer_arietinum_%284217744781%29.jpg", alt: "Dried whole chickpea / Bengal gram grains (Cicer arietinum)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cicer_arietinum_(4217744781).jpg" },
  arecanut: { url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Areca_nut_in_a_basket.jpg", alt: "Arecanut / supari in a basket", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org/wiki/File:Areca_nut_in_a_basket.jpg" },
  gur: { url: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Jaggery_blocks.jpg", alt: "Traditional jaggery / gur blocks", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org/wiki/File:Jaggery_blocks.jpg" },
  jaggery: { url: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Jaggery_blocks.jpg", alt: "Traditional jaggery blocks", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org/wiki/File:Jaggery_blocks.jpg" },

  drumstick: { url: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Moringa_oleifera_pods_NP.JPG", alt: "Fresh green drumsticks / moringa pods (Moringa oleifera)", photographer: "Krish Dulal (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Moringa_oleifera_pods_NP.JPG" },
  moringa: { url: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Moringa_oleifera_pods_NP.JPG", alt: "Fresh green moringa pods (Moringa oleifera)", photographer: "Krish Dulal (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Moringa_oleifera_pods_NP.JPG" },
  broccoli: { url: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=640&q=75", alt: "Fresh green broccoli", photographer: "Annie Spratt (Unsplash)", link: "https://unsplash.com" },
  garlic: { url: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=640&q=75", alt: "Fresh garlic bulbs", photographer: "Nick Fewings (Unsplash)", link: "https://unsplash.com" },
  cucumber: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh green cucumbers", photographer: "Harshal S. Hirve (Unsplash)", link: "https://unsplash.com" },
  cucumbar: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh green cucumber / kheera", photographer: "Harshal S. Hirve (Unsplash)", link: "https://unsplash.com" },
  kheera: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh green cucumber / kheera", photographer: "Harshal S. Hirve (Unsplash)", link: "https://unsplash.com" },
  cauliflower: { url: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=640&q=75", alt: "Fresh white cauliflower", photographer: "Unsplash", link: "https://unsplash.com" },
  brinjal: { url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Solanum_melongena_24_08_2012_%281%29.JPG", alt: "Fresh purple brinjal / eggplant (Solanum melongena)", photographer: "Joydeep (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Solanum_melongena_24_08_2012_(1).JPG" },
  eggplant: { url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Solanum_melongena_24_08_2012_%281%29.JPG", alt: "Fresh purple brinjal / eggplant (Solanum melongena)", photographer: "Joydeep (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Solanum_melongena_24_08_2012_(1).JPG" },
  aubergine: { url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Solanum_melongena_24_08_2012_%281%29.JPG", alt: "Fresh purple brinjal / eggplant (Solanum melongena)", photographer: "Joydeep (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Solanum_melongena_24_08_2012_(1).JPG" },
  baingan: { url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Solanum_melongena_24_08_2012_%281%29.JPG", alt: "Fresh purple brinjal / eggplant (Solanum melongena)", photographer: "Joydeep (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Solanum_melongena_24_08_2012_(1).JPG" },
  badanekai: { url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Solanum_melongena_24_08_2012_%281%29.JPG", alt: "Fresh purple brinjal / eggplant (Solanum melongena)", photographer: "Joydeep (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Solanum_melongena_24_08_2012_(1).JPG" },
  "bottle gourd": { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  lauki: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  doodhi: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  sorekayi: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  surakkai: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  sorakaya: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  calabash: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  sesame: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  "sesame seeds": { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  sesamum: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  til: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  gingelly: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  ellu: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  nuvvulu: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  mustard: { url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=640&q=75", alt: "Natural whole raw mustard seeds (Brassica)", photographer: "Towfiqu barbhuiya (Unsplash)", link: "https://unsplash.com/photos/a-close-up-of-mustard-seeds-EmA2RjP_13Y?utm_source=farmezy&utm_medium=referral" },
  sarson: { url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=640&q=75", alt: "Natural whole raw mustard seeds (Brassica)", photographer: "Towfiqu barbhuiya (Unsplash)", link: "https://unsplash.com/photos/a-close-up-of-mustard-seeds-EmA2RjP_13Y?utm_source=farmezy&utm_medium=referral" },
  chilli: { url: "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=640&q=75", alt: "Fresh green chillies", photographer: "Unsplash", link: "https://unsplash.com" },
  chili: { url: "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=640&q=75", alt: "Fresh chillies", photographer: "Unsplash", link: "https://unsplash.com" },
  beans: { url: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Green_beans_2_-_Massachusetts.jpg", alt: "Fresh authentic green beans / French beans (Phaseolus vulgaris)", photographer: "Daderot (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Green_beans_2_-_Massachusetts.jpg" },
  bean: { url: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Green_beans_2_-_Massachusetts.jpg", alt: "Fresh authentic green beans / French beans (Phaseolus vulgaris)", photographer: "Daderot (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Green_beans_2_-_Massachusetts.jpg" },
  "green beans": { url: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Green_beans_2_-_Massachusetts.jpg", alt: "Fresh authentic green beans (Phaseolus vulgaris)", photographer: "Daderot (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Green_beans_2_-_Massachusetts.jpg" },
  "french beans": { url: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Green_beans_2_-_Massachusetts.jpg", alt: "Fresh authentic French beans (Phaseolus vulgaris)", photographer: "Daderot (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Green_beans_2_-_Massachusetts.jpg" },
  frasbean: { url: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Green_beans_2_-_Massachusetts.jpg", alt: "Fresh authentic French beans / frasbean (Phaseolus vulgaris)", photographer: "Daderot (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Green_beans_2_-_Massachusetts.jpg" },

  thogarikai: { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic cluster beans / thogarikai / guar (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  thogrikai: { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic cluster beans / thogrikai / guar (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  "cluster beans": { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic cluster beans / guar (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  "cluster bean": { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic cluster beans / guar (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  guar: { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic guar / cluster beans (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  gawar: { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic gawar / cluster beans (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  gavar: { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic gavar / cluster beans (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  gorikayi: { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic gorikayi / cluster beans (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  gorikai: { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic gorikai / cluster beans (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  kothavarangai: { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG", alt: "Fresh authentic kothavarangai / cluster beans (Cyamopsis tetragonoloba)", photographer: "Yercaud-elango (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cyamopsis_tetragonoloba-1-yercaud-salem-India.JPG" },
  beetroot: { url: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=640&q=75", alt: "Fresh beetroot", photographer: "Unsplash", link: "https://unsplash.com" },
  capsicum: { url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=640&q=75", alt: "Fresh bell pepper / capsicum", photographer: "Unsplash", link: "https://unsplash.com" },
  peas: { url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=640&q=75", alt: "Fresh green peas", photographer: "Unsplash", link: "https://unsplash.com" },
  radish: { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Daikon%2C_Nara_Prefecture%2C_Japan.jpg", alt: "Fresh authentic long white daikon radishes (Raphanus sativus var. longipinnatus)", photographer: "jetsun (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Daikon,_Nara_Prefecture,_Japan.jpg" },
  raddish: { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Daikon%2C_Nara_Prefecture%2C_Japan.jpg", alt: "Fresh authentic long white daikon radishes (Raphanus sativus var. longipinnatus)", photographer: "jetsun (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Daikon,_Nara_Prefecture,_Japan.jpg" },
  mooli: { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Daikon%2C_Nara_Prefecture%2C_Japan.jpg", alt: "Fresh authentic mooli / long white daikon radishes (Raphanus sativus var. longipinnatus)", photographer: "jetsun (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Daikon,_Nara_Prefecture,_Japan.jpg" },
  mullangi: { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Daikon%2C_Nara_Prefecture%2C_Japan.jpg", alt: "Fresh authentic mullangi / long white daikon radishes (Raphanus sativus var. longipinnatus)", photographer: "jetsun (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Daikon,_Nara_Prefecture,_Japan.jpg" },
  moolangi: { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Daikon%2C_Nara_Prefecture%2C_Japan.jpg", alt: "Fresh authentic moolangi / long white daikon radishes (Raphanus sativus var. longipinnatus)", photographer: "jetsun (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Daikon,_Nara_Prefecture,_Japan.jpg" },
  daikon: { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Daikon%2C_Nara_Prefecture%2C_Japan.jpg", alt: "Fresh authentic long white daikon radishes (Raphanus sativus var. longipinnatus)", photographer: "jetsun (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Daikon,_Nara_Prefecture,_Japan.jpg" },
  "white radish": { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Daikon%2C_Nara_Prefecture%2C_Japan.jpg", alt: "Fresh authentic long white daikon radishes (Raphanus sativus var. longipinnatus)", photographer: "jetsun (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Daikon,_Nara_Prefecture,_Japan.jpg" },

  "knol khol": { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic knol khol / kohlrabi (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  knolkhol: { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic knol khol / kohlrabi (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  "knool khol": { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic knool khol / kohlrabi (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  knoolkhol: { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic knool khol / kohlrabi (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  kohlrabi: { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic kohlrabi / knol khol (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  "german turnip": { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic German turnip / kohlrabi (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  "ganth gobi": { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic ganth gobi / kohlrabi (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  ganthgobi: { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic ganth gobi / kohlrabi (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  "navil kosu": { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic navil kosu / knol khol (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  navilkosu: { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic navil kosu / knol khol (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  noolkol: { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic noolkol / knol khol (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  "nool kol": { url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/KohlrabiinMarket.jpg", alt: "Fresh authentic noolkol / knol khol (Brassica oleracea Gongylodes)", photographer: "Secretlondon (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:KohlrabiinMarket.jpg" },
  spinach: { url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=640&q=75", alt: "Fresh spinach leaves", photographer: "Unsplash", link: "https://unsplash.com" },
  banana: { url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=640&q=75", alt: "Fresh bananas", photographer: "Unsplash", link: "https://unsplash.com" },
  apple: { url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=640&q=75", alt: "Fresh apples", photographer: "Unsplash", link: "https://unsplash.com" },
  mango: { url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=640&q=75", alt: "Fresh mangoes", photographer: "Unsplash", link: "https://unsplash.com" },
  lemon: { url: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=640&q=75", alt: "Fresh lemons", photographer: "Unsplash", link: "https://unsplash.com" },
  lime: { url: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=640&q=75", alt: "Fresh limes", photographer: "Unsplash", link: "https://unsplash.com" },
  grapes: { url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=640&q=75", alt: "Fresh grapes", photographer: "Unsplash", link: "https://unsplash.com" },
  papaya: { url: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=640&q=75", alt: "Fresh papaya", photographer: "Unsplash", link: "https://unsplash.com" },
  pumpkin: { url: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=640&q=75", alt: "Fresh pumpkin", photographer: "Unsplash", link: "https://unsplash.com" },
  coriander: { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&q=75", alt: "Fresh coriander leaves", photographer: "Unsplash", link: "https://unsplash.com" },
  mint: { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&q=75", alt: "Fresh mint leaves", photographer: "Unsplash", link: "https://unsplash.com" },
  wheat: { url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=640&q=75", alt: "Golden wheat crop", photographer: "Unsplash", link: "https://unsplash.com" },
  rice: { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=75", alt: "Wholesale rice grains", photographer: "Unsplash", link: "https://unsplash.com" },
  paddy: { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=75", alt: "Wholesale paddy / rice", photographer: "Unsplash", link: "https://unsplash.com" },
  maize: { url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=640&q=75", alt: "Fresh corn / maize", photographer: "Unsplash", link: "https://unsplash.com" },
  ragi: { url: "https://upload.wikimedia.org/wikipedia/commons/6/61/Eleusine_coracana_Manneczka_%C5%82%C4%99kowata_2020-10-03_03.jpg", alt: "Finger millet / ragi grain spikes (Eleusine coracana)", photographer: "Manneczka Łękowata (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Eleusine_coracana_Manneczka_%C5%82%C4%99kowata_2020-10-03_03.jpg" },
  "finger millet": { url: "https://upload.wikimedia.org/wikipedia/commons/6/61/Eleusine_coracana_Manneczka_%C5%82%C4%99kowata_2020-10-03_03.jpg", alt: "Finger millet / ragi grain spikes (Eleusine coracana)", photographer: "Manneczka Łękowata (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Eleusine_coracana_Manneczka_%C5%82%C4%99kowata_2020-10-03_03.jpg" },
  moong: { url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Mung_beans_%28Vigna_radiata%29.jpg", alt: "Whole dry green mung beans (Vigna radiata)", photographer: "Ivar Leidus (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Mung_beans_(Vigna_radiata).jpg" },
  "green gram": { url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Mung_beans_%28Vigna_radiata%29.jpg", alt: "Whole dry green mung beans (Vigna radiata)", photographer: "Ivar Leidus (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Mung_beans_(Vigna_radiata).jpg" },
  "mung bean": { url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Mung_beans_%28Vigna_radiata%29.jpg", alt: "Whole dry green mung beans (Vigna radiata)", photographer: "Ivar Leidus (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Mung_beans_(Vigna_radiata).jpg" },
  "green gram dal": { url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Mung_beans_%28Vigna_radiata%29.jpg", alt: "Whole dry green mung beans (Vigna radiata)", photographer: "Ivar Leidus (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Mung_beans_(Vigna_radiata).jpg" },
  "moong dal": { url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Mung_beans_%28Vigna_radiata%29.jpg", alt: "Whole dry green mung beans (Vigna radiata)", photographer: "Ivar Leidus (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Mung_beans_(Vigna_radiata).jpg" },
  "avare dal": { url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lablab_purpureus_257105665.jpg", alt: "Fresh hyacinth bean / avare dal pods (Lablab purpureus)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Lablab_purpureus_257105665.jpg" },
  avare: { url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lablab_purpureus_257105665.jpg", alt: "Fresh hyacinth bean / avare pods (Lablab purpureus)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Lablab_purpureus_257105665.jpg" },
  avarekalu: { url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lablab_purpureus_257105665.jpg", alt: "Hyacinth bean / avarekalu (Lablab purpureus)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Lablab_purpureus_257105665.jpg" },
  "hyacinth bean": { url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lablab_purpureus_257105665.jpg", alt: "Hyacinth bean (Lablab purpureus)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Lablab_purpureus_257105665.jpg" },
  "field bean": { url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lablab_purpureus_257105665.jpg", alt: "Field bean / hyacinth bean pods (Lablab purpureus)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Lablab_purpureus_257105665.jpg" },
  cotton: { url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=640&q=75", alt: "Fresh cotton crop", photographer: "Unsplash", link: "https://unsplash.com" },
  groundnut: { url: "https://images.unsplash.com/photo-1568283661195-266657962cfc?auto=format&fit=crop&w=640&q=75", alt: "Fresh groundnuts", photographer: "Unsplash", link: "https://unsplash.com" }
}

function findCuratedCropImage(name) {
  const clean = cleanCropName(name)
  if (!clean) return null
  const sorted = Object.entries(curatedCropImages).sort((a, b) => b[0].length - a[0].length)
  for (const [key, image] of sorted) {
    if (clean === key || (" " + clean + " ").includes(" " + key + " ")) {
      return { ...image, link: image.link || "https://unsplash.com" }
    }
  }
  return null
}

const COMMODITY_SYNONYMS = {
  "red amaranthus": ["amaranthus tricolor", "red amaranth", "amaranthus"],
  "amaranthus tricolor": ["red amaranthus", "amaranth leaves", "amaranthus"],
  "amaranth": ["amaranthus", "amaranthus tricolor", "chaulai"],
  "elephant foot yam": ["amorphophallus paeoniifolius", "elephant yam", "suran"],
  "elephant yam": ["amorphophallus paeoniifolius", "elephant foot yam", "suran"],
  "suran": ["amorphophallus paeoniifolius", "elephant foot yam", "elephant yam"],
  "apricot": ["apricot fruit", "prunus armeniaca", "fresh apricot"],
  "jowar": ["sorghum bicolor", "sorghum grain", "great millet"],
  "sorghum": ["sorghum bicolor", "jowar", "great millet"],
  "bajra": ["pennisetum glaucum", "pearl millet"],
  "pearl millet": ["pennisetum glaucum", "bajra"],
  "finger millet": ["eleusine coracana", "ragi"],
  "ragi": ["eleusine coracana", "finger millet"],
  "foxtail millet": ["setaria italica", "kangni", "navane"],
  "barley": ["hordeum vulgare", "jau"],
  "chickpea": ["cicer arietinum", "bengal gram", "chana"],
  "bengal gram": ["cicer arietinum", "chickpea", "chana"],
  "pigeon pea": ["cajanus cajan", "arhar dal", "toor dal"],
  "arhar": ["cajanus cajan", "toor dal", "pigeon pea"],
  "toor": ["cajanus cajan", "pigeon pea", "arhar"],
  "moong": ["vigna radiata", "green gram", "mung bean"],
  "green gram": ["vigna radiata", "moong", "mung bean"],
  "green gram dal": ["vigna radiata", "green gram", "moong dal", "mung bean"],
  "moong dal": ["vigna radiata", "moong", "green gram dal", "mung bean"],
  "avare dal": ["lablab purpureus", "hyacinth bean", "field bean", "avare", "avarekalu", "avarekai", "mochai"],
  "avare": ["lablab purpureus", "hyacinth bean", "avare dal", "avarekalu", "field bean"],
  "avarekalu": ["lablab purpureus", "hyacinth bean", "avare dal", "field bean"],
  "hyacinth bean": ["lablab purpureus", "avare dal", "field bean", "avarekalu"],
  "field bean": ["lablab purpureus", "hyacinth bean", "avare dal", "avarekalu"],
  "black gram": ["vigna mungo", "urad dal", "urad"],
  "urad": ["vigna mungo", "black gram"],
  "lentil": ["lens culinaris", "masoor dal"],
  "masoor": ["lens culinaris", "lentil"],
  "soyabean": ["glycine max", "soybean"],
  "soybean": ["glycine max", "soyabean"],
  "mustard": ["brassica juncea", "sarson", "mustard seeds"],
  "sarson": ["brassica juncea", "mustard"],
  "sesame": ["sesamum indicum", "til seeds", "til", "gingelly", "ellu", "nuvvulu"],
  "sesamum": ["sesamum indicum", "sesame", "til", "gingelly", "ellu", "nuvvulu"],
  "til": ["sesamum indicum", "sesame", "gingelly", "ellu", "nuvvulu"],
  "gingelly": ["sesamum indicum", "sesame", "til", "ellu", "nuvvulu"],
  "brinjal": ["eggplant", "aubergine", "baingan", "badanekai", "solanum melongena", "vankaya"],
  "eggplant": ["brinjal", "aubergine", "baingan", "badanekai", "solanum melongena"],
  "bottle gourd": ["calabash", "lauki", "doodhi", "sorekayi", "lagenaria siceraria", "surakkai"],
  "lauki": ["bottle gourd", "calabash", "doodhi", "sorekayi", "lagenaria siceraria"],
  "turmeric": ["curcuma longa", "haldi rhizome", "haldi"],
  "haldi": ["curcuma longa", "turmeric"],
  "cardamom": ["elettaria cardamomum", "elaichi pods", "elaichi"],
  "elaichi": ["elettaria cardamomum", "cardamom"],
  "clove": ["syzygium aromaticum", "laung"],
  "laung": ["syzygium aromaticum", "clove"],
  "cinnamon": ["cinnamomum verum", "dalchini"],
  "dalchini": ["cinnamomum verum", "cinnamon"],
  "black pepper": ["piper nigrum", "kali mirch"],
  "kali mirch": ["piper nigrum", "black pepper"],
  "fenugreek": ["trigonella foenum-graecum", "methi leaves", "methi"],
  "methi": ["trigonella foenum-graecum", "fenugreek"],
  "coriander seed": ["coriandrum sativum", "dhania seeds"],
  "dhania": ["coriandrum sativum", "coriander"],
  "cumin": ["cuminum cyminum", "jeera"],
  "jeera": ["cuminum cyminum", "cumin"],
  "custard apple": ["annona squamosa", "sitaphal"],
  "guava": ["psidium guajava", "amrood"],
  "pomegranate": ["punica granatum", "anar"],
  "jackfruit": ["artocarpus heterophyllus", "kathal"],
  "cashew": ["anacardium occidentale", "kaju"],
  "almond": ["prunus dulcis", "badam"],
  "walnut": ["juglans regia", "akhrot"],
}

const DISQUALIFIED_IMAGE_TERMS = [
  "basket", "assortment", "stall", "market", "grocery", "shelf", "crate", "box",
  "collage", "recipe", "dish", "cooked", "curry", "fried", "salad", "mix", "mixed",
  "pest", "disease", "caterpillar", "beetle", "fungus", "symptom", "blight", "rot",
  "herbarium", "specimen", "map", "diagram", "chart", "icon", "logo", "stamp", "drawing",
  "seedling", "seedlings", "sprout", "sprouts", "sapling", "saplings", "nursery", "weed", "wildflower"
]

function getCropSearchTerms(cropName) {
  const clean = cropName
    .replace(/\(.*?\)/g, " ")
    .replace(/\b(fresh|common|local|hybrid|grade\s*[a-c]?|desi|dry)\b/gi, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

  const terms = []
  if (clean) terms.push(clean)

  for (const [key, aliases] of Object.entries(COMMODITY_SYNONYMS)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      aliases.forEach(a => {
        if (!terms.includes(a)) terms.push(a)
      })
    }
  }

  return terms
}

function scoreCandidateImage(title, description, targetTerms) {
  const combinedText = (title + " " + description).toLowerCase()

  for (const bad of DISQUALIFIED_IMAGE_TERMS) {
    if (new RegExp("\b" + bad + "\b", "i").test(combinedText)) {
      return -1
    }
  }

  let hasCompleteTargetMatch = false
  let score = 0
  const titleTokens = title.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean)
  const descTokens = description.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean)

  for (const term of targetTerms) {
    const termTokens = term.split(/\s+/)
    const titleExact = termTokens.every(tok => titleTokens.includes(tok))
    const descExact = termTokens.every(tok => descTokens.includes(tok))

    if (titleExact || descExact) {
      hasCompleteTargetMatch = true
    }

    if (titleExact) {
      score += 20 + termTokens.length * 6
    } else {
      const partialTitleMatches = termTokens.filter(tok => titleTokens.includes(tok))
      score += partialTitleMatches.length * 4
    }

    if (descExact) {
      score += 10 + termTokens.length * 3
    } else {
      const partialDescMatches = termTokens.filter(tok => descTokens.includes(tok))
      score += partialDescMatches.length * 2
    }
  }

  if (!hasCompleteTargetMatch) {
    return -1
  }

  // Strongly prefer actual edible commodity / harvested produce over flowers & foliage
  if (/\b(fruit|fruits|grain|grains|seed|seeds|pod|pods|tuber|tubers|rhizome|rhizomes|bulb|bulbs|harvest|harvested|produce|crop|nut|nuts|spice|vegetable)\b/i.test(combinedText)) {
    score += 8
  }
  if (/\b(flower|blossom|inflorescence|petal|foliage)\b/i.test(combinedText)) {
    score -= 4
  }

  return score
}

async function searchCommonsCropImage(cropName) {
  const searchTerms = getCropSearchTerms(cropName)
  if (!searchTerms.length) return null

  const candidatePages = new Map()

  for (const query of searchTerms.slice(0, 3)) {
    try {
      const commonsUrl = new URL("https://commons.wikimedia.org/w/api.php")
      commonsUrl.search = new URLSearchParams({
        action: "query",
        format: "json",
        generator: "search",
        gsrsearch: query + " filetype:bitmap",
        gsrnamespace: "6",
        gsrlimit: "6",
        prop: "imageinfo",
        iiprop: "url|size|extmetadata",
        iiurlwidth: "640",
        origin: "*",
      }).toString()

      const response = await fetch(commonsUrl, { signal: AbortSignal.timeout(5000) })
      if (!response.ok) continue

      const data = await response.json()
      const pages = Object.values(data.query?.pages || {})
      for (const page of pages) {
        if (page?.imageinfo?.[0] && !candidatePages.has(page.pageid)) {
          candidatePages.set(page.pageid, page)
        }
      }
    } catch {}
  }

  if (!candidatePages.size) return null

  let bestCandidate = null
  let bestScore = 0

  for (const page of candidatePages.values()) {
    const info = page.imageinfo?.[0]
    if (!info) continue

    const title = page.title || ""
    const rawDesc = [
      info.extmetadata?.ImageDescription?.value || "",
      info.extmetadata?.ObjectName?.value || "",
      info.extmetadata?.Headline?.value || ""
    ].join(" ")
    const description = rawDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

    const score = scoreCandidateImage(title, description, searchTerms)

    if (score >= 18 && score > bestScore) {
      bestScore = score
      bestCandidate = {
        url: info.thumburl || info.url,
        alt: title.replace(/^File:/i, "").replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        photographer: info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "").trim() || "Wikimedia Commons",
        link: info.descriptionurl || ("https://commons.wikimedia.org/wiki/" + encodeURIComponent(title)),
      }
    }
  }

  return bestCandidate
}

// Secondary biological image provider (GBIF - Global Biodiversity Information Facility)
async function searchGbifCropImage(cropName) {
  const searchTerms = getCropSearchTerms(cropName)
  if (!searchTerms.length) return null

  for (const term of searchTerms.slice(0, 3)) {
    try {
      const matchUrl = new URL("https://api.gbif.org/v1/species/match")
      matchUrl.searchParams.set("name", term)
      matchUrl.searchParams.set("strict", "false")

      const matchResp = await fetch(matchUrl, { signal: AbortSignal.timeout(4000) })
      if (!matchResp.ok) continue
      const species = await matchResp.json()
      const taxonKey = species.usageKey || species.speciesKey
      if (!taxonKey) continue

      const occUrl = new URL("https://api.gbif.org/v1/occurrence/search")
      occUrl.searchParams.set("taxonKey", String(taxonKey))
      occUrl.searchParams.set("mediaType", "StillImage")
      occUrl.searchParams.set("limit", "8")

      const occResp = await fetch(occUrl, { signal: AbortSignal.timeout(4000) })
      if (!occResp.ok) continue
      const occData = await occResp.json()
      const results = Array.isArray(occData.results) ? occData.results : []

      let bestCandidate = null
      let bestScore = 0

      for (const rec of results) {
        const media = rec.media?.find(m => m.type === "StillImage" && m.identifier)
        if (!media) continue

        // Construct title and metadata description from occurrence record and media fields
        const title = [media.title || "", rec.scientificName || "", rec.vernacularName || ""].filter(Boolean).join(" ")
        const description = [media.description || "", rec.genericName || "", rec.family || "", rec.locality || ""].filter(Boolean).join(" ")

        // Validate relevance using the scoring and anti-disqualification engine
        const score = scoreCandidateImage(title, description, searchTerms)
        if (score >= 18 && score > bestScore) {
          bestScore = score

          // Extract exact attribution and license information; never assume or invent a license
          const creator = media.creator || rec.rightsHolder || rec.recordedBy || ""
          const rawLicense = media.license || rec.license || ""
          const cleanLicense = rawLicense
            ? (rawLicense.includes("/") ? rawLicense.split("/").filter(Boolean).pop().toUpperCase() : rawLicense)
            : ""

          let attribution = creator
          if (cleanLicense) {
            attribution = attribution ? (attribution + " (" + cleanLicense + ")") : cleanLicense
          }
          if (!attribution) {
            attribution = "GBIF Occurrence Record"
          }

          bestCandidate = {
            url: media.identifier,
            alt: (rec.vernacularName || rec.scientificName || term) + " [GBIF]",
            photographer: attribution,
            link: "https://www.gbif.org/occurrence/" + rec.key,
          }
        }
      }

      if (bestCandidate) {
        return bestCandidate
      }
    } catch {}
  }

  return null
}

let unsplashRateLimitedUntil = 0

async function searchUnsplashCropImage(cropName) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim()
  if (!accessKey) return null

  if (Date.now() < unsplashRateLimitedUntil) {
    return null
  }

  const def = findProduceDefinition(cropName)
  if (!def) return null

  try {
    const unsplashUrl = new URL("https://api.unsplash.com/search/photos")
    unsplashUrl.searchParams.set("query", def.searchQuery)
    unsplashUrl.searchParams.set("per_page", "10")
    unsplashUrl.searchParams.set("orientation", "landscape")
    unsplashUrl.searchParams.set("content_filter", "high")

    const response = await fetch(unsplashUrl, {
      headers: {
        "Authorization": `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      signal: AbortSignal.timeout(6000),
    })

    const remaining = response.headers.get("x-ratelimit-remaining")
    if (remaining !== null && Number(remaining) <= 1) {
      console.warn("Unsplash rate limit remaining:", remaining)
    }

    if (response.status === 429) {
      const resetTime = Number(response.headers.get("x-ratelimit-reset")) || 0
      unsplashRateLimitedUntil = resetTime > 0 ? resetTime * 1000 : Date.now() + 60 * 60 * 1000
      console.warn("Unsplash rate limit reached. Pausing Unsplash requests until:", new Date(unsplashRateLimitedUntil).toLocaleTimeString())
      return null
    }

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const results = Array.isArray(data.results) ? data.results : []
    if (!results.length) return null

    // Strictly validate each candidate against produce taxonomy rules.
    for (const photo of results) {
      const check = validateImageCandidate(photo, def)
      if (check.valid) {
        // Trigger Unsplash download tracking per developer guidelines
        if (photo.links?.download_location && accessKey) {
          fetch(photo.links.download_location, {
            headers: {
              "Authorization": `Client-ID ${accessKey}`,
              "Accept-Version": "v1",
            },
            signal: AbortSignal.timeout(3000),
          }).catch(() => {})
        }
        return {
          url: photo.urls?.small || photo.urls?.regular,
          alt: photo.alt_description || photo.description || `${def.canonicalName} produce`,
          photographer: photo.user?.name ? `${photo.user.name} (Unsplash)` : "Unsplash",
          link: photo.links?.html ? `${photo.links.html}?utm_source=farmezy&utm_medium=referral` : "https://unsplash.com",
          downloadLocation: photo.links?.download_location,
          source: "unsplash",
        }
      }
    }

    // Do NOT guess or take uncertain candidates. Return null to trigger fallback cascade.
    return null
  } catch (err) {
    console.warn(`Unsplash search for "${cropName}" error:`, err.message)
    return null
  }
}

const BOTANICALLY_SENSITIVE_FALLBACK_CROPS = [
  "ragi", "finger millet", "eleusine", "moong", "green gram", "mung bean",
  "avare", "avare dal", "avarekalu", "hyacinth bean", "field bean",
  "bottle gourd", "lauki", "calabash", "sorekayi",
  "bitter gourd", "bitter melon", "karela", "hagalakayi", "pavakkai",
  "ash gourd", "ashgourd", "winter melon", "wax gourd", "petha", "kumbalakai",
  "snake gourd", "snakegourd", "snakeguard", "snake guard", "chichinda", "padavalakai", "padavalkayi", "pudalangai", "potlakaya",
  "ridge gourd", "ridgeguard", "tori", "turai", "sesame", "til", "sesamum",
  "ginger", "ginger green", "ginger dry", "adrak", "shunti", "inji", "allam",
  "beans", "bean", "green beans", "french beans", "frasbean",
  "thogarikai", "thogrikai", "cluster beans", "cluster bean", "guar", "gawar", "gavar", "gorikayi", "gorikai", "kothavarangai",
  "radish", "raddish", "mooli", "moolangi", "mullangi", "white radish", "daikon",
  "knol khol", "knolkhol", "knool khol", "knoolkhol", "kohlrabi", "german turnip", "ganth gobi", "navil kosu", "noolkol",
  "elephant foot yam", "elephant yam", "suran", "drumstick", "moringa", "bengal gram"
]

function isBotanicallySensitiveCrop(name) {
  const norm = " " + cleanCropName(name) + " "
  return BOTANICALLY_SENSITIVE_FALLBACK_CROPS.some(term => norm.includes(" " + term + " "))
}

async function resolveProduceImage(cropName) {
  const clean = String(cropName || "").trim()
  if (!clean) return null
  const cacheKey = clean.toLowerCase()

  // 1. Highest Priority: Curated verified produce library for sensitive crops (Radish, Knol Khol, Gourds, Pulses, Millets, Spices, etc.)
  if (isBotanicallySensitiveCrop(clean)) {
    const curated = findCuratedCropImage(clean)
    if (curated) {
      imageCache.set(cacheKey, { data: curated, savedAt: Date.now() })
      saveImageCache()
      return curated
    }
  }

  // 2. Check cached images (only if not botanical sensitive, or valid cached non-stale entry)
  const cached = imageCache.get(cacheKey)
  if (
    cached &&
    Date.now() - cached.savedAt < imageTtlMs &&
    cached.data?.url &&
    cached.data.url !== "/placeholder.png" &&
    !cached.data.url.includes("/thumb/") &&
    !["/potato.jpg", "/cabbage.jpg", "/ladies_finger.jpg", "/tomato.jpg", "/onion.jpg", "/carrot.jpg", "/ginger.jpg"].includes(cached.data.url) &&
    !(cacheKey.includes("green gram") && cached.data.url.includes("Bengal_Gram.jpg")) &&
    !(cacheKey.includes("ash gourd") && cached.data.url.includes("photo-1597362925123-77861d3fbac7")) &&
    !(cacheKey.includes("bitter gourd") && cached.data.url.includes("photo-1597362925123-77861d3fbac7")) &&
    !((cacheKey.includes("snake gourd") || cacheKey.includes("snakeguard") || cacheKey.includes("snake guard")) && cached.data.url.includes("photo-1597362925123-77861d3fbac7")) &&
    !(cacheKey.includes("bean") && (cached.data.url.includes("photo-1609820323628-621956856049") || (cached.data.alt && /white round fruit/i.test(cached.data.alt)))) &&
    !((cacheKey.includes("thogari") || cacheKey.includes("thogri") || cacheKey.includes("cluster bean") || cacheKey.includes("guar")) && cached.data.url === "/placeholder.png") &&
    !((cacheKey.includes("radish") || cacheKey.includes("raddish") || cacheKey.includes("mooli") || cacheKey.includes("mullangi") || cacheKey.includes("daikon")) && (cached.data.source === "unsplash" || cached.data.url.includes("photo-") || (cached.data.alt && /beetroot|beet/i.test(cached.data.alt)))) &&
    !((cacheKey.includes("knol") || cacheKey.includes("knool") || cacheKey.includes("kohlrabi") || cacheKey.includes("ganth gobi") || cacheKey.includes("navil kosu")) && (cached.data.url.includes("/6/60/Kohlrabi.jpg") || cached.data.url === "/placeholder.png"))
  ) {
    return cached.data
  }

  // 2. For commercial produce, search Unsplash first with strict validation
  if (process.env.UNSPLASH_ACCESS_KEY?.trim()) {
    try {
      const unsplashMatch = await searchUnsplashCropImage(clean)
      if (unsplashMatch) {
        imageCache.set(cacheKey, { data: unsplashMatch, savedAt: Date.now() })
        saveImageCache()
        return unsplashMatch
      }
    } catch {}
  }

  // 3. Curated high-resolution photo library fallback
  const curated = findCuratedCropImage(clean)
  if (curated) {
    imageCache.set(cacheKey, { data: curated, savedAt: Date.now() })
    saveImageCache()
    return curated
  }

  // 4. Primary open fallback: Wikimedia Commons search with scoring
  try {
    const commonsMatch = await searchCommonsCropImage(clean)
    if (commonsMatch) {
      imageCache.set(cacheKey, { data: commonsMatch, savedAt: Date.now() })
      saveImageCache()
      return commonsMatch
    }
  } catch {}

  // 5. Secondary open fallback: GBIF biological occurrence image resolution
  try {
    const gbifMatch = await searchGbifCropImage(clean)
    if (gbifMatch) {
      imageCache.set(cacheKey, { data: gbifMatch, savedAt: Date.now() })
      saveImageCache()
      return gbifMatch
    }
  } catch {}

  // 6. Fallback placeholder (do not cache placeholder so it can be re-resolved)
  return {
    url: "/placeholder.png",
    alt: `${clean} produce`,
    photographer: "Farmezy",
    link: "",
  }
}

/**
 * Checks if a listing's image was provided by the farmer.
 * Strictly preserves every farmer-uploaded photo (data URLs, custom file paths, custom URLs).
 */
function isFarmerUploadedPhoto(item) {
  if (!item.image || !String(item.image).trim()) return false
  if (item.imageSource === "farmer") return true
  if (item.image.startsWith("data:image/")) return true
  if (item.imageSource === "auto-unsplash" || item.imageSource === "auto-fallback") return false

  const standardAutoAssigned = [
    "/tomato.jpg", "/ginger.jpg", "/onion.jpg", "/potato.jpg",
    "/carrot.jpg", "/cabbage.jpg", "/ladies_finger.jpg", "/okra.jpg", "/placeholder.png"
  ]
  const isAutoUrl = item.image.includes("images.unsplash.com") ||
                    item.image.includes("upload.wikimedia.org") ||
                    standardAutoAssigned.includes(item.image)

  return !isAutoUrl
}

/**
 * Audits cached images. Evicts and re-resolves any mismatched auto-fetched entries.
 */
async function auditAndPurgeCache() {
  let changed = false
  const localStubs = ["/potato.jpg", "/cabbage.jpg", "/ladies_finger.jpg", "/tomato.jpg", "/onion.jpg", "/carrot.jpg", "/ginger.jpg"]

  for (const [key, entry] of Array.from(imageCache.entries())) {
    // 1. Evict any placeholder or empty entries
    if (!entry?.data?.url || entry.data.url === "/placeholder.png") {
      imageCache.delete(key)
      changed = true
      continue
    }

    // 2. Evict local fallback stubs so authentic images resolve
    if (localStubs.includes(entry.data.url)) {
      console.log(`Evicting local fallback stub for "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    // 3. Evict broken thumbnail URLs
    if (entry.data.url.includes("/thumb/")) {
      console.log(`Evicting broken Wikimedia thumbnail URL for "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    // 4. Evict generic gourd collisions
    if ((key.includes("ash gourd") || key.includes("winter melon") || key.includes("wax gourd") || key.includes("petha") || key.includes("kumbalakai")) && (
      entry.data.url.includes("photo-1597362925123-77861d3fbac7") ||
      (entry.data.alt && /Fresh gourd vegetable/i.test(entry.data.alt))
    )) {
      console.log(`Evicting generic gourd photo for Ash Gourd: "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    if ((key.includes("bitter gourd") || key.includes("bitter melon") || key.includes("karela") || key.includes("hagalakayi")) && (
      entry.data.url.includes("photo-1597362925123-77861d3fbac7") ||
      (entry.data.alt && /Fresh gourd vegetable/i.test(entry.data.alt))
    )) {
      console.log(`Evicting generic gourd photo for Bitter Gourd: "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    if ((key.includes("snake gourd") || key.includes("snakeguard") || key.includes("snake guard") || key.includes("chichinda") || key.includes("padaval")) && (
      entry.data.url.includes("photo-1597362925123-77861d3fbac7") ||
      (entry.data.alt && /Fresh gourd vegetable/i.test(entry.data.alt))
    )) {
      console.log(`Evicting generic gourd photo for Snake Gourd: "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    if ((key === "beans" || key.includes("bean")) && (
      entry.data.url.includes("photo-1609820323628-621956856049") ||
      (entry.data.alt && /white round fruit|coffee|baked|fruit/i.test(entry.data.alt))
    )) {
      console.log(`Evicting incorrect fruit photo for Beans: "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    if ((key.includes("thogari") || key.includes("thogri") || key.includes("cluster bean") || key.includes("guar")) && (
      !entry.data.url || entry.data.url === "/placeholder.png"
    )) {
      console.log(`Evicting placeholder photo for Thogarikai: "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    if (key.includes("radish") || key.includes("raddish") || key.includes("mooli") || key.includes("mullangi") || key.includes("moolangi") || key.includes("daikon")) {
      if (entry.data?.source === "unsplash" || entry.data?.url?.includes("photo-") || !entry.data?.url?.includes("Daikon%2C_Nara_Prefecture%2C_Japan.jpg")) {
        console.log(`Evicting non-curated photo for Radish: "${key}"`)
        imageCache.delete(key)
        changed = true
        continue
      }
    }

    if ((key.includes("knol") || key.includes("knool") || key.includes("kohlrabi") || key.includes("ganth gobi") || key.includes("navil kosu")) && (
      entry.data.url.includes("/6/60/Kohlrabi.jpg") ||
      entry.data.url === "/placeholder.png" ||
      !entry.data.url
    )) {
      console.log(`Evicting broken/missing photo for Knol Khol: "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    // 5. Evict known bad legacy URLs and mismatches
    if (key.includes("ragi") && (
      entry.data.url.includes("photo-1586201375761-83865001e31c") ||
      entry.data.url.includes("photo-1789865504636-95a551d48809") ||
      (entry.data.alt && /foxtail|rice|wheat/i.test(entry.data.alt))
    )) {
      console.log(`Evicting incorrect foxtail/rice photo for "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }
    if ((key.includes("green gram") || key.includes("moong")) && (
      entry.data.url.includes("Bengal_Gram.jpg") ||
      entry.data.url.includes("photo-1592394533824-9440e5d68530") ||
      entry.data.url.includes("photo-1758701925687-1449ab265c2e") ||
      (entry.data.alt && /sprout|fruit|plum|bengal/i.test(entry.data.alt))
    )) {
      console.log(`Evicting Bengal Gram/sprouted/fruit photo for "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }
    if ((key.includes("avare") || key.includes("hyacinth") || key.includes("field bean")) && (
      entry.data.alt && /potato/i.test(entry.data.alt)
    )) {
      console.log(`Evicting mismatched photo for "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }
    if ((key.includes("brinjal") || key.includes("eggplant") || key.includes("baingan")) && (
      entry.data.url.includes("photo-1528823872057-9c018a7a7553") ||
      entry.data.url.includes("photo-1615484477201") ||
      (entry.data.alt && /chili|pepper/i.test(entry.data.alt))
    )) {
      console.log(`Evicting incorrect chili photo for "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }
    if ((key.includes("bottle gourd") || key.includes("lauki") || key.includes("calabash") || key.includes("sorekayi")) && (
      entry.data.url.includes("photo-1597362925123-77861d3fbac7") ||
      entry.data.url.includes("photo-1791139899669") ||
      (entry.data.alt && /cucumber|squash|different types/i.test(entry.data.alt))
    )) {
      console.log(`Evicting incorrect gourd photo for "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }
    if ((key.includes("sesame") || key.includes("til") || key.includes("gingelly") || key.includes("sesamum")) && (
      entry.data.url.includes("photo-1597362925123-77861d3fbac7") ||
      (entry.data.alt && /flower|vegetables|pile of different/i.test(entry.data.alt))
    )) {
      console.log(`Evicting incorrect flower/vegetable photo for "${key}"`)
      imageCache.delete(key)
      changed = true
      continue
    }

    // 6. Validate Unsplash entries against produce taxonomy
    if (entry?.data?.source === "unsplash") {
      const def = findProduceDefinition(key)
      if (def) {
        const dummyPhoto = {
          alt_description: entry.data.alt || "",
          description: entry.data.alt || "",
          tags: [],
          urls: { small: entry.data.url }
        }
        const check = validateImageCandidate(dummyPhoto, def)
        if (!check.valid) {
          console.log(`Evicting mismatched cached image for "${key}": ${check.reason}`)
          imageCache.delete(key)
          changed = true
        }
      }
    }
  }
  if (changed) {
    saveImageCache()
    console.log("Image cache audit complete: invalid entries cleared.")
  }
}

/**
 * Audits listings: preserves all farmer photos; updates only empty or auto-assigned mismatched images.
 */
async function backfillAndAuditListings() {
  await auditAndPurgeCache()

  let modified = false
  for (const item of listings) {
    // Strictly preserve every farmer-uploaded photo
    if (isFarmerUploadedPhoto(item)) {
      continue
    }

    const def = findProduceDefinition(item.crop)
    let needsUpdate = false

    if (!item.image || !String(item.image).trim() || item.image.startsWith("/")) {
      needsUpdate = true
    } else if (item.image.includes("images.unsplash.com") && def) {
      const dummyPhoto = {
        alt_description: item.crop,
        description: "",
        tags: [],
        urls: { small: item.image }
      }
      // If cached image was purged or is invalid, update it
      const cached = imageCache.get(item.crop.toLowerCase())
      if (!cached || cached.data?.url !== item.image) {
        needsUpdate = true
      }
    }

    if (needsUpdate) {
      try {
        const resolved = await resolveProduceImage(item.crop)
        if (resolved?.url && resolved.url !== "/placeholder.png") {
          item.image = resolved.url
          item.imageSource = resolved.source === "unsplash" ? "auto-unsplash" : "auto-fallback"
          modified = true
        }
      } catch (err) {
        console.warn(`Audit image lookup failed for ${item.crop}:`, err.message)
      }
    }
  }

  if (modified) {
    saveListings(listings)
    console.log("Successfully verified and updated auto-assigned produce images.")
  }
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

  if (requestUrl.pathname === "/api/listings" && req.method === "GET") {
    listings = loadListings()
    const safeListings = listings.map(listing => {
      const l = { ...listing }
      if (!l.farmerPhone) {
        const existingContactPhone = l.contact?.phone || l.contact?.whatsapp || ""
        const contactDigits = String(existingContactPhone).replace(/\D/g, "")
        if (contactDigits.length === 10) l.farmerPhone = contactDigits
        else {
          const digits = String(l.farmerId || "").replace(/\D/g, "")
          if (digits.length === 10) l.farmerPhone = digits
        }
      }
      if (l.image && l.imageSource !== "farmer") {
        const cached = imageCache.get(String(l.crop || "").toLowerCase().trim())
        if (cached?.data?.url && cached.data.url !== "/placeholder.png" && !cached.data.url.startsWith("/")) {
          l.image = cached.data.url
        }
        if (cached?.data?.photographer) {
          l.imagePhotographer = cached.data.photographer
          l.imageLink = cached.data.link
        }
      }
      return l
    })
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
      let body = ""
      for await (const chunk of req) body += chunk
      const data = JSON.parse(body || "{}")
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
      let body = ""
      for await (const chunk of req) body += chunk
      const data = JSON.parse(body || "{}")
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
      let body = ""
      for await (const chunk of req) body += chunk
      const data = JSON.parse(body || "{}")

      const required = ["crop", "quantity", "unit", "price", "address", "farmerId", "farmerName"]
      const missing = required.filter(field => !String(data[field] ?? "").trim())
      if (missing.length) {
        res.writeHead(400).end(JSON.stringify({ error: "Missing required fields: " + missing.join(", ") }))
        return
      }

      // Preserve farmer-uploaded photo (data URLs, custom file paths, custom URLs)
      let finalImage = String(data.image || data.imageUrl || "").trim()
      let finalSource = "farmer"

      if (!finalImage) {
        try {
          const resolved = await resolveProduceImage(String(data.crop || "").trim())
          if (resolved?.url) {
            finalImage = resolved.url
            finalSource = resolved.source === "unsplash" ? "auto-unsplash" : "auto-fallback"
          }
        } catch (err) {
          console.warn("Auto image lookup error on create listing:", err.message)
        }
      }

      const item = {
        id: Date.now().toString(),
        crop: String(data.crop).trim(),
        variety: String(data.variety || "").trim(),
        quantity: String(data.quantity).trim(),
        unit: String(data.unit).trim(),
        price: String(data.price).trim(),
        date: String(data.date || "").trim(),
        address: String(data.address).trim(),
        notes: String(data.notes || "").trim(),
        farmerId: String(data.farmerId).trim(),
        farmerName: String(data.farmerName).trim(),
        farmerPhone: String(data.farmerPhone || "").trim(),
        farmerLocation: String(data.farmerLocation || "").trim(),
        farmerDistrict: String(data.farmerDistrict || "").trim(),
        farmerState: String(data.farmerState || "").trim(),
        farmerLat: String(data.farmerLat || "").trim(),
        farmerLng: String(data.farmerLng || "").trim(),
        image: finalImage,
        imageSource: finalSource,
        createdAt: new Date().toISOString(),
      }

      if (item.image && item.imageSource !== "farmer") {
        const cached = imageCache.get(String(item.crop || "").toLowerCase().trim())
        if (cached?.data?.photographer) {
          item.imagePhotographer = cached.data.photographer
          item.imageLink = cached.data.link
        }
      }

      listings = [item, ...listings]
      saveListings(listings)
      res.writeHead(201).end(JSON.stringify({ listing: item }))
    } catch {
      res.writeHead(400).end(JSON.stringify({ error: "Invalid listing data." }))
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

  // Enhanced Crop Images API with Unsplash, Curated Library, Wikimedia Commons and GBIF Resolution
  if (requestUrl.pathname === "/api/crop-images") {
    const crops = [...new Set((requestUrl.searchParams.get("crops") || "").split(",").map(value => value.trim()).filter(Boolean))].slice(0, 50)
    if (!crops.length) {
      res.writeHead(400).end(JSON.stringify({ error: "Add at least one crop name." }))
      return
    }

    try {
      const images = {}
      await Promise.all(crops.map(async crop => {
        images[crop] = await resolveProduceImage(crop)
      }))

      res.writeHead(200).end(JSON.stringify({ images }))
    } catch {
      res.writeHead(500).end(JSON.stringify({ error: "Failed to fetch crop images." }))
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

  // Official Mandi Prices API: Directly powered by AGMARKNET Government of India feed
  if (requestUrl.pathname === "/api/mandi-prices") {
    const dataGovKey = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY || "579b464db66ec23bdd00000119f3f71a11ba4a67695e5b8a24f75b0a"

    const rawCommodity = requestUrl.searchParams.get("commodity")?.trim() || ""
    const rawState = requestUrl.searchParams.get("state")?.trim() || "Karnataka"
    const rawDistrict = requestUrl.searchParams.get("district")?.trim() || ""
    const rawMarket = requestUrl.searchParams.get("market")?.trim() || ""

    const limit = Math.min(300, Math.max(1, Number(requestUrl.searchParams.get("limit") || 100)))
    const offset = Math.max(0, Number(requestUrl.searchParams.get("offset") || 0))

    // Helper: Normalize names for matching
    function normalize(text) {
      return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
    }

    // Helper: District matching (handles variants like "Bengaluru Rural", "Bengaluru South", "Bangalore")
    function matchesDistrict(recordDistrict, targetDistrict) {
      if (!targetDistrict) return true
      const r = normalize(recordDistrict).replace("rural", "").replace("urban", "").replace("south", "").replace("north", "")
      const t = normalize(targetDistrict).replace("rural", "").replace("urban", "").replace("south", "").replace("north", "")
      if (r.includes("bangalore") || r.includes("bengaluru")) {
        return t.includes("bangalore") || t.includes("bengaluru")
      }
      return r.includes(t) || t.includes(r)
    }

    // Helper: Commodity matching (e.g. "ginger" matches "Ginger(Green)" and "Ginger(Dry)")
    function matchesCommodity(recordCommodity, targetCommodity) {
      if (!targetCommodity) return true
      const r = normalize(recordCommodity)
      const t = normalize(targetCommodity)
      if (r.includes(t) || t.includes(r)) return true
      // Common aliases
      if (t === "ginger" && r.includes("ginger")) return true
      if ((t === "chilli" || t === "chili" || t === "mirchi") && (r.includes("chilli") || r.includes("chili"))) return true
      if ((t === "bhindi" || t === "okra" || t === "ladyfinger" || t === "ladiesfinger") && (r.includes("bhindi") || r.includes("okra") || r.includes("lady"))) return true
      if ((t === "cucumber" || t === "kheera") && (r.includes("cucumbar") || r.includes("cucumber") || r.includes("kheera"))) return true
      if ((t === "radish" || t === "mooli") && (r.includes("radish") || r.includes("raddish"))) return true
      if ((t === "peas" || t === "matar") && (r.includes("pea") || r.includes("peas"))) return true
      if ((t.includes("ridge") || t.includes("tori")) && (r.includes("ridge") || r.includes("tori"))) return true
      if ((t.includes("knool") || t.includes("kohl")) && (r.includes("knool") || r.includes("kohl"))) return true
      if ((t.includes("gur") || t.includes("jaggery")) && (r.includes("gur") || r.includes("jaggery"))) return true
      if ((t.includes("yam") || t.includes("suran")) && (r.includes("yam") || r.includes("suran") || r.includes("amphophalus"))) return true
      return false
    }

    let allStateRows = []
    let sourceLabel = "AGMARKNET · Government of India"
    let isLive = true

    // Fetch from data.gov.in with in-memory caching
    try {
      const cacheKey = "gov_state_" + normalize(rawState)
      const cached = dataGovCache.get(cacheKey)
      if (cached && Date.now() - cached.savedAt < dataGovCacheTtlMs) {
        allStateRows = cached.rows
      } else {
        const govUrl = new URL("https://api.data.gov.in/resource/" + resourceId)
        govUrl.searchParams.set("api-key", dataGovKey)
        govUrl.searchParams.set("format", "json")
        govUrl.searchParams.set("limit", "500")
        govUrl.searchParams.set("filters[state]", rawState)

        const response = await fetch(govUrl, {
          headers: { Accept: "application/json", "User-Agent": "Farmezy/2.0" },
          signal: AbortSignal.timeout(12000)
        })

        if (response.ok) {
          const payload = await response.json()
          if (Array.isArray(payload.records) && payload.records.length > 0) {
            allStateRows = payload.records
            dataGovCache.set(cacheKey, { rows: allStateRows, savedAt: Date.now() })
          }
        }
      }
    } catch (e) {
      console.warn("Live Government API failed, falling back to offline baselines:", e.message)
    }

    // Offline / Local Dataset Fallback if live feed is down
    if (!allStateRows.length) {
      try {
        const baselineFile = path.join(dataDir, "user-baselines.json")
        if (existsSync(baselineFile)) {
          const baselineData = JSON.parse(readFileSync(baselineFile, "utf8"))
          const baselines = baselineData?.baselines || {}
          const baselineDate = baselineData.date || "2025-05-19"
          allStateRows = Object.entries(baselines).map(([name, price]) => ({
            arrival_date: baselineDate,
            commodity: name.charAt(0).toUpperCase() + name.slice(1),
            state: rawState,
            district: rawDistrict || "All districts",
            market: "Official Mandi Baseline",
            min_price: Math.round(price * 0.9),
            modal_price: price,
            max_price: Math.round(price * 1.1),
            variety: "Standard",
            grade: "FAQ"
          }))
          sourceLabel = "Farmezy Government Mandi Baseline Dataset"
          isLive = false
        }
      } catch (err) {
        console.warn("Baseline fallback failed:", err.message)
      }
    }

    // Filter rows based on commodity, district, and market
    let filtered = allStateRows
    let districtFallback = false

    // Apply district filter
    if (rawDistrict) {
      const districtMatched = filtered.filter(row => matchesDistrict(row.district, rawDistrict))
      if (districtMatched.length > 0) {
        filtered = districtMatched
      } else {
        // District has no reported records today: provide state-level fallback
        districtFallback = true
      }
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

    // Format records cleanly
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

server.listen(port, () => {
  console.log("Farmezy official mandi API listening on http://localhost:" + port)
  backfillAndAuditListings().catch(err => console.error("Produce image audit error:", err))
})
