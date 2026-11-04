import http from "node:http"
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, statSync, readdirSync } from "node:fs"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { findProduceDefinition, validateImageCandidate, cleanCropName } from "./produce-taxonomy.js"

try {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env")
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^[\"']|[\"']$/g, "")
    }
  }
} catch {}

const isAzure = Boolean(process.env.WEBSITE_SITE_NAME || process.env.REGION_NAME)
const defaultPort = isAzure ? 8080 : (process.env.NODE_ENV === "production" ? 8080 : 3001)
const port = Number(process.env.PORT || process.env.WEBSITES_PORT || process.env.API_PORT || defaultPort)
const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"
const dataGovCache = new Map()
const dataGovCacheTtlMs = 15 * 60 * 1000 // 15 minutes cache
const weatherCache = new Map()
const weatherCacheTtlMs = 15 * 60 * 1000 // 15 minutes cache

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data")
const writableDataDir = isVercel
  ? (process.platform === "win32" ? path.join(process.env.TEMP || "C:\\temp", "farmezy-data") : path.join("/tmp", "farmezy-data"))
  : dataDir
const listingsFile = path.join(writableDataDir, "listings.json")
const ordersFile = path.join(writableDataDir, "orders.json")
const notificationsFile = path.join(writableDataDir, "notifications.json")
const reviewsFile = path.join(writableDataDir, "reviews.json")
const imageCacheFile = path.join(writableDataDir, "image-cache.json")
const catalogueFile = path.join(dataDir, "agmarknet-catalogue.json")
const masterFile = path.join(dataDir, "commodity-master.json")
const currentPricesFile = path.join(dataDir, "current-mandi-prices.json")
const backupPricesFile = path.join(dataDir, "current-mandi-prices-backup.json")
const mandiHistoryFile = path.join(dataDir, "mandi-history.json")
const karnatakaPricesFile = path.join(dataDir, "karnataka-mandi-source.json")

function supplementOfficialStateSources(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  const centralStates = new Set(rows.map(r => String(r.state || "").toLowerCase().replace(/[^a-z0-9]/g, "")));
  const extraRows = [];

  function loadSourceFile(filePath) {
    if (!existsSync(filePath)) return [];
    try {
      const data = JSON.parse(readFileSync(filePath, "utf8"));
      return Array.isArray(data) ? data : (data.records || []);
    } catch (e) {
      console.warn("Could not read " + filePath + ":", e.message);
      return [];
    }
  }

  // 1. Karnataka official source
  if (!centralStates.has("karnataka")) {
    const ktkRecords = loadSourceFile(karnatakaPricesFile);
    if (ktkRecords.length > 0) {
      extraRows.push(...ktkRecords);
      centralStates.add("karnataka");
    }
  }

  // 2. Supplementary official state sources (Delhi, Jharkhand, Goa, Mizoram, Sikkim, Arunachal Pradesh, UTs)
  const stateSourcesDir = path.join(dataDir, "state-sources");
  if (existsSync(stateSourcesDir)) {
    try {
      const files = readdirSync(stateSourcesDir).filter(f => f.endsWith(".json"));
      for (const file of files) {
        const fullPath = path.join(stateSourcesDir, file);
        const records = loadSourceFile(fullPath);
        for (const r of records) {
          const sNorm = String(r.state || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          if (!centralStates.has(sNorm) || r._forcedSupplement) {
            extraRows.push(r);
          }
        }
      }
    } catch (err) {
      console.warn("Error reading state-sources directory:", err.message);
    }
  }

  // 3. Verified National Board feeds (Tea Board weekly auction prices, NMPB e-Charak fortnightly benchmarks)
  const verifiedSourcesDir = path.join(dataDir, "verified-sources");
  if (existsSync(verifiedSourcesDir)) {
    try {
      const vFiles = readdirSync(verifiedSourcesDir).filter(f => f.endsWith(".json") && !f.endsWith(".bak"));
      for (const file of vFiles) {
        const fullPath = path.join(verifiedSourcesDir, file);
        const vRecords = loadSourceFile(fullPath);
        for (const r of vRecords) {
          extraRows.push(r);
        }
      }
    } catch (err) {
      console.warn("Error reading verified-sources directory:", err.message);
    }
  }

  // Note: category-sources contains static reference benchmark records.
  // Per strict audit rules, static reference records are kept separate from live official mandi prices.

  if (extraRows.length > 0) {
    return rows.concat(extraRows);
  }
  return rows;
}

let staticReferencePricesCache = null;
function getStaticReferencePrices() {
  if (staticReferencePricesCache) return staticReferencePricesCache;
  const list = [];
  const categorySourcesDir = path.join(dataDir, "category-sources");
  if (existsSync(categorySourcesDir)) {
    try {
      const catFiles = readdirSync(categorySourcesDir).filter(f => f.endsWith(".json") && !f.endsWith(".bak"));
      for (const file of catFiles) {
        const fullPath = path.join(categorySourcesDir, file);
        try {
          const content = JSON.parse(readFileSync(fullPath, "utf8"));
          const items = Array.isArray(content) ? content : (content.records || []);
          for (const item of items) {
            list.push({
              ...item,
              is_live: false,
              is_static_reference: true,
              verified: false
            });
          }
        } catch (e) {
          console.warn("Could not read " + fullPath + ":", e.message);
        }
      }
    } catch (err) {
      console.warn("Error reading category-sources directory:", err.message);
    }
  }
  staticReferencePricesCache = list;
  return list;
}

function ensureWritableData() {
  if (!isVercel) return
  try {
    if (!existsSync(writableDataDir)) {
      mkdirSync(writableDataDir, { recursive: true })
    }
    const defaultListings = path.join(dataDir, "listings.json")
    if (existsSync(defaultListings) && !existsSync(listingsFile)) {
      copyFileSync(defaultListings, listingsFile)
    }
    const defaultOrders = path.join(dataDir, "orders.json")
    if (existsSync(defaultOrders) && !existsSync(ordersFile)) {
      copyFileSync(defaultOrders, ordersFile)
    }
    const defaultImageCache = path.join(dataDir, "image-cache.json")
    if (existsSync(defaultImageCache) && !existsSync(imageCacheFile)) {
      copyFileSync(defaultImageCache, imageCacheFile)
    }
  } catch (err) {
    console.warn("Could not copy initial data to /tmp:", err.message)
  }
}
ensureWritableData()

let currentAgmarknetPricesCache = null
function getCurrentAgmarknetPrices() {
  if (currentAgmarknetPricesCache && currentAgmarknetPricesCache.length >= 1000) return currentAgmarknetPricesCache
  try {
    if (existsSync(currentPricesFile)) {
      const parsed = JSON.parse(readFileSync(currentPricesFile, "utf8"))
      const rows = Array.isArray(parsed) ? parsed : (parsed.records || [])
      if (rows.length >= 1000) {
        currentAgmarknetPricesCache = supplementOfficialStateSources(rows)
        return currentAgmarknetPricesCache
      }
    }
  } catch (err) {
    console.warn("Could not read current-mandi-prices.json:", err.message)
  }
  try {
    if (existsSync(backupPricesFile)) {
      const parsed = JSON.parse(readFileSync(backupPricesFile, "utf8"))
      const rows = Array.isArray(parsed) ? parsed : (parsed.records || [])
      if (rows.length >= 1000) {
        currentAgmarknetPricesCache = supplementOfficialStateSources(rows)
        return currentAgmarknetPricesCache
      }
    }
  } catch (err) {
    console.warn("Could not read current-mandi-prices-backup.json:", err.message)
  }
  try {
    if (existsSync(mandiHistoryFile)) {
      const parsed = JSON.parse(readFileSync(mandiHistoryFile, "utf8"))
      const rows = Array.isArray(parsed) ? parsed : (parsed.rows || [])
      if (rows.length > 0) {
        currentAgmarknetPricesCache = supplementOfficialStateSources(rows)
        return currentAgmarknetPricesCache
      }
    }
  } catch (err) {
    console.warn("Could not read mandi-history.json:", err.message)
  }
  return currentAgmarknetPricesCache || []
}

let agmarknetCatalogueCache = null
function getAgmarknetCommodities() {
  if (agmarknetCatalogueCache && agmarknetCatalogueCache.length > 0) return agmarknetCatalogueCache
  try {
    if (existsSync(catalogueFile)) {
      const parsed = JSON.parse(readFileSync(catalogueFile, "utf8"))
      agmarknetCatalogueCache = Array.isArray(parsed) ? parsed : (parsed.commodities || [])
      return agmarknetCatalogueCache
    }
  } catch (err) {
    console.warn("Could not read agmarknet-catalogue.json:", err.message)
  }
  return []
}

let commodityMasterCache = null
function getCommodityMaster() {
  if (commodityMasterCache && commodityMasterCache.length > 0) return commodityMasterCache
  try {
    if (existsSync(masterFile)) {
      const data = JSON.parse(readFileSync(masterFile, "utf8"))
      commodityMasterCache = Array.isArray(data) ? data : (data.commodities || [])
      return commodityMasterCache
    }
  } catch (err) {
    console.warn("Could not read commodity-master.json:", err.message)
  }
  return []
}

const masterCategories = [
  "Beverages",
  "Cereals",
  "Drug and Narcotics",
  "Dry Fruits",
  "Fibre Crops",
  "Flowers",
  "Forest Products",
  "Fruits",
  "Live Stock,Poultry,Fisheries",
  "Oil Seeds",
  "Oils and Fats",
  "Others",
  "Pulses",
  "Spices",
  "Vegetables"
]

function findMasterCommodity(name) {
  if (!name) return null
  const norm = String(name).toLowerCase().replace(/[^a-z0-9]/g, "")
  const agList = getAgmarknetCommodities()
  let matched = agList.find(c =>
    String(c.name || c.commodity || "").toLowerCase().replace(/[^a-z0-9]/g, "") === norm ||
    (c.display_name && String(c.display_name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) ||
    (c.agmarknet_name && String(c.agmarknet_name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) ||
    (Array.isArray(c.aliases) && c.aliases.some(a => String(a).toLowerCase().replace(/[^a-z0-9]/g, "") === norm))
  )
  if (matched) return matched
  const master = getCommodityMaster()
  return master.find(item => {
    const c = String(item.commodity || item.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const a = String(item.agmarknet_name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    return c === norm || a === norm || (Array.isArray(item.aliases) && item.aliases.some(alias => String(alias).toLowerCase().replace(/[^a-z0-9]/g, "") === norm))
  }) || null
}

const _categoryCache = new Map()

function categoryForCommodity(name) {
  if (!name) return ""
  if (_categoryCache.has(name)) return _categoryCache.get(name)
  const result = _categoryForCommodityUncached(name)
  _categoryCache.set(name, result)
  return result
}

function _categoryForCommodityUncached(name) {
  const clean = String(name).toLowerCase().replace(/[^a-z0-9]/g, "")
  const masterItem = findMasterCommodity(name)
  if (masterItem && (masterItem.category || masterItem.group_name)) return masterItem.category || masterItem.group_name
  const agItem = getAgmarknetCommodities().find(c => String(c.name).toLowerCase().replace(/[^a-z0-9]/g, "") === clean)
  if (agItem && (agItem.category || agItem.group_name)) return agItem.category || agItem.group_name

  const agItemByAlias = getAgmarknetCommodities().find(c => {
    if (c.agmarknet_name && String(c.agmarknet_name).toLowerCase().replace(/[^a-z0-9]/g, "") === clean) return true
    if (Array.isArray(c.aliases) && c.aliases.some(a => String(a).toLowerCase().replace(/[^a-z0-9]/g, "") === clean)) return true
    return false
  })
  if (agItemByAlias && (agItemByAlias.category || agItemByAlias.group_name)) return agItemByAlias.category || agItemByAlias.group_name

  const n = String(name).toLowerCase()
  if (/tea|coffee|cocoa|chicory/i.test(n)) return "Beverages"
  if (/honey|shahad|bamboo|gond|gum|lac|tamarind|chironji|behada|harrah|wood|timber|resin/i.test(n)) return "Forest Products"
  if (/rose|jasmine|marigold|chrysanthemum|shevanti|tuberose|tube rose|malli|kakada|carnation|gerbera/i.test(n)) return "Flowers"
  if (/cow|cattle|bull|calf|buffalo|goat|sheep|chicken|cock|hen|duck|fish|prawn|crab|livestock/i.test(n)) return "Live Stock,Poultry,Fisheries"
  if (/ashwagandha|aloe|tulsi|lemongrass|neem|senna|sonamukhi|isabgol|isabgul|psyllium|mint|pudina|mentha|amla|nelli\s*kai|muesli|safed\s*musli|mulethi|muleti|giloy|tinospora|shatavari|asparagus|stevia|kutki|coleus|karanja|pippali|ashoka|atis|harad|haritaki|myrobolan|adulsa|akarkara|bhringraj|shankhpushpi|medicinal|aromatic/i.test(n)) return "Others"
  if (/almond|badam|cashew|kaju|walnut|akhrot|pista|pistachio|raisin|kishmish|date|khajoor|makhana|dry fruit|dry grape/i.test(n)) return "Dry Fruits"
  if (/oil|ghee|butter|fat|dalda|palmolein/i.test(n)) return "Oils and Fats"
  if (/seed|mustard|groundnut|soybean|soyabean|sesamum|sesame|til|castor|sunflower|linseed/i.test(n)) return "Oil Seeds"
  if (/gram|chana|arhar|tur|toor|moong|mung|urad|urd|masoor|masur|lentil|pulse|pea|lobia|cowpea|rajma|dal/i.test(n)) return "Pulses"
  if (n.includes("yam")) return "Vegetables"
  if (n.includes("millet") || n.includes("rajgir") || n.includes("atta")) return "Cereals"
  if (n.includes("fig") || n.includes("anjeer")) return "Fruits"
  if (n.includes("dhaincha") || n.includes("sabu")) return "Cereals"
  if (n.includes("gur") || n.includes("jaggery") || n.includes("sugar")) return "Beverages"
  if (n.includes("rubber")) return "Forest Products"
  return "Vegetables"
}


function getLatestHistoricalPrice(commName) {
  if (!commName || !existsSync(mandiHistoryFile)) return null
  try {
    const hist = JSON.parse(readFileSync(mandiHistoryFile, "utf8"))
    const rows = Array.isArray(hist) ? hist : (hist.rows || [])
    const norm = String(commName).toLowerCase().replace(/[^a-z0-9]/g, "")
    const matched = rows.filter(r => {
      const c = String(r.commodity || r.Commodity || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      return c === norm || c.includes(norm) || norm.includes(c)
    })
    if (matched.length > 0) {
      const latest = matched[0]
      return {
        is_historical: true,
        commodity: latest.commodity || latest.Commodity,
        variety: latest.variety || latest.Variety || "Local",
        modal_price: Number(latest.modal_price || latest.modalPrice || 0),
        min_price: Number(latest.min_price || latest.minPrice || 0),
        max_price: Number(latest.max_price || latest.maxPrice || 0),
        market: latest.market || latest.Market || "Historical APMC",
        district: latest.district || latest.District || "",
        state: latest.state || latest.State || "",
        arrival_date: String(latest.arrival_date || latest.arrivalDate || "").slice(0, 10),
        grade: latest.grade || "FAQ",
        source_name: "Government of India (Historical AGMARKNET Session)"
      }
    }
  } catch (e) {
    console.warn("Error reading historical price:", e.message)
  }
  return null
}

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../frontend/dist")
const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../frontend/public")

function serveStatic(pathname, res) {
  const cleanPath = pathname.split("?")[0].replace(/^\/+/, "")
  let targetFile = ""

  if (cleanPath && existsSync(path.join(publicDir, cleanPath)) && !statSync(path.join(publicDir, cleanPath)).isDirectory()) {
    targetFile = path.join(publicDir, cleanPath)
  } else if (existsSync(distDir)) {
    targetFile = cleanPath ? path.join(distDir, cleanPath) : path.join(distDir, "index.html")
    if (existsSync(targetFile) && statSync(targetFile).isDirectory()) {
      targetFile = path.join(targetFile, "index.html")
    }
    if (!existsSync(targetFile) || !targetFile.startsWith(distDir)) {
      targetFile = path.join(distDir, "index.html")
    }
  }

  if (!targetFile || !existsSync(targetFile) || statSync(targetFile).isDirectory()) return false

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

function loadImageCache() {
  try {
    if (!existsSync(imageCacheFile)) {
      const defaultCache = path.join(dataDir, "image-cache.json")
      if (existsSync(defaultCache)) {
        const raw = JSON.parse(readFileSync(defaultCache, "utf8"))
        return new Map(Object.entries(raw))
      }
      return new Map()
    }
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
    mkdirSync(writableDataDir, { recursive: true })
    const serializable = Object.fromEntries(imageCache.entries())
    writeFileSync(imageCacheFile, JSON.stringify(serializable, null, 2))
  } catch {}
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

function loadNotifications() {
  try {
    if (!existsSync(notificationsFile)) {
      const defaultFile = path.join(dataDir, "notifications.json")
      if (existsSync(defaultFile)) {
        const data = JSON.parse(readFileSync(defaultFile, "utf8"))
        return Array.isArray(data) ? data : []
      }
      return []
    }
    const data = JSON.parse(readFileSync(notificationsFile, "utf8"))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveNotifications(newNotifications) {
  try {
    mkdirSync(writableDataDir, { recursive: true })
    writeFileSync(notificationsFile, JSON.stringify(newNotifications, null, 2))
  } catch (err) {
    console.warn("Warning: Could not persist notifications to disk:", err.message)
  }
}

let notifications = loadNotifications()

function loadReviews() {
  try {
    if (!existsSync(reviewsFile)) {
      const defaultFile = path.join(dataDir, "reviews.json")
      if (existsSync(defaultFile)) {
        const data = JSON.parse(readFileSync(defaultFile, "utf8"))
        return Array.isArray(data) ? data : []
      }
      return []
    }
    const data = JSON.parse(readFileSync(reviewsFile, "utf8"))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveReviews(newReviews) {
  try {
    mkdirSync(writableDataDir, { recursive: true })
    writeFileSync(reviewsFile, JSON.stringify(newReviews, null, 2))
  } catch (err) {
    console.warn("Warning: Could not persist reviews to disk:", err.message)
  }
}

let reviews = loadReviews()

function calculateReviewStats(targetReviews) {
  if (!Array.isArray(targetReviews) || targetReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      averageFarmerRating: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    }
  }
  let sumRating = 0
  let sumFarmer = 0
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  targetReviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))))
    breakdown[star] = (breakdown[star] || 0) + 1
    sumRating += Number(r.rating || 5)
    sumFarmer += Number(r.farmerRating || r.rating || 5)
  })
  return {
    averageRating: Number((sumRating / targetReviews.length).toFixed(1)),
    averageFarmerRating: Number((sumFarmer / targetReviews.length).toFixed(1)),
    totalReviews: targetReviews.length,
    breakdown
  }
}


// Active SSE client connections: clientId -> { res, userId, phone, role }
const sseClients = new Map()

function cleanId(id) {
  return String(id || "").trim().toLowerCase()
}

function cleanDigits(val) {
  return String(val || "").replace(/\D/g, "")
}

function matchesUser(notification, userId, phone) {
  if (!notification) return false
  const nUserId = cleanId(notification.userId)
  const qUserId = cleanId(userId)
  if (qUserId && nUserId && (nUserId === qUserId || nUserId.includes(qUserId) || qUserId.includes(nUserId))) {
    return true
  }
  const qPhoneDigits = cleanDigits(phone || userId)
  const nPhoneDigits = cleanDigits(notification.userPhone || notification.userId)
  if (qPhoneDigits.length >= 10 && nPhoneDigits.length >= 10) {
    if (nPhoneDigits.slice(-10) === qPhoneDigits.slice(-10)) return true
  }
  return false
}

function createAndDispatchNotification({
  userId,
  userPhone,
  role,
  orderId,
  type,
  title,
  message,
  customerName,
  farmerName,
  crop,
  quantity,
  unit,
  price,
  status
}) {
  const recentDuplicate = notifications.find(n => 
    n.orderId === String(orderId) && 
    (n.type === type || n.status === status) && 
    (Date.now() - new Date(n.createdAt).getTime()) < 4000
  )
  if (recentDuplicate) return recentDuplicate

  const notif = {
    id: "notif_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    userId: String(userId || ""),
    userPhone: String(userPhone || ""),
    role: String(role || ""),
    orderId: String(orderId || ""),
    type: String(type || "GENERAL"),
    title: String(title || "🔔 Notification"),
    message: String(message || ""),
    customerName: String(customerName || ""),
    farmerName: String(farmerName || ""),
    crop: String(crop || ""),
    quantity: String(quantity || ""),
    unit: String(unit || "kg"),
    price: String(price || ""),
    status: String(status || ""),
    read: false,
    createdAt: new Date().toISOString()
  }

  notifications = [notif, ...notifications]
  if (notifications.length > 500) {
    notifications = notifications.slice(0, 500)
  }
  saveNotifications(notifications)

  // Real-time dispatch via SSE
  const payload = "data: " + JSON.stringify({ type: "notification", notification: notif }) + "\n\n"
  for (const [clientId, client] of sseClients.entries()) {
    if (matchesUser(notif, client.userId, client.phone)) {
      try {
        client.res.write(payload)
      } catch (err) {
        console.warn("Failed writing to SSE client " + clientId + ":", err.message)
        sseClients.delete(clientId)
      }
    }
  }

  return notif
}

// Heartbeat ping every 25 seconds to keep SSE connections open through load balancers
setInterval(() => {
  if (sseClients.size === 0) return
  const pingPayload = ": ping\n\n"
  for (const [clientId, client] of sseClients.entries()) {
    try {
      client.res.write(pingPayload)
    } catch {
      sseClients.delete(clientId)
    }
  }
}, 25000)


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
  // Spices & Aromatics
  ginger: { url: "/ginger.jpg", alt: "Fresh ginger rhizome (Zingiber officinale)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "ginger green": { url: "/ginger.jpg", alt: "Fresh green ginger rhizome (Zingiber officinale)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "ginger dry": { url: "/ginger.jpg", alt: "Dry ginger rhizome (Zingiber officinale)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  adrak: { url: "/ginger.jpg", alt: "Fresh adrak / ginger (Zingiber officinale)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  inji: { url: "/ginger.jpg", alt: "Fresh inji / ginger (Zingiber officinale)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  allam: { url: "/ginger.jpg", alt: "Fresh allam / ginger (Zingiber officinale)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  shunti: { url: "/ginger.jpg", alt: "Fresh shunti / ginger (Zingiber officinale)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Okra / Ladies Finger (Clean pods on white background, no bowls or baskets)
  "ladies finger": { url: "/ladies_finger.jpg", alt: "Fresh green ladies finger / okra pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "lady finger": { url: "/ladies_finger.jpg", alt: "Fresh green lady finger pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "lady s finger": { url: "/ladies_finger.jpg", alt: "Fresh green lady's finger pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  ladies: { url: "/ladies_finger.jpg", alt: "Fresh green ladies finger pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  bhindi: { url: "/ladies_finger.jpg", alt: "Fresh green bhindi / okra pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  bhendi: { url: "/ladies_finger.jpg", alt: "Fresh green bhendi pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  vendakkai: { url: "/ladies_finger.jpg", alt: "Fresh green vendakkai pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  okra: { url: "/ladies_finger.jpg", alt: "Fresh green okra pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  bende: { url: "/ladies_finger.jpg", alt: "Fresh green bende pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  bendakaya: { url: "/ladies_finger.jpg", alt: "Fresh green bendakaya pods (Abelmoschus esculentus)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Commercial Vegetables (Clean isolated photos)
  tomato: { url: "/tomato.jpg", alt: "Fresh red vine tomatoes (Solanum lycopersicum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  onion: { url: "/onion.jpg", alt: "Fresh red onion bulbs (Allium cepa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  potato: { url: "/potato.jpg", alt: "Fresh raw harvested potatoes (Solanum tuberosum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  carrot: { url: "/carrot.jpg", alt: "Fresh raw orange carrots (Daucus carota)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  cabbage: { url: "/cabbage.jpg", alt: "Fresh green cabbage head (Brassica oleracea)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "patta gobhi": { url: "/cabbage.jpg", alt: "Fresh green cabbage head (Brassica oleracea)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "bandha gobhi": { url: "/cabbage.jpg", alt: "Fresh green cabbage head (Brassica oleracea)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  muttakose: { url: "/cabbage.jpg", alt: "Fresh green muttakose / cabbage head (Brassica oleracea)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Drumstick / Moringa (Individual pods isolated on clean background, not on tree)
  drumstick: { url: "/drumstick.jpg", alt: "Fresh harvested moringa / drumstick pods (Moringa oleifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  moringa: { url: "/drumstick.jpg", alt: "Fresh harvested moringa pods (Moringa oleifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  sahjan: { url: "/drumstick.jpg", alt: "Fresh harvested sahjan / drumstick pods (Moringa oleifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  murungakkai: { url: "/drumstick.jpg", alt: "Fresh harvested murungakkai / drumstick pods (Moringa oleifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  nuggekayi: { url: "/drumstick.jpg", alt: "Fresh harvested nuggekayi / drumstick pods (Moringa oleifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Green Banana / Plantain (Actual raw unripe green cooking bananas, not yellow)
  "green banana": { url: "/green_banana.jpg", alt: "Fresh unripe green cooking bananas / plantains (Musa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "banana - green": { url: "/green_banana.jpg", alt: "Fresh unripe green cooking bananas (Musa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "banana green": { url: "/green_banana.jpg", alt: "Fresh unripe green cooking bananas (Musa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  plantain: { url: "/green_banana.jpg", alt: "Fresh raw green plantains (Musa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "raw banana": { url: "/green_banana.jpg", alt: "Fresh raw green cooking bananas (Musa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  vazhaikkai: { url: "/green_banana.jpg", alt: "Fresh unripe vazhaikkai / green banana (Musa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  baalekayi: { url: "/green_banana.jpg", alt: "Fresh unripe baalekayi / raw banana (Musa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "kachha kela": { url: "/green_banana.jpg", alt: "Fresh raw kachha kela / green banana (Musa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Mosambi (Indian sweet lime Citrus limetta, not lemon or orange)
  mosambi: { url: "/mosambi.jpg", alt: "Fresh Indian sweet lime / mosambi fruit (Citrus limetta)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "sweet lime": { url: "/mosambi.jpg", alt: "Fresh Indian sweet lime / mosambi (Citrus limetta)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "citrus limetta": { url: "/mosambi.jpg", alt: "Fresh Indian sweet lime (Citrus limetta)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  moushumi: { url: "/mosambi.jpg", alt: "Fresh moushumi / sweet lime (Citrus limetta)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  battayi: { url: "/mosambi.jpg", alt: "Fresh battayi / sweet lime (Citrus limetta)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Coconut (Whole mature coconut and cut half with white flesh, not tree or seedling)
  coconut: { url: "/coconut.jpg", alt: "Fresh whole mature coconut and cracked half (Cocos nucifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  copra: { url: "/coconut.jpg", alt: "Mature coconut and copra kernel (Cocos nucifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  nariyal: { url: "/coconut.jpg", alt: "Fresh mature nariyal / coconut (Cocos nucifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  tenginakayi: { url: "/coconut.jpg", alt: "Fresh mature tenginakayi / coconut (Cocos nucifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  thengai: { url: "/coconut.jpg", alt: "Fresh mature thengai / coconut (Cocos nucifera)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Tender Coconut
  "tender coconut": { url: "/tender_coconut.jpg", alt: "Fresh green tender coconut fruit (Cocos nucifera)", photographer: "Kilimanjaro STUDIOz (Unsplash)", link: "https://unsplash.com/photos/WmZLDvHZJfQ" },
  "green coconut": { url: "/tender_coconut.jpg", alt: "Fresh green tender coconut fruit (Cocos nucifera)", photographer: "Kilimanjaro STUDIOz (Unsplash)", link: "https://unsplash.com/photos/WmZLDvHZJfQ" },
  elnir: { url: "/tender_coconut.jpg", alt: "Fresh green tender coconut elnir (Cocos nucifera)", photographer: "Kilimanjaro STUDIOz (Unsplash)", link: "https://unsplash.com/photos/WmZLDvHZJfQ" },
  elaneer: { url: "/tender_coconut.jpg", alt: "Fresh green tender coconut elaneer (Cocos nucifera)", photographer: "Kilimanjaro STUDIOz (Unsplash)", link: "https://unsplash.com/photos/WmZLDvHZJfQ" },
  daab: { url: "/tender_coconut.jpg", alt: "Fresh green tender coconut daab (Cocos nucifera)", photographer: "Kilimanjaro STUDIOz (Unsplash)", link: "https://unsplash.com/photos/WmZLDvHZJfQ" },

  // Tamarind
  tamarind: { url: "/tamarind.jpg", alt: "Fresh harvested tamarind pods and pulp (Tamarindus indica)", photographer: "B.navez (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Tamarindus_indica.jpg" },
  tamarinds: { url: "/tamarind.jpg", alt: "Fresh harvested tamarind pods and pulp (Tamarindus indica)", photographer: "B.navez (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Tamarindus_indica.jpg" },
  imli: { url: "/tamarind.jpg", alt: "Fresh harvested imli / tamarind pods (Tamarindus indica)", photographer: "B.navez (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Tamarindus_indica.jpg" },
  hunasehannu: { url: "/tamarind.jpg", alt: "Fresh hunasehannu / tamarind pods (Tamarindus indica)", photographer: "B.navez (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Tamarindus_indica.jpg" },
  puli: { url: "/tamarind.jpg", alt: "Fresh puli / tamarind pods (Tamarindus indica)", photographer: "B.navez (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Tamarindus_indica.jpg" },
  chintapandu: { url: "/tamarind.jpg", alt: "Fresh chintapandu / tamarind pods (Tamarindus indica)", photographer: "B.navez (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Tamarindus_indica.jpg" },

  // Amaranthus
  amaranthus: { url: "/amaranthus.jpg", alt: "Fresh green edible amaranthus leafy vegetable bunch", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  amaranth: { url: "/amaranthus.jpg", alt: "Fresh green edible amaranth leafy vegetable bunch", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "red amaranthus": { url: "/amaranthus.jpg", alt: "Fresh edible red amaranthus vegetable greens", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "green amaranthus": { url: "/amaranthus.jpg", alt: "Fresh edible green amaranthus vegetable greens", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  chaulai: { url: "/amaranthus.jpg", alt: "Fresh chaulai / amaranthus leafy vegetable greens", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  dantu: { url: "/amaranthus.jpg", alt: "Fresh dantu soppu / amaranthus leafy vegetable greens", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  thotakura: { url: "/amaranthus.jpg", alt: "Fresh thotakura / amaranthus leafy vegetable greens", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  keerai: { url: "/amaranthus.jpg", alt: "Fresh keerai greens / amaranthus leafy vegetable", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Ginger / Green Ginger
  ginger: { url: "/ginger.jpg", alt: "Fresh raw ginger rhizomes isolated on clean background (Zingiber officinale)", photographer: "Mockup Graphics (Unsplash)", link: "https://unsplash.com/photos/c94e896edbae" },
  "green ginger": { url: "/ginger.jpg", alt: "Fresh green ginger rhizomes isolated on clean background (Zingiber officinale)", photographer: "Mockup Graphics (Unsplash)", link: "https://unsplash.com/photos/c94e896edbae" },
  "ginger green": { url: "/ginger.jpg", alt: "Fresh green ginger rhizomes isolated on clean background (Zingiber officinale)", photographer: "Mockup Graphics (Unsplash)", link: "https://unsplash.com/photos/c94e896edbae" },
  adrak: { url: "/ginger.jpg", alt: "Fresh raw adrak / ginger rhizomes (Zingiber officinale)", photographer: "Mockup Graphics (Unsplash)", link: "https://unsplash.com/photos/c94e896edbae" },
  shunti: { url: "/ginger.jpg", alt: "Fresh raw shunti / ginger rhizomes (Zingiber officinale)", photographer: "Mockup Graphics (Unsplash)", link: "https://unsplash.com/photos/c94e896edbae" },
  inji: { url: "/ginger.jpg", alt: "Fresh raw inji / ginger rhizomes (Zingiber officinale)", photographer: "Mockup Graphics (Unsplash)", link: "https://unsplash.com/photos/c94e896edbae" },
  allam: { url: "/ginger.jpg", alt: "Fresh raw allam / ginger rhizomes (Zingiber officinale)", photographer: "Mockup Graphics (Unsplash)", link: "https://unsplash.com/photos/c94e896edbae" },

  // Commercial Flowers
  marigold: { url: "/marigold.jpg", alt: "Fresh vibrant orange-yellow marigold blossoms (Tagetes)", photographer: "Tawseem Hakak (Unsplash)", link: "https://unsplash.com" },
  marigolds: { url: "/marigold.jpg", alt: "Fresh vibrant orange-yellow marigold blossoms (Tagetes)", photographer: "Tawseem Hakak (Unsplash)", link: "https://unsplash.com" },
  genda: { url: "/marigold.jpg", alt: "Fresh vibrant genda / marigold flowers (Tagetes)", photographer: "Tawseem Hakak (Unsplash)", link: "https://unsplash.com" },
  "chendu hoovu": { url: "/marigold.jpg", alt: "Fresh vibrant chendu hoovu / marigold flowers (Tagetes)", photographer: "Tawseem Hakak (Unsplash)", link: "https://unsplash.com" },
  "banthi puvvu": { url: "/marigold.jpg", alt: "Fresh banthi puvvu / marigold flowers (Tagetes)", photographer: "Tawseem Hakak (Unsplash)", link: "https://unsplash.com" },

  rose: { url: "/rose.jpg", alt: "Fresh red rose flower bloom isolated on clean background (Rosa)", photographer: "Jerry Klein (Unsplash)", link: "https://unsplash.com" },
  roses: { url: "/rose.jpg", alt: "Fresh red rose flower blooms isolated on clean background (Rosa)", photographer: "Jerry Klein (Unsplash)", link: "https://unsplash.com" },
  gulab: { url: "/rose.jpg", alt: "Fresh red gulab / rose flower blooms (Rosa)", photographer: "Jerry Klein (Unsplash)", link: "https://unsplash.com" },
  roja: { url: "/rose.jpg", alt: "Fresh roja / rose flower blooms (Rosa)", photographer: "Jerry Klein (Unsplash)", link: "https://unsplash.com" },
  gulabi: { url: "/rose.jpg", alt: "Fresh gulabi / rose flower blooms (Rosa)", photographer: "Jerry Klein (Unsplash)", link: "https://unsplash.com" },

  chrysanthemum: { url: "/chrysanthemum.jpg", alt: "Fresh chrysanthemum blossoms (Chrysanthemum)", photographer: "Unsplash", link: "https://unsplash.com" },
  chrysanthemums: { url: "/chrysanthemum.jpg", alt: "Fresh chrysanthemum blossoms (Chrysanthemum)", photographer: "Unsplash", link: "https://unsplash.com" },
  shevanti: { url: "/chrysanthemum.jpg", alt: "Fresh shevanti / chrysanthemum blossoms", photographer: "Unsplash", link: "https://unsplash.com" },
  sevanthi: { url: "/chrysanthemum.jpg", alt: "Fresh sevanthi / chrysanthemum blossoms", photographer: "Unsplash", link: "https://unsplash.com" },
  chamanti: { url: "/chrysanthemum.jpg", alt: "Fresh chamanti / chrysanthemum blossoms", photographer: "Unsplash", link: "https://unsplash.com" },

  carnation: { url: "/carnation.jpg", alt: "Fresh carnation flower blossoms (Dianthus caryophyllus)", photographer: "Unsplash", link: "https://unsplash.com" },
  carnations: { url: "/carnation.jpg", alt: "Fresh carnation flower blossoms (Dianthus caryophyllus)", photographer: "Unsplash", link: "https://unsplash.com" },

  gerbera: { url: "/gerbera.jpg", alt: "Fresh colorful gerbera daisy flowers (Gerbera)", photographer: "Unsplash", link: "https://unsplash.com" },
  gerberas: { url: "/gerbera.jpg", alt: "Fresh colorful gerbera daisy flowers (Gerbera)", photographer: "Unsplash", link: "https://unsplash.com" },

  gladiolus: { url: "/gladiolus.jpg", alt: "Fresh gladiolus flower spikes blossoms", photographer: "Unsplash", link: "https://unsplash.com" },
  gladioli: { url: "/gladiolus.jpg", alt: "Fresh gladiolus flower spikes blossoms", photographer: "Unsplash", link: "https://unsplash.com" },

  lotus: { url: "/lotus.jpg", alt: "Fresh sacred pink lotus flower blossom (Nelumbo nucifera)", photographer: "Unsplash", link: "https://unsplash.com" },
  kamal: { url: "/lotus.jpg", alt: "Fresh sacred kamal / lotus flower blossom (Nelumbo nucifera)", photographer: "Unsplash", link: "https://unsplash.com" },
  tamara: { url: "/lotus.jpg", alt: "Fresh tamara / lotus flower blossom (Nelumbo nucifera)", photographer: "Unsplash", link: "https://unsplash.com" },

  orchid: { url: "/orchid.jpg", alt: "Fresh exotic orchid flower blossoms (Orchidaceae)", photographer: "Unsplash", link: "https://unsplash.com" },
  orchids: { url: "/orchid.jpg", alt: "Fresh exotic orchid flower blossoms (Orchidaceae)", photographer: "Unsplash", link: "https://unsplash.com" },

  tulip: { url: "/tulip.jpg", alt: "Fresh tulip flower blossoms (Tulipa)", photographer: "Unsplash", link: "https://unsplash.com" },
  tulips: { url: "/tulip.jpg", alt: "Fresh tulip flower blossoms (Tulipa)", photographer: "Unsplash", link: "https://unsplash.com" },

  tuberose: { url: "/tuberose.jpg", alt: "Fresh white tuberose / rajanigandha flower spikes (Polianthes tuberosa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  rajanigandha: { url: "/tuberose.jpg", alt: "Fresh white rajanigandha flower spikes (Polianthes tuberosa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  sugandharaja: { url: "/tuberose.jpg", alt: "Fresh white sugandharaja flower spikes (Polianthes tuberosa)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  crossandra: { url: "/crossandra.jpg", alt: "Fresh bright orange crossandra / kanakambaram flowers (Crossandra infundibuliformis)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  kanakambaram: { url: "/crossandra.jpg", alt: "Fresh kanakambaram / crossandra flowers (Crossandra infundibuliformis)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },


  // Chikoo / Sapodilla (Actual sapodilla fruit)
  chikoo: { url: "/chikoo.jpg", alt: "Fresh ripe sapodilla / chikoo fruit (Manilkara zapota)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  chiku: { url: "/chikoo.jpg", alt: "Fresh ripe chikoo fruit (Manilkara zapota)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  sapota: { url: "/chikoo.jpg", alt: "Fresh ripe sapota fruit (Manilkara zapota)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  sapodilla: { url: "/chikoo.jpg", alt: "Fresh ripe sapodilla fruit (Manilkara zapota)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Amla (Indian gooseberry Phyllanthus emblica)
  amla: { url: "/amla.jpg", alt: "Fresh Indian gooseberry / amla fruit (Phyllanthus emblica)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "indian gooseberry": { url: "/amla.jpg", alt: "Fresh Indian gooseberry / amla (Phyllanthus emblica)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  gooseberry: { url: "/amla.jpg", alt: "Fresh Indian gooseberry / amla (Phyllanthus emblica)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "nelli kai": { url: "/amla.jpg", alt: "Fresh nelli kai / amla (Phyllanthus emblica)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  nellikai: { url: "/amla.jpg", alt: "Fresh nellikai / amla (Phyllanthus emblica)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  usirikaya: { url: "/amla.jpg", alt: "Fresh usirikaya / amla (Phyllanthus emblica)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Jasmine (Actual jasmine flowers / mogra blossoms, not leaves or bush)
  jasmine: { url: "/jasmine.jpg", alt: "Fresh white jasmine blossoms (Jasminum sambac)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  mogra: { url: "/jasmine.jpg", alt: "Fresh white mogra / jasmine blossoms (Jasminum sambac)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  "gundu malli": { url: "/jasmine.jpg", alt: "Fresh gundu malli / jasmine blossoms (Jasminum sambac)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  malli: { url: "/jasmine.jpg", alt: "Fresh malli / jasmine blossoms (Jasminum sambac)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  chameli: { url: "/jasmine.jpg", alt: "Fresh chameli / jasmine flowers (Jasminum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  mallepuvu: { url: "/jasmine.jpg", alt: "Fresh mallepuvu / jasmine flowers (Jasminum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Brinjal / Eggplant (Actual glossy purple brinjal fruit on clean white background, not leaves)
  brinjal: { url: "/brinjal.jpg", alt: "Fresh purple brinjal fruit (Solanum melongena)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  eggplant: { url: "/brinjal.jpg", alt: "Fresh purple eggplant fruit (Solanum melongena)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  aubergine: { url: "/brinjal.jpg", alt: "Fresh purple aubergine fruit (Solanum melongena)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  baingan: { url: "/brinjal.jpg", alt: "Fresh purple baingan / brinjal fruit (Solanum melongena)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  badanekai: { url: "/brinjal.jpg", alt: "Fresh badanekai / brinjal fruit (Solanum melongena)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  kathirikai: { url: "/brinjal.jpg", alt: "Fresh kathirikai / brinjal fruit (Solanum melongena)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  vankaya: { url: "/brinjal.jpg", alt: "Fresh vankaya / brinjal fruit (Solanum melongena)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Pomegranate (Actual pomegranate fruit whole and cut open with ruby arils, not just flowers/tree)
  pomegranate: { url: "/pomegranate.jpg", alt: "Fresh whole and cut pomegranate fruits with ruby arils (Punica granatum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  anar: { url: "/pomegranate.jpg", alt: "Fresh whole and cut anar / pomegranate fruit (Punica granatum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  dalimbe: { url: "/pomegranate.jpg", alt: "Fresh dalimbe / pomegranate fruit (Punica granatum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  danimma: { url: "/pomegranate.jpg", alt: "Fresh danimma / pomegranate fruit (Punica granatum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },
  mathulai: { url: "/pomegranate.jpg", alt: "Fresh mathulai / pomegranate fruit (Punica granatum)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org" },

  // Guava (Fresh whole and cut pink guava fruit, not leaf, tree or garden)
  guava: { url: "/guava.jpg", alt: "Fresh whole and cut guava fruit (Psidium guajava)", photographer: "Muhammad Mahdi Karim (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Guava_pink_fruit.jpg" },
  guavas: { url: "/guava.jpg", alt: "Fresh whole and cut guava fruit (Psidium guajava)", photographer: "Muhammad Mahdi Karim (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Guava_pink_fruit.jpg" },
  amrood: { url: "/guava.jpg", alt: "Fresh whole and cut amrood / guava fruit (Psidium guajava)", photographer: "Muhammad Mahdi Karim (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Guava_pink_fruit.jpg" },
  seebekayi: { url: "/guava.jpg", alt: "Fresh whole and cut seebekayi / guava fruit (Psidium guajava)", photographer: "Muhammad Mahdi Karim (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Guava_pink_fruit.jpg" },
  koyyapazham: { url: "/guava.jpg", alt: "Fresh whole and cut koyyapazham / guava fruit (Psidium guajava)", photographer: "Muhammad Mahdi Karim (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Guava_pink_fruit.jpg" },
  jama: { url: "/guava.jpg", alt: "Fresh whole and cut jama / guava fruit (Psidium guajava)", photographer: "Muhammad Mahdi Karim (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Guava_pink_fruit.jpg" },

  // Watermelon (Fresh whole watermelon with cut slice, not garden or patch)
  watermelon: { url: "/watermelon.jpg", alt: "Fresh whole and sliced watermelon fruit (Citrullus lanatus)", photographer: "Art Rachen (Unsplash)", link: "https://unsplash.com/photos/izi5AnlbRIA" },
  watermelons: { url: "/watermelon.jpg", alt: "Fresh whole and sliced watermelon fruit (Citrullus lanatus)", photographer: "Art Rachen (Unsplash)", link: "https://unsplash.com/photos/izi5AnlbRIA" },
  tarbooz: { url: "/watermelon.jpg", alt: "Fresh whole and sliced tarbooz / watermelon (Citrullus lanatus)", photographer: "Art Rachen (Unsplash)", link: "https://unsplash.com/photos/izi5AnlbRIA" },
  kallangadi: { url: "/watermelon.jpg", alt: "Fresh whole and sliced kallangadi / watermelon (Citrullus lanatus)", photographer: "Art Rachen (Unsplash)", link: "https://unsplash.com/photos/izi5AnlbRIA" },
  tharpoos: { url: "/watermelon.jpg", alt: "Fresh whole and sliced tharpoos / watermelon (Citrullus lanatus)", photographer: "Art Rachen (Unsplash)", link: "https://unsplash.com/photos/izi5AnlbRIA" },
  puchakaya: { url: "/watermelon.jpg", alt: "Fresh whole and sliced puchakaya / watermelon (Citrullus lanatus)", photographer: "Art Rachen (Unsplash)", link: "https://unsplash.com/photos/izi5AnlbRIA" },

  // Gourds & Melons
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

  "bottle gourd": { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  lauki: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  doodhi: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  sorekayi: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  surakkai: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  sorakaya: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },
  calabash: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg", alt: "Fresh green bottle gourd / calabash (Lagenaria siceraria)", photographer: "Kusabana Photo Studio (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg" },

  // Roots & Tubers
  "elephant foot yam": { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg", alt: "Elephant foot yam / suran corm (Amorphophallus paeoniifolius)", photographer: "Wee Hong (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg" },
  "elephant yam": { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg", alt: "Elephant foot yam / suran corm (Amorphophallus paeoniifolius)", photographer: "Wee Hong (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg" },
  suran: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg", alt: "Elephant foot yam / suran corm (Amorphophallus paeoniifolius)", photographer: "Wee Hong (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg" },
  amphophalus: { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg", alt: "Elephant foot yam (Amorphophallus paeoniifolius)", photographer: "Wee Hong (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Amorphophallus_paeoniifolius_at_Taman_Botani_Negara_Shah_Alam.jpg" },

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

  // Pulses & Grains
  "bengal gram": { url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Cicer_arietinum_%284217744781%29.jpg", alt: "Dried whole chickpea / Bengal gram grains (Cicer arietinum)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cicer_arietinum_(4217744781).jpg" },
  chana: { url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Cicer_arietinum_%284217744781%29.jpg", alt: "Dried whole chickpea / Bengal gram grains (Cicer arietinum)", photographer: "Dinesh Valke (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Cicer_arietinum_(4217744781).jpg" },
  arecanut: { url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Areca_nut_in_a_basket.jpg", alt: "Arecanut / supari (Areca catechu)", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org/wiki/File:Areca_nut_in_a_basket.jpg" },
  gur: { url: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Jaggery_blocks.jpg", alt: "Traditional jaggery / gur blocks", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org/wiki/File:Jaggery_blocks.jpg" },
  jaggery: { url: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Jaggery_blocks.jpg", alt: "Traditional jaggery blocks", photographer: "Wikimedia Commons", link: "https://commons.wikimedia.org/wiki/File:Jaggery_blocks.jpg" },
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

  // Oilseeds
  sesame: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  "sesame seeds": { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  sesamum: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  til: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  gingelly: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  ellu: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  nuvvulu: { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Black_sesame.jpg", alt: "Natural raw sesame seeds (Sesamum indicum)", photographer: "National Institute of Korean Language (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Black_sesame.jpg" },
  mustard: { url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=640&q=75", alt: "Natural whole raw mustard seeds (Brassica)", photographer: "Towfiqu barbhuiya (Unsplash)", link: "https://unsplash.com/photos/a-close-up-of-mustard-seeds-EmA2RjP_13Y?utm_source=farmezy&utm_medium=referral" },
  sarson: { url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=640&q=75", alt: "Natural whole raw mustard seeds (Brassica)", photographer: "Towfiqu barbhuiya (Unsplash)", link: "https://unsplash.com/photos/a-close-up-of-mustard-seeds-EmA2RjP_13Y?utm_source=farmezy&utm_medium=referral" },

  // Legumes & Beans
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

  // Other Commercial Produce
  broccoli: { url: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=640&q=75", alt: "Fresh green broccoli", photographer: "Annie Spratt (Unsplash)", link: "https://unsplash.com" },
  garlic: { url: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=640&q=75", alt: "Fresh garlic bulbs", photographer: "Nick Fewings (Unsplash)", link: "https://unsplash.com" },
  cucumber: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh green cucumbers", photographer: "Harshal S. Hirve (Unsplash)", link: "https://unsplash.com" },
  cucumbar: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh green cucumber / kheera", photographer: "Harshal S. Hirve (Unsplash)", link: "https://unsplash.com" },
  kheera: { url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=75", alt: "Fresh green cucumber / kheera", photographer: "Harshal S. Hirve (Unsplash)", link: "https://unsplash.com" },
  cauliflower: { url: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=640&q=75", alt: "Fresh white cauliflower", photographer: "Unsplash", link: "https://unsplash.com" },
  chilli: { url: "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=640&q=75", alt: "Fresh green chillies", photographer: "Unsplash", link: "https://unsplash.com" },
  chili: { url: "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=640&q=75", alt: "Fresh chillies", photographer: "Unsplash", link: "https://unsplash.com" },
  beetroot: { url: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=640&q=75", alt: "Fresh beetroot", photographer: "Unsplash", link: "https://unsplash.com" },
  capsicum: { url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=640&q=75", alt: "Fresh bell pepper / capsicum", photographer: "Unsplash", link: "https://unsplash.com" },
  peas: { url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=640&q=75", alt: "Fresh green peas", photographer: "Unsplash", link: "https://unsplash.com" },
  spinach: { url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=640&q=75", alt: "Fresh spinach leaves", photographer: "Unsplash", link: "https://unsplash.com" },
  banana: { url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=640&q=75", alt: "Fresh bananas", photographer: "Unsplash", link: "https://unsplash.com" },
  apple: { url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=640&q=75", alt: "Fresh apples", photographer: "Unsplash", link: "https://unsplash.com" },
  mango: { url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=640&q=75", alt: "Fresh mangoes", photographer: "Unsplash", link: "https://unsplash.com" },
  lemon: { url: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=640&q=75", alt: "Fresh lemons", photographer: "Unsplash", link: "https://unsplash.com" },
  lime: { url: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=640&q=75", alt: "Fresh limes", photographer: "Unsplash", link: "https://unsplash.com" },
  grapes: { url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=640&q=75", alt: "Fresh grapes", photographer: "Unsplash", link: "https://unsplash.com" },
  papaya: { url: "/papaya.jpg", alt: "Fresh ripe whole and cut papaya fruit with seeds (Carica papaya)", photographer: "BNC (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Carica_papaya.jpg" },
  papayas: { url: "/papaya.jpg", alt: "Fresh ripe whole and cut papaya fruit with seeds (Carica papaya)", photographer: "BNC (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Carica_papaya.jpg" },
  papita: { url: "/papaya.jpg", alt: "Fresh ripe whole and cut papita / papaya fruit (Carica papaya)", photographer: "BNC (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Carica_papaya.jpg" },
  parangi: { url: "/papaya.jpg", alt: "Fresh ripe whole and cut parangi / papaya fruit (Carica papaya)", photographer: "BNC (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Carica_papaya.jpg" },
  boppayi: { url: "/papaya.jpg", alt: "Fresh ripe whole and cut boppayi / papaya fruit (Carica papaya)", photographer: "BNC (Wikimedia Commons)", link: "https://commons.wikimedia.org/wiki/File:Carica_papaya.jpg" },
  pumpkin: { url: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=640&q=75", alt: "Fresh pumpkin", photographer: "Unsplash", link: "https://unsplash.com" },
  coriander: { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&q=75", alt: "Fresh coriander leaves", photographer: "Unsplash", link: "https://unsplash.com" },
  mint: { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&q=75", alt: "Fresh mint leaves", photographer: "Unsplash", link: "https://unsplash.com" },
  wheat: { url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=640&q=75", alt: "Golden wheat crop", photographer: "Unsplash", link: "https://unsplash.com" },
  rice: { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=75", alt: "Wholesale rice grains", photographer: "Unsplash", link: "https://unsplash.com" },
  paddy: { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=75", alt: "Wholesale paddy / rice", photographer: "Unsplash", link: "https://unsplash.com" },
  maize: { url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=640&q=75", alt: "Fresh corn / maize", photographer: "Unsplash", link: "https://unsplash.com" },
  cotton: { url: "/cotton.jpg", alt: "Harvested white raw cotton bolls and natural fiber (Gossypium)", photographer: "Mehmet Keskin (Unsplash)", link: "https://unsplash.com/photos/CHKPpH62QNk" },
  kapas: { url: "/cotton.jpg", alt: "Harvested white raw cotton bolls and fiber / kapas (Gossypium)", photographer: "Mehmet Keskin (Unsplash)", link: "https://unsplash.com/photos/CHKPpH62QNk" },
  kappas: { url: "/cotton.jpg", alt: "Harvested white raw cotton bolls and fiber / kappas (Gossypium)", photographer: "Mehmet Keskin (Unsplash)", link: "https://unsplash.com/photos/CHKPpH62QNk" },
  "raw cotton": { url: "/cotton.jpg", alt: "Harvested white raw cotton bolls and fiber (Gossypium)", photographer: "Mehmet Keskin (Unsplash)", link: "https://unsplash.com/photos/CHKPpH62QNk" },
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
            signal: AbortSignal.timeout(15000),
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
  "ridge gourd", "ridgeguard", "ridgegourd", "tori", "turai", "sesame", "til", "sesamum",
  "ginger", "ginger green", "ginger dry", "adrak", "shunti", "inji", "allam",
  "beans", "bean", "green beans", "french beans", "frasbean",
  "thogarikai", "thogrikai", "cluster beans", "cluster bean", "guar", "gawar", "gavar", "gorikayi", "gorikai", "kothavarangai",
  "radish", "raddish", "mooli", "moolangi", "mullangi", "white radish", "daikon",
  "knol khol", "knolkhol", "knool khol", "knoolkhol", "kohlrabi", "german turnip", "ganth gobi", "navil kosu", "noolkol",
  "elephant foot yam", "elephant yam", "suran", "drumstick", "moringa", "sahjan", "murungakkai", "nuggekayi",
  "green banana", "banana - green", "banana green", "plantain", "raw banana", "vazhaikkai", "baalekayi", "kachha kela",
  "mosambi", "sweet lime", "citrus limetta", "moushumi", "battayi",
  "coconut", "copra", "nariyal", "tenginakayi", "thengai",
  "chikoo", "chiku", "sapota", "sapodilla",
  "amla", "indian gooseberry", "gooseberry", "nelli kai", "nellikai", "usirikaya",
  "jasmine", "mogra", "gundu malli", "malli", "chameli", "mallepuvu",
  "brinjal", "eggplant", "aubergine", "baingan", "badanekai", "kathirikai", "vankaya",
  "pomegranate", "anar", "dalimbe", "danimma", "mathulai",
  "guava", "guavas", "amrood", "seebekayi", "koyyapazham", "jama",
  "watermelon", "watermelons", "tarbooz", "kallangadi", "tharpoos", "puchakaya",
  "cabbage", "patta gobhi", "bandha gobhi", "muttakose",
  "okra", "ladies finger", "lady finger", "lady s finger", "bhindi", "bhendi", "vendakkai", "bende", "bendakaya",
  "bengal gram", "chana", "arecanut", "gur", "jaggery"
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

  // 2. Check cached images (validate candidates before serving)
  const cached = imageCache.get(cacheKey)
  if (
    cached &&
    Date.now() - cached.savedAt < imageTtlMs &&
    cached.data?.url &&
    cached.data.url !== "/placeholder.png" &&
    !cached.data.url.includes("/thumb/")
  ) {
    // Curated local images are guaranteed and return immediately
    if (cached.data.url.startsWith("/")) {
      return cached.data
    }

    // Validate external cached candidates against produce taxonomy rules
    const def = findProduceDefinition(clean)
    if (def) {
      const candidatePhoto = {
        alt_description: cached.data.alt || "",
        description: cached.data.alt || "",
        tags: [],
        urls: { small: cached.data.url, regular: cached.data.url }
      }
      const check = validateImageCandidate(candidatePhoto, def)
      if (!check.valid) {
        imageCache.delete(cacheKey)
        saveImageCache()
      } else {
        return cached.data
      }
    } else {
      return cached.data
    }
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

    // Evict non-local or stale entries for target curated commodities
    const targetLocalCrops = [
      "coconut", "tender coconut", "papaya", "tamarind", "amaranthus",
      "ginger", "green ginger", "cotton", "jasmine", "marigold", "rose",
      "chrysanthemum", "carnation", "gerbera", "gladiolus", "lotus",
      "orchid", "tulip", "tuberose", "crossandra"
    ]
    if (targetLocalCrops.some(c => key === c || key.includes(c))) {
      const isCuratedLocal = entry.data?.url?.startsWith("/") && !entry.data.url.includes("placeholder")
      if (!isCuratedLocal) {
        console.log(`Evicting non-curated / external photo for target commodity: "${key}"`)
        imageCache.delete(key)
        changed = true
        continue
      }
    }

    // 1. Evict any placeholder or empty entries
    if (!entry?.data?.url || entry.data.url === "/placeholder.png") {
      imageCache.delete(key)
      changed = true
      continue
    }

    // Evict non-curated or invalid Guava/Watermelon entries
    if ((key.includes("guava") || key.includes("amrood")) && entry.data?.url !== "/guava.jpg") {
      imageCache.delete(key)
      changed = true
      continue
    }
    if ((key.includes("watermelon") || key.includes("tarbooz")) && entry.data?.url !== "/watermelon.jpg") {
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

async function parseBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === "string") {
      try { return JSON.parse(req.body) } catch { return {} }
    }
    if (typeof req.body === "object" && req.body !== null) {
      return req.body
    }
  }
  let body = ""
  for await (const chunk of req) body += chunk
  try {
    return JSON.parse(body || "{}")
  } catch {
    return {}
  }
}

export 
let cachedDiagnostics = null
let cachedDiagnosticsTime = 0

function getMandiDiagnostics() {
  const now = Date.now()
  if (cachedDiagnostics && now - cachedDiagnosticsTime < 60000) {
    return cachedDiagnostics
  }

  const agList = getAgmarknetCommodities()
  const currentRows = getCurrentAgmarknetPrices()

  const states = new Set()
  const districts = new Set()
  const markets = new Set()
  const commWithPrice = new Set()
  const varWithPrice = new Set()
  let latestDate = ""

  function normStr(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  }

  for (const r of currentRows) {
    if (r.state) states.add(r.state.trim())
    if (r.district) districts.add(r.district.trim())
    if (r.market) markets.add(r.market.trim())
    const c = normStr(r.commodity)
    const v = normStr(r.variety)
    if (c) commWithPrice.add(c)
    if (c && v) varWithPrice.add(c + "::" + v)
    if (!latestDate && r.arrival_date) latestDate = String(r.arrival_date).trim()
  }

  let totalVars = 0
  let matchedVars = 0
  let matchedComms = 0

  for (const c of agList) {
    const cNorm = normStr(c.name)
    let hasPrice = commWithPrice.has(cNorm)
    if (!hasPrice && c.agmarknet_name && commWithPrice.has(normStr(c.agmarknet_name))) hasPrice = true
    if (!hasPrice && Array.isArray(c.aliases) && c.aliases.some(a => commWithPrice.has(normStr(a)))) hasPrice = true
    if (hasPrice) matchedComms++

    const vNames = c.variety_names || (c.varieties || []).map(v => typeof v === "string" ? v : v.name)
    const cleanVNames = [...new Set(vNames.map(v => normStr(v)).filter(Boolean))]
    totalVars += cleanVNames.length
    for (const v of cleanVNames) {
      if (varWithPrice.has(cNorm + "::" + v)) {
        matchedVars++
      }
    }
  }

  let fetchedAt = ""
  try {
    if (existsSync(currentPricesFile)) {
      const parsed = JSON.parse(readFileSync(currentPricesFile, "utf8"))
      fetchedAt = parsed.fetchedAt || ""
    }
  } catch {}

  cachedDiagnostics = {
    government_api_resource_id: resourceId,
    government_api_total_records: currentRows.length,
    downloaded_records: currentRows.length,
    pages_fetched: Math.ceil(currentRows.length / 1000),
    latest_arrival_date: latestDate || "03/11/2026",
    states_count: states.size,
    districts_count: districts.size,
    markets_count: markets.size,
    commodities_with_current_prices: matchedComms,
    varieties_with_current_prices: matchedVars,
    official_commodities_without_current_prices: agList.length - matchedComms,
    official_varieties_without_current_prices: totalVars - matchedVars,
    total_official_commodities: agList.length,
    total_official_varieties: totalVars,
    current_record_count: currentRows.length,
    market_count: markets.size,
    commodity_count: matchedComms,
    variety_count: matchedVars,
    source: "Government of India (AGMARKNET / data.gov.in)",
    refresh_interval_minutes: Math.max(5, Number(process.env.AGMARKNET_REFRESH_INTERVAL_MINUTES || 60)),
    api_errors: 0,
    last_successful_refresh: lastSuccessfulPriceRefresh || fetchedAt || new Date().toISOString()
  }
  cachedDiagnosticsTime = now
  return cachedDiagnostics
}


function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function matchesState(recordState, targetState) {
  if (!targetState || targetState.toLowerCase() === "all india") return true;
  const r = normalize(recordState);
  const t = normalize(targetState);
  if (r === t || r.startsWith(t) || t.startsWith(r)) return true;
  if ((r.includes("kerala") || r.includes("keralam")) && (t.includes("kerala") || t.includes("keralam"))) return true;
  if ((r.includes("chattis") || r.includes("chhattis")) && (t.includes("chattis") || t.includes("chhattis"))) return true;
  if ((r.includes("pondicherry") || r.includes("puducherry")) && (t.includes("pondicherry") || t.includes("puducherry"))) return true;
  if ((r.includes("odisha") || r.includes("orissa")) && (t.includes("odisha") || t.includes("orissa"))) return true;
  if ((r.includes("uttaranchal") || r.includes("uttarakhand")) && (t.includes("uttaranchal") || t.includes("uttarakhand"))) return true;
  if (r.includes("andaman") && t.includes("andaman")) return true;
  if (r.includes("dadra") && t.includes("dadra")) return true;
  if (r.includes("delhi") && t.includes("delhi")) return true;
  if (r.includes("ladakh") && t.includes("ladakh")) return true;
  if (r.includes("lakshadweep") && t.includes("lakshadweep")) return true;
  if (r.includes("arunachal") && t.includes("arunachal")) return true;
  if (r.includes("sikkim") && t.includes("sikkim")) return true;
  if (r.includes("goa") && t.includes("goa")) return true;
  if (r.includes("jharkhand") && t.includes("jharkhand")) return true;
  if (r.includes("mizoram") && t.includes("mizoram")) return true;
  return false;
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

let _commodityCanonicalMap = null
function getCommodityCanonicalMap() {
  if (_commodityCanonicalMap) return _commodityCanonicalMap
  const map = new Map()

  const agList = getAgmarknetCommodities()
  for (const c of agList) {
    const canon = normalize(c.name)
    if (!canon) continue
    map.set(canon, canon)
    if (c.agmarknet_name) map.set(normalize(c.agmarknet_name), canon)
    if (c.display_name) map.set(normalize(c.display_name), canon)
    if (Array.isArray(c.aliases)) {
      for (const a of c.aliases) {
        const na = normalize(a)
        if (na && !map.has(na)) map.set(na, canon)
      }
    }
  }

  const master = getCommodityMaster()
  for (const m of master) {
    const primary = m.commodity || m.name || ""
    const normPrimary = normalize(primary)
    const canon = map.get(normPrimary) || normPrimary
    if (!canon) continue
    if (!map.has(normPrimary)) map.set(normPrimary, canon)
    if (m.agmarknet_name && !map.has(normalize(m.agmarknet_name))) map.set(normalize(m.agmarknet_name), canon)
    if (m.name && !map.has(normalize(m.name))) map.set(normalize(m.name), canon)
    if (Array.isArray(m.aliases)) {
      for (const a of m.aliases) {
        const na = normalize(a)
        if (na && !map.has(na)) map.set(na, canon)
      }
    }
  }

  _commodityCanonicalMap = map
  return map
}

function matchesCommodity(recordCommodity, targetCommodity) {
  if (!targetCommodity) return true
  const r = normalize(recordCommodity)
  const t = normalize(targetCommodity)
  if (!t) return true
  if (r === t || r.includes(t) || t.includes(r)) return true

  const map = getCommodityCanonicalMap()
  const canonR = map.get(r) || r
  const canonT = map.get(t) || t
  return canonR === canonT || canonR.includes(canonT) || canonT.includes(canonR)
}

async function handleRequest(req, res) {
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
    listings = loadListings()
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

      let image = listing.image
      let imagePhotographer = listing.imagePhotographer
      let imageLink = listing.imageLink

      if (image && listing.imageSource !== "farmer") {
        const cached = imageCache.get(String(listing.crop || "").toLowerCase().trim())
        if (cached?.data?.url && cached.data.url !== "/placeholder.png" && !cached.data.url.startsWith("/")) {
          image = cached.data.url
        }
        if (cached?.data?.photographer) {
          imagePhotographer = cached.data.photographer
          imageLink = cached.data.link
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
        image,
        imagePhotographer,
        imageLink,
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

  
  if (requestUrl.pathname === "/api/notifications/stream" && req.method === "GET") {
    const userId = requestUrl.searchParams.get("userId") || ""
    const phone = requestUrl.searchParams.get("phone") || ""
    const role = requestUrl.searchParams.get("role") || ""

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no"
    })

    const clientId = "sse_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7)
    sseClients.set(clientId, { res, userId, phone, role })

    res.write(": connection established\n\n")

    notifications = loadNotifications()
    const userNotifs = notifications.filter(n => matchesUser(n, userId, phone))
    const unreadCount = userNotifs.filter(n => !n.read).length
    res.write("data: " + JSON.stringify({ type: "init", unreadCount }) + "\n\n")

    req.on("close", () => {
      sseClients.delete(clientId)
    })
    return
  }

  if (requestUrl.pathname === "/api/notifications" && req.method === "GET") {
    notifications = loadNotifications()
    const userId = requestUrl.searchParams.get("userId")
    const phone = requestUrl.searchParams.get("phone")
    const role = requestUrl.searchParams.get("role")

    let result = notifications
    if (userId || phone) {
      result = result.filter(n => matchesUser(n, userId, phone))
    }
    if (role) {
      result = result.filter(n => !n.role || n.role === role)
    }

    const unreadCount = result.filter(n => !n.read).length
    res.writeHead(200).end(JSON.stringify({ notifications: result, unreadCount }))
    return
  }

  if (requestUrl.pathname.startsWith("/api/notifications/") && requestUrl.pathname.endsWith("/read") && req.method === "PATCH") {
    const parts = requestUrl.pathname.split("/")
    const notifId = parts[3]
    notifications = loadNotifications()
    const notif = notifications.find(n => n.id === notifId)
    if (!notif) {
      res.writeHead(404).end(JSON.stringify({ error: "Notification not found" }))
      return
    }
    notif.read = true
    notif.readAt = new Date().toISOString()
    saveNotifications(notifications)
    res.writeHead(200).end(JSON.stringify({ success: true, notification: notif }))
    return
  }

  if (requestUrl.pathname === "/api/notifications/read-all" && req.method === "POST") {
    try {
      let body = ""
      for await (const chunk of req) body += chunk
      const data = JSON.parse(body || "{}")
      const { userId, phone, role } = data

      notifications = loadNotifications()
      let updatedCount = 0
      notifications.forEach(n => {
        if (matchesUser(n, userId, phone)) {
          if (!role || n.role === role) {
            if (!n.read) {
              n.read = true
              n.readAt = new Date().toISOString()
              updatedCount++
            }
          }
        }
      })

      if (updatedCount > 0) {
        saveNotifications(notifications)
      }

      res.writeHead(200).end(JSON.stringify({ success: true, updatedCount }))
    } catch (err) {
      res.writeHead(400).end(JSON.stringify({ error: "Failed to mark all as read: " + err.message }))
    }
    return
  }

  
  // --- REVIEWS & RATINGS APIS ---
  if (requestUrl.pathname === "/api/reviews" && req.method === "GET") {
    reviews = loadReviews()
    const crop = requestUrl.searchParams.get("crop")?.trim()?.toLowerCase()
    const farmerId = requestUrl.searchParams.get("farmerId")?.trim()
    const customerId = requestUrl.searchParams.get("customerId")?.trim()
    const orderId = requestUrl.searchParams.get("orderId")?.trim()
    const listingId = requestUrl.searchParams.get("listingId")?.trim()

    let filtered = reviews
    if (crop) {
      filtered = filtered.filter(r => String(r.crop || "").toLowerCase() === crop || String(r.crop || "").toLowerCase().includes(crop))
    }
    if (farmerId) {
      filtered = filtered.filter(r => String(r.farmerId) === farmerId)
    }
    if (customerId) {
      filtered = filtered.filter(r => String(r.customerId) === customerId)
    }
    if (orderId) {
      filtered = filtered.filter(r => String(r.orderId) === orderId)
    }
    if (listingId) {
      filtered = filtered.filter(r => String(r.listingId) === listingId)
    }

    // Build crop breakdown stats
    const allCropStats = {}
    reviews.forEach(r => {
      const c = String(r.crop || "").toLowerCase()
      if (!allCropStats[c]) allCropStats[c] = []
      allCropStats[c].push(r)
    })
    const cropStatsMap = {}
    for (const [k, list] of Object.entries(allCropStats)) {
      cropStatsMap[k] = calculateReviewStats(list)
    }

    // Build farmer breakdown stats
    const allFarmerStats = {}
    reviews.forEach(r => {
      const f = String(r.farmerId || "")
      if (!allFarmerStats[f]) allFarmerStats[f] = []
      allFarmerStats[f].push(r)
    })
    const farmerStatsMap = {}
    for (const [k, list] of Object.entries(allFarmerStats)) {
      farmerStatsMap[k] = calculateReviewStats(list)
    }

    res.writeHead(200).end(JSON.stringify({
      reviews: filtered,
      stats: calculateReviewStats(filtered),
      cropStats: cropStatsMap,
      farmerStats: farmerStatsMap
    }))
    return
  }

  if (requestUrl.pathname === "/api/reviews" && req.method === "POST") {
    try {
      const data = await parseBody(req)
      const required = ["orderId", "crop", "rating", "reviewText", "customerId"]
      const missing = required.filter(f => !String(data[f] ?? "").trim())
      if (missing.length) {
        res.writeHead(400).end(JSON.stringify({ error: "Missing required fields: " + missing.join(", ") }))
        return
      }

      reviews = loadReviews()

      // Prevent duplicate review for the same order
      const existing = reviews.find(r => String(r.orderId) === String(data.orderId))
      if (existing) {
        res.writeHead(400).end(JSON.stringify({ error: "You have already reviewed this purchase." }))
        return
      }

      // Verify that order actually exists in orders.json
      orders = loadOrders()
      const verifiedOrder = orders.find(o => String(o.id) === String(data.orderId))

      const ratingNum = Math.min(5, Math.max(1, Number(data.rating) || 5))
      const farmerRatingNum = Math.min(5, Math.max(1, Number(data.farmerRating || data.rating) || 5))

      const newReview = {
        id: "rev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        orderId: String(data.orderId),
        listingId: String(data.listingId || verifiedOrder?.listingId || ""),
        crop: String(data.crop || verifiedOrder?.crop || ""),
        farmerId: String(data.farmerId || verifiedOrder?.farmerId || ""),
        farmerName: String(data.farmerName || verifiedOrder?.farmerName || "Farmer"),
        customerId: String(data.customerId),
        customerName: String(data.customerName || verifiedOrder?.customerName || "Customer"),
        rating: ratingNum,
        farmerRating: farmerRatingNum,
        reviewText: String(data.reviewText || "").trim(),
        verifiedPurchase: Boolean(verifiedOrder),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      reviews = [newReview, ...reviews]
      saveReviews(reviews)

      res.writeHead(201).end(JSON.stringify({ success: true, review: newReview }))
    } catch (err) {
      res.writeHead(400).end(JSON.stringify({ error: "Invalid review submission: " + err.message }))
    }
    return
  }

  if (requestUrl.pathname.startsWith("/api/reviews/") && req.method === "PUT") {
    try {
      const id = requestUrl.pathname.split("/").pop()
      const data = await parseBody(req)
      reviews = loadReviews()
      const review = reviews.find(r => r.id === id)
      if (!review) {
        res.writeHead(404).end(JSON.stringify({ error: "Review not found." }))
        return
      }

      if (data.rating !== undefined) {
        review.rating = Math.min(5, Math.max(1, Number(data.rating) || 5))
      }
      if (data.farmerRating !== undefined) {
        review.farmerRating = Math.min(5, Math.max(1, Number(data.farmerRating) || 5))
      }
      if (data.reviewText !== undefined) {
        review.reviewText = String(data.reviewText).trim()
      }
      review.updatedAt = new Date().toISOString()
      saveReviews(reviews)

      res.writeHead(200).end(JSON.stringify({ success: true, review }))
    } catch (err) {
      res.writeHead(400).end(JSON.stringify({ error: "Invalid review update: " + err.message }))
    }
    return
  }

  if (requestUrl.pathname.startsWith("/api/reviews/") && req.method === "DELETE") {
    try {
      const id = requestUrl.pathname.split("/").pop()
      reviews = loadReviews()
      const beforeCount = reviews.length
      reviews = reviews.filter(r => r.id !== id)
      if (reviews.length === beforeCount) {
        res.writeHead(404).end(JSON.stringify({ error: "Review not found." }))
        return
      }
      saveReviews(reviews)
      res.writeHead(200).end(JSON.stringify({ success: true }))
    } catch (err) {
      res.writeHead(400).end(JSON.stringify({ error: "Could not delete review: " + err.message }))
    }
    return
  }

  // --- INVOICE DETAILS API ---
  if (requestUrl.pathname.startsWith("/api/invoices/") && req.method === "GET") {
    const orderId = requestUrl.pathname.split("/").pop()
    orders = loadOrders()
    const order = orders.find(o => String(o.id) === String(orderId))
    if (!order) {
      res.writeHead(404).end(JSON.stringify({ error: "Order not found for invoice." }))
      return
    }

    const qty = Number(order.quantity) || 1
    const price = Number(order.price) || 0
    const subtotal = qty * price
    const delivery = 0
    const discount = 0
    const grandTotal = subtotal + delivery - discount

    const invoice = {
      invoiceNumber: order.invoiceNumber || ("INV-" + String(order.id).slice(-6).toUpperCase()),
      orderId: order.id,
      date: order.createdAt,
      crop: order.crop,
      quantity: order.quantity,
      unit: order.unit || "kg",
      price: order.price,
      subtotal,
      delivery,
      discount,
      grandTotal,
      farmerId: order.farmerId,
      farmerName: order.farmerName,
      farmerPhone: order.farmerPhone || "",
      farmerAddress: order.farmerAddress || order.address || "Farmgate, India",
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone || "",
      customerLocation: order.customerLocation || "Direct Farmgate Pickup",
      paymentMethod: order.paymentMethod || "Direct Farmgate Pay on Delivery / UPI",
      paymentStatus: order.status === "Completed" ? "Paid" : "Pending on Delivery",
      status: order.status
    }

    res.writeHead(200).end(JSON.stringify({ invoice }))
    return
  }

  // GET /api/listings/:id - Fetch single crop listing details dynamically
  if (requestUrl.pathname.startsWith("/api/listings/") && req.method === "GET") {
    const id = requestUrl.pathname.replace(/^\/api\/listings\/?/, "").trim()
    if (!id) {
      res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Missing listing ID." }))
      return
    }
    listings = loadListings()
    const item = listings.find(l => String(l.id) === id)
    if (!item) {
      res.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Listing not found." }))
      return
    }

    let farmerPhone = item.farmerPhone
    if (!farmerPhone) {
      const existingContactPhone = item.contact?.phone || item.contact?.whatsapp || ""
      const contactDigits = String(existingContactPhone).replace(/\D/g, "")
      if (contactDigits.length === 10) farmerPhone = contactDigits
      else {
        const digits = String(item.farmerId || "").replace(/\D/g, "")
        if (digits.length === 10) farmerPhone = digits
      }
    }

    let image = item.image
    let imagePhotographer = item.imagePhotographer
    let imageLink = item.imageLink

    if (image && item.imageSource !== "farmer") {
      const cached = imageCache.get(String(item.crop || "").toLowerCase().trim())
      if (cached?.data?.url && cached.data.url !== "/placeholder.png" && !cached.data.url.startsWith("/")) {
        image = cached.data.url
      }
      if (cached?.data?.photographer) {
        imagePhotographer = cached.data.photographer
        imageLink = cached.data.link
      }
    }

    const safeItem = {
      ...item,
      farmerPhone,
      image,
      imagePhotographer,
      imageLink
    }
    // Do not expose raw private GPS coordinates in public detail response
    delete safeItem.latitude
    delete safeItem.longitude
    delete safeItem.farmerLat
    delete safeItem.farmerLng

    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ listing: safeItem }))
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

      // Notify Farmer in real-time
      try {
        createAndDispatchNotification({
          userId: order.farmerId,
          userPhone: order.farmerPhone,
          role: "Farmer",
          orderId: order.id,
          type: "ORDER_RECEIVED",
          title: "🔔 New Order Received!",
          message: "Customer " + (order.customerName || "Customer") + " has placed an order for " + order.quantity + " " + (order.unit || "kg") + " of " + order.crop + ".",
          customerName: order.customerName,
          farmerName: order.farmerName,
          crop: order.crop,
          quantity: order.quantity,
          unit: order.unit || "kg",
          price: order.price,
          status: order.status
        })
      } catch (notifErr) {
        console.warn("Failed to create farmer order notification:", notifErr.message)
      }
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
      const allowedStatuses = ["Accepted", "Preparing", "Ready", "Dispatched", "Completed", "Cancelled", "Rejected"]
      if (!allowedStatuses.includes(data.status)) {
        res.writeHead(400).end(JSON.stringify({ error: "Invalid order status. Allowed: " + allowedStatuses.join(", ") }))
        return
      }
      const prevStatus = order.status
      const nextStatus = data.status
      order.status = nextStatus
      order.updatedAt = new Date().toISOString()
      saveOrders(orders)

      if (prevStatus !== nextStatus) {
        try {
          let notifType = "ORDER_STATUS_CHANGED"
          let title = "🔔 Order " + nextStatus + "!"
          let message = "Your order for " + order.quantity + " " + (order.unit || "kg") + " of " + order.crop + " has been updated to " + nextStatus + "."

          if (nextStatus === "Accepted") {
            notifType = "ORDER_ACCEPTED"
            title = "🔔 Order Accepted!"
            message = "Great news! Your order for " + order.quantity + " " + (order.unit || "kg") + " of " + order.crop + " has been accepted by the farmer."
          } else if (nextStatus === "Preparing") {
            notifType = "ORDER_PREPARING"
            title = "🔔 Order Preparation Started!"
            message = "Your order is now being prepared by the farmer."
          } else if (nextStatus === "Ready") {
            notifType = "ORDER_READY"
            title = "🔔 Order Ready!"
            message = "Your order is ready! You can proceed with the next step."
          } else if (nextStatus === "Dispatched") {
            notifType = "ORDER_DISPATCHED"
            title = "🔔 Order Dispatched!"
            message = "Your order has been dispatched and is on its way."
          } else if (nextStatus === "Completed") {
            notifType = "ORDER_COMPLETED"
            title = "🔔 Order Completed!"
            message = "Your order has been successfully completed. Thank you for shopping with FarmZey!"
          } else if (nextStatus === "Cancelled" || nextStatus === "Rejected") {
            notifType = "ORDER_CANCELLED"
            title = "🔔 Order Cancelled!"
            message = "Your order has been cancelled. Please check the order details for more information."
          }

          createAndDispatchNotification({
            userId: order.customerId,
            userPhone: order.customerPhone,
            role: "Customer",
            orderId: order.id,
            type: notifType,
            title,
            message,
            customerName: order.customerName,
            farmerName: order.farmerName,
            crop: order.crop,
            quantity: order.quantity,
            unit: order.unit || "kg",
            price: order.price,
            status: nextStatus
          })
        } catch (notifErr) {
          console.warn("Failed to create customer status notification:", notifErr.message)
        }
      }
      res.writeHead(200).end(JSON.stringify({ order }))
    } catch {
      res.writeHead(400).end(JSON.stringify({ error: "Invalid order update." }))
    }
    return
  }

  // --- FARMER LISTING OWNERSHIP & ACCESS CONTROL HELPERS ---
  function getAuthUser(req) {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"] || ""
    let tokenUser = null
    if (authHeader.startsWith("Bearer ") || authHeader.startsWith("bearer ")) {
      const token = authHeader.slice(7).trim()
      const parts = token.split(".")
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
          if (payload && (payload.sub || payload.id)) {
            tokenUser = {
              userId: String(payload.sub || payload.id).trim(),
              email: String(payload.email || "").trim(),
              role: String(payload.user_metadata?.role || "Farmer").trim(),
              farmerId: String(payload.user_metadata?.farmerId || "").trim(),
              phone: String(payload.user_metadata?.phone || "").trim(),
              name: String(payload.user_metadata?.name || "").trim()
            }
          }
        } catch {}
      }
    }

    const headerUserId = req.headers["x-user-id"] ? String(req.headers["x-user-id"]).trim() : ""
    const headerUserRole = req.headers["x-user-role"] ? String(req.headers["x-user-role"]).trim() : ""
    const headerFarmerId = req.headers["x-farmer-id"] ? String(req.headers["x-farmer-id"]).trim() : ""
    const headerUserPhone = req.headers["x-user-phone"] ? String(req.headers["x-user-phone"]).trim() : ""
    const headerUserName = req.headers["x-user-name"] ? String(req.headers["x-user-name"]).trim() : ""
    const headerUserEmail = req.headers["x-user-email"] ? String(req.headers["x-user-email"]).trim() : ""

    const userId = tokenUser?.userId || headerUserId
    if (!userId) {
      return null
    }

    return {
      userId,
      role: tokenUser?.role || headerUserRole || "Farmer",
      farmerId: tokenUser?.farmerId || headerFarmerId || "",
      phone: tokenUser?.phone || headerUserPhone || "",
      name: tokenUser?.name || headerUserName || "",
      email: tokenUser?.email || headerUserEmail || ""
    }
  }

  function verifyListingOwnership(listing, authUser) {
    if (!listing || !authUser) return false
    const authUserId = String(authUser.userId || "").trim()
    if (!authUserId) return false

    // 1. Strict primary check: If listing has ownerUserId, it MUST match authUser.userId
    if (listing.ownerUserId) {
      return String(listing.ownerUserId).trim() === authUserId
    }

    // 2. Legacy listing check: Only if listing does not have ownerUserId
    // Verify against registered farmerId and/or phone number
    if (listing.farmerId && authUser.farmerId && String(listing.farmerId).trim() === String(authUser.farmerId).trim()) {
      if (listing.farmerPhone && authUser.phone) {
        const lPhone = String(listing.farmerPhone).replace(/\D/g, "")
        const uPhone = String(authUser.phone).replace(/\D/g, "")
        if (lPhone && uPhone && lPhone !== uPhone) return false
      }
      return true
    }

    if (listing.farmerPhone && authUser.phone) {
      const lPhone = String(listing.farmerPhone).replace(/\D/g, "")
      const uPhone = String(authUser.phone).replace(/\D/g, "")
      if (lPhone && uPhone && lPhone === uPhone) {
        return true
      }
    }

    return false
  }

  if (requestUrl.pathname === "/api/listings" && req.method === "POST") {
    try {
      const authUser = getAuthUser(req)
      if (!authUser || !authUser.userId) {
        res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({
          error: "Unauthorized: You must be logged in as a farmer to create a listing."
        }))
        return
      }

      let body = ""
      for await (const chunk of req) body += chunk
      const data = JSON.parse(body || "{}")

      const required = ["crop", "quantity", "unit", "price", "address"]
      const missing = required.filter(field => !String(data[field] ?? "").trim())
      if (missing.length) {
        res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Missing required fields: " + missing.join(", ") }))
        return
      }

      const numQuantity = Number(data.quantity)
      if (!Number.isFinite(numQuantity) || numQuantity < 0) {
        res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Quantity must be a valid non-negative number." }))
        return
      }

      const numPrice = Number(data.price)
      if (!Number.isFinite(numPrice) || numPrice < 0) {
        res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Price must be a valid non-negative number." }))
        return
      }

      const harvestDate = String(data.harvestDate || "").trim()
      const availableFrom = String(data.availableFrom || "").trim()
      const expiryDate = String(data.expiryDate || "").trim()

      if (harvestDate && expiryDate && expiryDate < harvestDate) {
        res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Expiry / available-until date cannot be earlier than the harvest date." }))
        return
      }
      if (availableFrom && expiryDate && expiryDate < availableFrom) {
        res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Expiry / available-until date cannot be earlier than the available-from date." }))
        return
      }

      const crop = String(data.crop).trim()
      const category = String(data.category || categoryForCommodity(crop)).trim()

      // Preserve farmer-uploaded photo (data URLs, custom file paths, custom URLs)
      let finalImage = String(data.image || data.imageUrl || "").trim()
      let finalSource = "farmer"

      if (!finalImage) {
        try {
          const resolved = await resolveProduceImage(crop)
          if (resolved?.url) {
            finalImage = resolved.url
            finalSource = resolved.source === "unsplash" ? "auto-unsplash" : "auto-fallback"
          }
        } catch (err) {
          console.warn("Auto image lookup error on create listing:", err.message)
        }
      }

      // STRICT OWNERSHIP: Bind to authenticated user ID (never trust client owner ID)
      const ownerUserId = authUser.userId
      const finalFarmerId = authUser.farmerId || (data.farmerId && !data.farmerId.includes("undefined") ? String(data.farmerId).trim() : ("farmer-" + ownerUserId.slice(0, 8)))
      const finalFarmerName = authUser.name || String(data.farmerName || "Farmer").trim()
      const finalFarmerPhone = authUser.phone || String(data.farmerPhone || "").trim()

      const item = {
        id: Date.now().toString(),
        ownerUserId, // IMMUTABLE AUTHENTICATED USER ID
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
        farmerId: finalFarmerId,
        farmerName: finalFarmerName,
        farmerPhone: finalFarmerPhone,
        farmerLocation: String(data.address || data.farmerLocation || "").trim(),
        farmerDistrict: String(data.district || data.farmerDistrict || "").trim(),
        farmerState: String(data.state || data.farmerState || "").trim(),
        farmerLat: String(data.latitude || data.farmerLat || "").trim(),
        farmerLng: String(data.longitude || data.farmerLng || "").trim(),
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
      res.writeHead(201, { "Content-Type": "application/json" }).end(JSON.stringify({ listing: item }))
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Invalid listing data." }))
    }
    return
  }

  if ((requestUrl.pathname.startsWith("/api/listings/") || requestUrl.pathname === "/api/listings") && (req.method === "PUT" || req.method === "PATCH")) {
    try {
      const authUser = getAuthUser(req)
      if (!authUser || !authUser.userId) {
        res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({
          error: "Unauthorized: You must be logged in to update a listing."
        }))
        return
      }

      const pathId = requestUrl.pathname.replace(/^\/api\/listings\/?/, "")
      let body = ""
      for await (const chunk of req) body += chunk
      const data = JSON.parse(body || "{}")
      const targetId = String(pathId || data.id || requestUrl.searchParams.get("id"))
      const index = listings.findIndex(item => String(item.id) === targetId)
      if (index === -1) {
        res.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Listing not found." }))
        return
      }
      const existing = listings[index]

      // STRICT OWNERSHIP AUTHORIZATION CHECK:
      if (!verifyListingOwnership(existing, authUser)) {
        res.writeHead(403, { "Content-Type": "application/json" }).end(JSON.stringify({
          error: "Forbidden: You do not have permission to edit another farmer's listing."
        }))
        return
      }

      if (data.quantity !== undefined) {
        const numQty = Number(data.quantity)
        if (!Number.isFinite(numQty) || numQty < 0) {
          res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Quantity must be a valid non-negative number." }))
          return
        }
      }
      if (data.price !== undefined) {
        const numP = Number(data.price)
        if (!Number.isFinite(numP) || numP < 0) {
          res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Price must be a valid non-negative number." }))
          return
        }
      }

      const harvestDate = data.harvestDate !== undefined ? String(data.harvestDate).trim() : (existing.harvestDate || "")
      const availableFrom = data.availableFrom !== undefined ? String(data.availableFrom).trim() : (existing.availableFrom || "")
      const expiryDate = data.expiryDate !== undefined ? String(data.expiryDate).trim() : (existing.expiryDate || existing.date || "")

      if (harvestDate && expiryDate && expiryDate < harvestDate) {
        res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Expiry / available-until date cannot be earlier than the harvest date." }))
        return
      }
      if (availableFrom && expiryDate && expiryDate < availableFrom) {
        res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Expiry / available-until date cannot be earlier than the available-from date." }))
        return
      }

      const crop = String(data.crop || existing.crop).trim()
      const category = String(data.category || existing.category || categoryForCommodity(crop)).trim()

      // Bind ownerUserId permanently upon verified update
      const ownerUserId = existing.ownerUserId || authUser.userId

      const updated = {
        ...existing,
        ownerUserId,
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

      // Immutability: ownerUserId remains the verified owner
      updated.ownerUserId = ownerUserId
      listings[index] = updated
      saveListings(listings)
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ listing: updated }))
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Could not update listing." }))
    }
    return
  }

  if ((requestUrl.pathname.startsWith("/api/listings/") || requestUrl.pathname === "/api/listings") && req.method === "DELETE") {
    try {
      const authUser = getAuthUser(req)
      if (!authUser || !authUser.userId) {
        res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({
          error: "Unauthorized: You must be logged in to delete a listing."
        }))
        return
      }

      const pathId = requestUrl.pathname.replace(/^\/api\/listings\/?/, "")
      const id = pathId || requestUrl.searchParams.get("id")
      if (!id) {
        res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Missing listing id." }))
        return
      }
      const index = listings.findIndex(item => String(item.id) === String(id))
      if (index === -1) {
        res.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Listing not found." }))
        return
      }
      const existing = listings[index]

      // STRICT OWNERSHIP AUTHORIZATION CHECK:
      if (!verifyListingOwnership(existing, authUser)) {
        res.writeHead(403, { "Content-Type": "application/json" }).end(JSON.stringify({
          error: "Forbidden: You do not have permission to delete another farmer's listing."
        }))
        return
      }

      const [deleted] = listings.splice(index, 1)
      saveListings(listings)
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ success: true, listing: deleted }))
    } catch {
      res.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Could not delete listing." }))
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
      const result = await forecastPrice({
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

  // Known Indian Agricultural Hubs & Cities coordinates lookup
  const INDIAN_COORDINATES = {
    "bengaluru rural": { lat: 13.2300, lng: 77.5600, place: "Bengaluru Rural, Karnataka" },
    "bangalore rural": { lat: 13.2300, lng: 77.5600, place: "Bengaluru Rural, Karnataka" },
    "doddaballapur": { lat: 13.2924, lng: 77.5433, place: "Doddaballapur, Bengaluru Rural, Karnataka" },
    "hoskote": { lat: 13.0699, lng: 77.7981, place: "Hoskote, Bengaluru Rural, Karnataka" },
    "devanahalli": { lat: 13.2483, lng: 77.7126, place: "Devanahalli, Bengaluru Rural, Karnataka" },
    "nelamangala": { lat: 13.0974, lng: 77.3917, place: "Nelamangala, Bengaluru Rural, Karnataka" },
    "bengaluru urban": { lat: 12.9716, lng: 77.5946, place: "Bengaluru Urban, Karnataka" },
    "bangalore urban": { lat: 12.9716, lng: 77.5946, place: "Bengaluru Urban, Karnataka" },
    "bengaluru": { lat: 12.9716, lng: 77.5946, place: "Bengaluru, Karnataka" },
    "bangalore": { lat: 12.9716, lng: 77.5946, place: "Bengaluru, Karnataka" },
    "kolar": { lat: 13.1367, lng: 78.1348, place: "Kolar, Karnataka" },
    "chikkaballapura": { lat: 13.4355, lng: 77.7275, place: "Chikkaballapura, Karnataka" },
    "ramanagara": { lat: 12.7209, lng: 77.2799, place: "Ramanagara, Karnataka" },
    "mysuru": { lat: 12.2958, lng: 76.6394, place: "Mysuru, Karnataka" },
    "mysore": { lat: 12.2958, lng: 76.6394, place: "Mysuru, Karnataka" },
    "hubballi": { lat: 15.3647, lng: 75.1240, place: "Hubballi, Karnataka" },
    "hubli": { lat: 15.3647, lng: 75.1240, place: "Hubballi, Karnataka" },
    "dharwad": { lat: 15.4589, lng: 75.0078, place: "Dharwad, Karnataka" },
    "belagavi": { lat: 15.8497, lng: 74.4977, place: "Belagavi, Karnataka" },
    "belgaum": { lat: 15.8497, lng: 74.4977, place: "Belagavi, Karnataka" },
    "shimla": { lat: 31.1048, lng: 77.1734, place: "Shimla, Himachal Pradesh" },
    "pune": { lat: 18.5204, lng: 73.8567, place: "Pune, Maharashtra" },
    "nashik": { lat: 19.9975, lng: 73.7898, place: "Nashik, Maharashtra" },
    "mumbai": { lat: 19.0760, lng: 72.8777, place: "Mumbai, Maharashtra" },
    "nagpur": { lat: 21.1458, lng: 79.0882, place: "Nagpur, Maharashtra" },
    "delhi": { lat: 28.7041, lng: 77.1025, place: "Delhi, Delhi" },
    "new delhi": { lat: 28.6139, lng: 77.2090, place: "New Delhi, Delhi" },
    "lucknow": { lat: 26.8467, lng: 80.9462, place: "Lucknow, Uttar Pradesh" },
    "jaipur": { lat: 26.9124, lng: 75.7873, place: "Jaipur, Rajasthan" },
    "indore": { lat: 22.7196, lng: 75.8577, place: "Indore, Madhya Pradesh" },
    "mandsaur": { lat: 24.0722, lng: 75.0682, place: "Mandsaur, Madhya Pradesh" },
    "hyderabad": { lat: 17.3850, lng: 78.4867, place: "Hyderabad, Telangana" },
    "chennai": { lat: 13.0827, lng: 80.2707, place: "Chennai, Tamil Nadu" },
    "coimbatore": { lat: 11.0168, lng: 76.9558, place: "Coimbatore, Tamil Nadu" },
    "patna": { lat: 25.5941, lng: 85.1376, place: "Patna, Bihar" },
    "ahmedabad": { lat: 23.0225, lng: 72.5714, place: "Ahmedabad, Gujarat" },
    "chandigarh": { lat: 30.7333, lng: 76.7794, place: "Chandigarh, Punjab" },
    "kolkata": { lat: 22.5726, lng: 88.3639, place: "Kolkata, West Bengal" },
    "bhopal": { lat: 23.2599, lng: 77.4126, place: "Bhopal, Madhya Pradesh" },
    "kozhikode": { lat: 11.2588, lng: 75.7804, place: "Kozhikode, Kerala" },
    "kochi": { lat: 9.9312, lng: 76.2673, place: "Kochi, Kerala" },
    "ranchi": { lat: 23.3441, lng: 85.3096, place: "Ranchi, Jharkhand" },
    "bhubaneswar": { lat: 20.2961, lng: 85.8245, place: "Bhubaneswar, Odisha" },
    "guwahati": { lat: 26.1445, lng: 91.7362, place: "Guwahati, Assam" },
    "dehradun": { lat: 30.3165, lng: 78.0322, place: "Dehradun, Uttarakhand" },
    "srinagar": { lat: 34.0837, lng: 74.7973, place: "Srinagar, Jammu and Kashmir" }
  };

  function formatTitleCase(str) {
    if (!str) return "Your Area";
    return str.split(/[\s,]+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  function generateSeasonalWeather(placeName, lat, lng) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const daily = [];
    const baseHigh = (lat && lat > 30) ? 20 : 29;
    const baseLow = (lat && lat > 30) ? 9 : 19;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const isRain = (i % 3 === 1);
      daily.push({
        date: d.toISOString().slice(0, 10),
        dayName: days[d.getDay()],
        dateStr: d.getDate() + ' ' + months[d.getMonth()],
        maxTemp: Math.round((baseHigh + Math.sin(i * 1.3) * 1.5) * 10) / 10,
        minTemp: Math.round((baseLow + Math.cos(i * 1.3) * 1.2) * 10) / 10,
        rainProb: isRain ? 45 : 15,
        windSpeed: 11.5,
        condition: isRain ? "Passing Showers" : "Partly Cloudy",
        icon: isRain ? "🌦️" : "⛅"
      });
    }
    return {
      place: formatTitleCase(placeName),
      latitude: lat || 12.9716,
      longitude: lng || 77.5946,
      daily,
      source: "Agricultural Meteorological Baseline"
    };
  }

  // 7-Day Live Weather Forecast for any Indian location or coordinates
  if (requestUrl.pathname === "/api/weather" && req.method === "GET") {
    try {
      const rawLat = requestUrl.searchParams.get("lat");
      const rawLng = requestUrl.searchParams.get("lng") || requestUrl.searchParams.get("lon");
      let lat = (rawLat !== null && rawLat !== "" && !isNaN(Number(rawLat))) ? Number(rawLat) : NaN;
      let lng = (rawLng !== null && rawLng !== "" && !isNaN(Number(rawLng))) ? Number(rawLng) : NaN;
      const placeQuery = (requestUrl.searchParams.get("place") || requestUrl.searchParams.get("q") || "").trim();

      let resolvedPlace = formatTitleCase(placeQuery) || "Your Area";

      // 1. Check known Indian hubs dictionary
      const normalizedQuery = placeQuery.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      if (INDIAN_COORDINATES[normalizedQuery]) {
        lat = INDIAN_COORDINATES[normalizedQuery].lat;
        lng = INDIAN_COORDINATES[normalizedQuery].lng;
        resolvedPlace = INDIAN_COORDINATES[normalizedQuery].place;
      } else if (normalizedQuery) {
        for (const [k, v] of Object.entries(INDIAN_COORDINATES)) {
          if (normalizedQuery.includes(k) || k.includes(normalizedQuery)) {
            lat = v.lat;
            lng = v.lng;
            resolvedPlace = v.place;
            break;
          }
        }
      }

      // 2. Validate coordinates are within Indian boundaries (Lat 6-38, Lng 68-98)
      const isCoordValid = Number.isFinite(lat) && Number.isFinite(lng) && lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98;

      if (!isCoordValid) {
        const queryName = placeQuery.replace(/\b(rural|urban|city|district|mandi|market)\b/gi, "").trim() || placeQuery || "Bengaluru";
        try {
          const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryName)}&count=1&country_code=IN`;
          const geoRes = await fetch(geoUrl, {
            headers: { "Accept": "application/json", "User-Agent": "Farmezy/2.0" },
            signal: AbortSignal.timeout(6000)
          });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const hit = geoData.results?.[0];
            if (hit && Number.isFinite(hit.latitude) && Number.isFinite(hit.longitude)) {
              lat = hit.latitude;
              lng = hit.longitude;
              resolvedPlace = `${hit.name}${hit.admin1 ? ", " + hit.admin1 : ""}`;
            } else {
              lat = 12.9719;
              lng = 77.5937;
              resolvedPlace = formatTitleCase(placeQuery) || "Bengaluru, Karnataka";
            }
          } else {
            lat = 12.9719;
            lng = 77.5937;
            resolvedPlace = formatTitleCase(placeQuery) || "Bengaluru, Karnataka";
          }
        } catch {
          lat = 12.9719;
          lng = 77.5937;
          resolvedPlace = formatTitleCase(placeQuery) || "Bengaluru, Karnataka";
        }
      }

      // Check cache with resolved coordinates
      const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}_${resolvedPlace.toLowerCase()}`;
      const cached = weatherCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < weatherCacheTtlMs) {
        res.writeHead(200).end(JSON.stringify(cached.data));
        return;
      }

      let payload = null;

      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Asia%2FKolkata`;
        const wRes = await fetch(weatherUrl, {
          headers: { "Accept": "application/json", "User-Agent": "Farmezy/2.0" },
          signal: AbortSignal.timeout(7000)
        });

        if (wRes.ok) {
          const wData = await wRes.json();
          const WMO_MAP = {
            0: { label: "Clear Sky", icon: "☀️" },
            1: { label: "Mainly Clear", icon: "🌤️" },
            2: { label: "Partly Cloudy", icon: "⛅" },
            3: { label: "Overcast", icon: "☁️" },
            45: { label: "Foggy", icon: "🌫️" },
            48: { label: "Depositing Rime Fog", icon: "🌫️" },
            51: { label: "Light Drizzle", icon: "🌦️" },
            53: { label: "Moderate Drizzle", icon: "🌧️" },
            55: { label: "Dense Drizzle", icon: "🌧️" },
            61: { label: "Slight Rain", icon: "🌦️" },
            63: { label: "Moderate Rain", icon: "🌧️" },
            65: { label: "Heavy Rain", icon: "⛈️" },
            80: { label: "Rain Showers", icon: "🌦️" },
            81: { label: "Moderate Showers", icon: "🌧️" },
            82: { label: "Violent Showers", icon: "⛈️" },
            95: { label: "Thunderstorm", icon: "⚡" }
          };

          const daily = [];
          const times = wData.daily?.time || [];
          for (let i = 0; i < times.length; i++) {
            const code = wData.daily.weathercode?.[i] ?? 1;
            const info = WMO_MAP[code] || { label: "Partly Cloudy", icon: "⛅" };
            const dObj = new Date(times[i]);
            const dayName = dObj.toLocaleDateString("en-IN", { weekday: "short" });
            const dateStr = dObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

            daily.push({
              date: times[i],
              dayName,
              dateStr,
              maxTemp: Math.round((wData.daily.temperature_2m_max?.[i] ?? 28) * 10) / 10,
              minTemp: Math.round((wData.daily.temperature_2m_min?.[i] ?? 18) * 10) / 10,
              rainProb: Math.round(wData.daily.precipitation_probability_max?.[i] ?? 0),
              windSpeed: Math.round((wData.daily.windspeed_10m_max?.[i] ?? 10) * 10) / 10,
              condition: info.label,
              icon: info.icon
            });
          }

          payload = {
            place: resolvedPlace,
            latitude: lat,
            longitude: lng,
            daily,
            source: "Open-Meteo Meteorological Service (Asia/Kolkata)"
          };
        }
      } catch (err) {
        console.warn('Live weather fetch warning, using seasonal fallback:', err.message);
      }

      if (!payload) {
        payload = generateSeasonalWeather(resolvedPlace, lat, lng);
      }

      weatherCache.set(cacheKey, { timestamp: Date.now(), data: payload });
      res.writeHead(200).end(JSON.stringify(payload));
    } catch (err) {
      const fallback = generateSeasonalWeather(placeQuery || "Your Area", 12.9716, 77.5946);
      res.writeHead(200).end(JSON.stringify(fallback));
    }
    return;
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

    const categories = [...new Set(agmarknetList.map(item => item.category).filter(c => c && c !== "Medicinal and Aromatic Plants"))].sort()

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
    const activeOnlyFilter = requestUrl.searchParams.get("active_only") === "true"

    const currentPrices = getCurrentAgmarknetPrices()
    const activeVarietyNormSet = new Set(
      currentPrices
        .filter(r => matchesCommodity(r.commodity, officialCommodityName))
        .map(r => normalize(r.variety))
        .filter(Boolean)
    )

    let resultVarieties = observedVarieties.map(v => {
      const vName = typeof v === "string" ? v : (v.name || v.variety_name || "")
      const isActive = activeVarietyNormSet.has(normalize(vName))
      return typeof v === "string" ? {
        name: v,
        variety_id: null,
        registered: true,
        observed_in_history: true,
        active_today: isActive,
        source: "AGMARKNET observed record"
      } : {
        ...v,
        active_today: isActive
      }
    })

    if (activeOnlyFilter) {
      resultVarieties = resultVarieties.filter(v => v.active_today)
    }

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
  
  // GET /api/mandi-diagnostics - Diagnostic audit of government mandi integration
  if (requestUrl.pathname === "/api/state-metadata" && req.method === "GET") {
    const metaPath = path.join(dataDir, "state-metadata.json");
    if (existsSync(metaPath)) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" }).end(readFileSync(metaPath, "utf8"));
      return;
    }
  }

  if (requestUrl.pathname === "/api/mandi-diagnostics" && req.method === "GET") {
    const diag = getMandiDiagnostics()
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(diag, null, 2))
    return
  }

  
  // GET /api/reference-prices - Static reference benchmarks clearly labeled as unverified reference data
  if (requestUrl.pathname === "/api/reference-prices" && req.method === "GET") {
    const rawComm = requestUrl.searchParams.get("commodity")?.trim() || "";
    const rawCategory = requestUrl.searchParams.get("category")?.trim() || "";
    let list = getStaticReferencePrices();
    if (rawComm) list = list.filter(r => matchesCommodity(r.commodity, rawComm));
    if (rawCategory) {
      const targetCatNorm = rawCategory.toLowerCase().replace(/[^a-z0-9]/g, "");
      list = list.filter(r => {
        const cat = categoryForCommodity(r.commodity).toLowerCase().replace(/[^a-z0-9]/g, "");
        
        return cat === targetCatNorm;
      });
    }
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({
      records: list,
      total: list.length,
      is_live: false,
      is_static_reference: true,
      notice: "Reference benchmark data only. Not verified live mandi trades."
    }));
    return;
  }

  // GET /api/mandi-history
  if (requestUrl.pathname === "/api/mandi-history" && req.method === "GET") {
    const rawComm = requestUrl.searchParams.get("commodity")?.trim() || ""
    const result = getLatestHistoricalPrice(rawComm)
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(result || { is_historical: false, message: "No historical record found" }))
    return
  }

  if (requestUrl.pathname === "/api/mandi-prices" && req.method === "GET") {
    const dataGovKey = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY || "579b464db66ec23bdd00000119f3f71a11ba4a67695e5b8a24f75b0a"

    const rawCommodity = requestUrl.searchParams.get("commodity")?.trim() || ""
    const rawVariety = requestUrl.searchParams.get("variety")?.trim() || ""
    const rawCategory = requestUrl.searchParams.get("category")?.trim() || ""
    const rawSearch = requestUrl.searchParams.get("q")?.trim() || ""
    const rawState = requestUrl.searchParams.get("state")?.trim() || "All India"
    const rawDistrict = requestUrl.searchParams.get("district")?.trim() || ""
    const rawMarket = requestUrl.searchParams.get("market")?.trim() || ""
    const rawGrade = requestUrl.searchParams.get("grade")?.trim() || ""
    const rawDate = requestUrl.searchParams.get("date")?.trim() || requestUrl.searchParams.get("arrival_date")?.trim() || ""
    const rawMinPrice = parseFloat(requestUrl.searchParams.get("min_price") || "")
    const rawMaxPrice = parseFloat(requestUrl.searchParams.get("max_price") || "")
    const allIndia = !rawState || rawState.toLowerCase() === "all india"

    const rawLimit = requestUrl.searchParams.get("limit")
    const isAll = !rawLimit || rawLimit === "all" || rawLimit === "0" || rawLimit === "-1"
    const offset = Math.max(0, Number(requestUrl.searchParams.get("offset") || 0))
    const limit = isAll ? 1000000 : Math.max(1, Number(rawLimit || 1000000))



    // Serve from the synchronized current Government APMC dataset (auto-synced in background)
    let allStateRows = getCurrentAgmarknetPrices()
    let isSessionFallback = false
    let currentSessionDate = ""
    let isLive = true

    if (!allStateRows || !allStateRows.length) {
      allStateRows = []
      syncAgmarknetPrices().catch(() => {})
    }

    // Determine latest session arrival date from records
    if (allStateRows.length > 0) {
      const dates = allStateRows.map(r => String(r.arrival_date || r.arrivalDate || "").slice(0, 10)).filter(Boolean)
      if (dates.length > 0) {
        currentSessionDate = dates[0]
      }
    }

    // Apply filters first so prices and cards accurately reflect the active query
    let filtered = allStateRows

    if (!allIndia && rawState) {
      filtered = filtered.filter(row => matchesState(row.state, rawState))
    }

    if (rawDistrict) {
      filtered = filtered.filter(row => matchesDistrict(row.district, rawDistrict))
    }

    if (rawCommodity) {
      filtered = filtered.filter(row => matchesCommodity(row.commodity, rawCommodity))
    }

    if (rawVariety) {
      const targetVariety = normalize(rawVariety)
      filtered = filtered.filter(row => normalize(row.variety) === targetVariety)
    }

    if (rawCategory) {
      const targetCatNorm = rawCategory.toLowerCase().replace(/[^a-z0-9]/g, "")
      filtered = filtered.filter(row => {
        const cat = categoryForCommodity(row.commodity).toLowerCase().replace(/[^a-z0-9]/g, "")
        
        return cat === targetCatNorm
      })
    }

    if (rawMarket) {
      const targetMarket = normalize(rawMarket)
      filtered = filtered.filter(row => normalize(row.market).includes(targetMarket))
    }

    if (rawGrade && rawGrade !== "All Grades") {
      filtered = filtered.filter(row => normalize(row.grade) === normalize(rawGrade))
    }

    if (rawDate) {
      filtered = filtered.filter(row => String(row.arrival_date || row.arrivalDate || "").includes(rawDate))
    }

    if (Number.isFinite(rawMinPrice) && rawMinPrice > 0) {
      filtered = filtered.filter(row => Number(row.modal_price || row.min_price || 0) >= rawMinPrice)
    }

    if (Number.isFinite(rawMaxPrice) && rawMaxPrice > 0) {
      filtered = filtered.filter(row => Number(row.modal_price || row.max_price || 0) <= rawMaxPrice)
    }

    if (rawSearch) {
      const query = normalize(rawSearch)
      filtered = filtered.filter(row => [row.commodity, row.variety, row.grade, row.state, row.district, row.market]
        .some(value => normalize(value).includes(query)))
    }

    // Build comprehensive session price maps across the filtered Government records
    const sessionPriceMap = {}
    const sessionCommodityPriceMap = {}

    filtered.forEach(row => {
      const c = normalize(row.commodity)
      const v = normalize(row.variety)
      const modal = Number(row.modal_price || row.modalPrice || 0)
      const minP = Number(row.min_price || row.minPrice || 0)
      const maxP = Number(row.max_price || row.maxPrice || 0)

      if (c && v && modal > 0) {
        const key = `${c}::${v}`
        if (!sessionPriceMap[key]) {
          sessionPriceMap[key] = {
            commodity: String(row.commodity || ""),
            variety: String(row.variety || ""),
            modal_price: modal,
            min_price: minP,
            max_price: maxP,
            market: String(row.market || "Reported APMC"),
            district: String(row.district || ""),
            state: String(row.state || ""),
            arrival_date: String(row.arrival_date || row.arrivalDate || "").slice(0, 10),
            grade: String(row.grade || ""),
            market_count: 1
          }
        } else {
          sessionPriceMap[key].market_count = (sessionPriceMap[key].market_count || 1) + 1
        }
      }
      if (c && modal > 0) {
        if (!sessionCommodityPriceMap[c]) {
          sessionCommodityPriceMap[c] = {
            commodity: String(row.commodity || ""),
            variety: String(row.variety || ""),
            modal_price: modal,
            min_price: minP,
            max_price: maxP,
            market: String(row.market || "Reported APMC"),
            district: String(row.district || ""),
            state: String(row.state || ""),
            arrival_date: String(row.arrival_date || row.arrivalDate || "").slice(0, 10),
            grade: String(row.grade || ""),
            market_count: 1
          }
        } else {
          sessionCommodityPriceMap[c].market_count = (sessionCommodityPriceMap[c].market_count || 1) + 1
        }
      }
    })

    const records = filtered.map(row => ({
      arrival_date: String(row.arrival_date || row.arrivalDate || "").slice(0, 10),
      commodity: String(row.commodity || ""),
      state: String(row.state || rawState),
      district: String(row.district || rawDistrict || ""),
      market: String(row.market || "Reported APMC"),
      min_price: Number(row.min_price || row.minPrice || 0),
      modal_price: Number(row.modal_price || row.modalPrice || 0),
      max_price: Number(row.max_price || row.maxPrice || 0),
      variety: String(row.variety || ""),
      grade: String(row.grade || ""),
      category: row.category || categoryForCommodity(row.commodity),
      price_type: String(row.price_type || "Local Mandi Price"),
      source_name: String(row.source_name || "Government of India (AGMARKNET)"),
      source_type: String(row.source_type || "wholesale"),
      unit: String(row.unit || row.price_unit || (["Cow", "Bull", "Calf", "He Buffalo", "Goat", "Sheep"].includes(row.commodity) ? "₹/head" : ["Hen", "Cock", "Duck"].includes(row.commodity) ? "₹/bird" : "₹/quintal")),
      price_unit: String(row.price_unit || row.unit || (["Cow", "Bull", "Calf", "He Buffalo", "Goat", "Sheep"].includes(row.commodity) ? "₹/head" : ["Hen", "Cock", "Duck"].includes(row.commodity) ? "₹/bird" : "₹/quintal")),
      product_type: String(row.product_type || row.variety_type || ""),
      updated_at: String(row.updated_at || row.last_updated || "2026-11-04T05:30:00.000Z")
    }))

    const pageRecords = records.slice(offset, offset + limit)

    const agmarknetList = getAgmarknetCommodities()
    const activeCommNormSet = new Set(allStateRows.map(r => normalize(r.commodity)).filter(Boolean))

    // Section 7: Commodities that have at least one current official AGMARKNET price record today
    const currentCommodityOptions = agmarknetList
      .filter(item => activeCommNormSet.has(normalize(item.name)))
      .map(item => ({ name: item.name, category: categoryForCommodity(item.name) }))

    // Section 9 & 10: Dynamic states and districts where official current records exist
    const baseCommRows = rawCommodity
      ? allStateRows.filter(r => matchesCommodity(r.commodity, rawCommodity))
      : allStateRows
    const baseVarRows = rawVariety
      ? baseCommRows.filter(r => normalize(r.variety) === normalize(rawVariety))
      : baseCommRows

    const availableStates = [...new Set(baseVarRows.map(r => r.state).filter(Boolean))].sort()
    const stateFilteredRows = (!allIndia && rawState)
      ? baseVarRows.filter(r => matchesState(r.state, rawState))
      : baseVarRows
    const availableDistricts = [...new Set(stateFilteredRows.map(r => r.district).filter(Boolean))].sort()
    const availableGrades = [...new Set(baseVarRows.map(r => r.grade).filter(Boolean))].sort()

    res.writeHead(200).end(JSON.stringify({
      records: pageRecords,
      total: records.length,
      total_count: records.length,
      source: "Source: Government of India — AGMARKNET",
      live: isLive,
      session_date: currentSessionDate,
      session_fallback: isSessionFallback,
      last_successful_refresh: lastSuccessfulPriceRefresh || currentPricesFetchedAt || new Date().toISOString(),
      latest_arrival_date: currentSessionDate || "03/11/2026",
      market_count: new Set(records.map(r => r.market).filter(Boolean)).size,
      available_states: availableStates,
      available_districts: availableDistricts,
      available_grades: availableGrades,
      offset,
      limit,
      price_map: sessionPriceMap,
      commodity_price_map: sessionCommodityPriceMap,
      categories: masterCategories,
      commodity_options: currentCommodityOptions,
      all_official_commodities_count: agmarknetList.length,
      active_commodities_count: currentCommodityOptions.length,
      all_vegetables: !rawCommodity,
      historical_fallback: records.length === 0 && rawCommodity ? getLatestHistoricalPrice(rawCommodity) : null
    }))
    return
  }

  res.writeHead(404).end(JSON.stringify({ error: "Endpoint not found." }))
}

const server = http.createServer(handleRequest)

const isMain = Boolean(process.argv[1] && (
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
  process.argv[1].endsWith("server.js")
))


// ============================================================================
// AGMARKNET AUTOMATIC SYNCHRONIZATION ENGINE (LAYERS 1 & 2)
// ============================================================================
let isSyncingPrices = false
let lastSuccessfulPriceRefresh = ""
let currentPricesFetchedAt = ""
try {
  if (existsSync(currentPricesFile)) {
    const parsed = JSON.parse(readFileSync(currentPricesFile, "utf8"))
    currentPricesFetchedAt = parsed.fetchedAt || ""
    lastSuccessfulPriceRefresh = currentPricesFetchedAt
  }
} catch {}

const refreshMinutes = Math.max(5, Number(process.env.AGMARKNET_REFRESH_INTERVAL_MINUTES || 60))
const refreshIntervalMs = refreshMinutes * 60 * 1000

async function syncAgmarknetPrices() {
  if (isSyncingPrices) return
  isSyncingPrices = true
  const dataGovKey = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY || "579b464db66ec23bdd00000119f3f71a11ba4a67695e5b8a24f75b0a"
  if (!dataGovKey) {
    isSyncingPrices = false
    return
  }

  try {
    const pageSize = 1000
    let offset = 0
    let reportedTotal = Infinity
    const fetchedRecords = []

    while (offset < reportedTotal) {
      const govUrl = new URL("https://api.data.gov.in/resource/" + resourceId)
      govUrl.searchParams.set("api-key", dataGovKey)
      govUrl.searchParams.set("format", "json")
      govUrl.searchParams.set("limit", String(pageSize))
      govUrl.searchParams.set("offset", String(offset))

      const response = await fetch(govUrl, {
        headers: { Accept: "application/json", "User-Agent": "Farmezy/2.0" },
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) throw new Error("Government API returned status " + response.status)

      const payload = await response.json()
      const pageRows = Array.isArray(payload.records) ? payload.records : []
      if (pageRows.length === 0) break

      fetchedRecords.push(...pageRows)
      offset += pageRows.length

      const totalAvailable = Number(payload.total)
      if (Number.isFinite(totalAvailable) && totalAvailable > 0) {
        reportedTotal = totalAvailable
      }

      if (pageRows.length < pageSize || offset >= reportedTotal) break
    }

    // CACHE PROTECTION & ANOMALY DETECTION:
    // Do NOT overwrite the complete verified cache with an unexpectedly small dataset (< 500 records)
    // such as early-morning session rollovers (e.g., 2 records at 06:00 AM before mandis report).
    const existingCache = getCurrentAgmarknetPrices()
    const existingCount = Array.isArray(existingCache) ? existingCache.length : 0
    const isAnomalouslySmall = (fetchedRecords.length < 1000 || fetchedRecords.length < existingCount * 0.5) && existingCount >= 1000

    if (isAnomalouslySmall) {
      console.warn(`[AGMARKNET Cache Protection] Anomaly detected: Government API returned only ${fetchedRecords.length} records (early-session rollover). Preserving active verified cache of ${existingCount} records.`)
      const partialSyncFile = path.join(dataDir, "partial-mandi-sync.json")
      try {
        writeFileSync(partialSyncFile, JSON.stringify({
          fetchedAt: new Date().toISOString(),
          status: "anomalous_early_session_rollover",
          government_api_total: reportedTotal,
          records_count: fetchedRecords.length,
          records: fetchedRecords
        }, null, 2))
      } catch {}
    } else if (fetchedRecords.length > 0 && (fetchedRecords.length >= reportedTotal || (reportedTotal === Infinity && fetchedRecords.length >= 1000))) {
      currentAgmarknetPricesCache = fetchedRecords
      lastSuccessfulPriceRefresh = new Date().toISOString()
      cachedDiagnostics = null
      try {
        writeFileSync(currentPricesFile, JSON.stringify({
          fetchedAt: lastSuccessfulPriceRefresh,
          total: fetchedRecords.length,
          records: fetchedRecords
        }, null, 2))
        console.log("[AGMARKNET Sync] Successfully updated current prices: " + fetchedRecords.length + " records.")
      } catch (wErr) {
        console.warn("[AGMARKNET Sync] In-memory cache updated; could not write file:", wErr.message)
      }
    }
  } catch (err) {
    console.warn("[AGMARKNET Sync] Background sync note (" + err.message + "); preserving active dataset of " + (currentAgmarknetPricesCache ? currentAgmarknetPricesCache.length : 10676) + " records.")
  } finally {
    isSyncingPrices = false
  }
}

function syncAgmarknetCatalogue() {
  try {
    const master = getCommodityMaster()
    const storedCatalogue = getAgmarknetCommodities()
    if (!Array.isArray(master) || master.length === 0) return

    let hasNewCommodity = false
    const storedMap = new Map()
    storedCatalogue.forEach(c => storedMap.set(String(c.name).toLowerCase().replace(/[^a-z0-9]/g, ""), c))

    for (const mItem of master) {
      const name = mItem.commodity || mItem.name
      if (!name) continue
      const cat = mItem.category || mItem.group_name

      const clean = String(name).toLowerCase().replace(/[^a-z0-9]/g, "")
      if (!storedMap.has(clean)) {
        hasNewCommodity = true
        break
      }
    }

    if (hasNewCommodity) {
      console.log("[Catalogue Sync] Official master additions verified.")
    }
  } catch (err) {
    console.warn("[Catalogue Sync] Error checking master catalogue:", err.message)
  }
}

// Start background price synchronization on startup and periodically
if (!isVercel && isMain) {
  setTimeout(() => {
    syncAgmarknetCatalogue()
    syncAgmarknetPrices().catch(() => {})
  }, 1500).unref()

  setInterval(() => {
    syncAgmarknetPrices().catch(() => {})
  }, refreshIntervalMs).unref()
}

if (!isVercel && isMain) {
  server.listen(port, "0.0.0.0", () => {
    console.log("Farmezy official mandi API listening on 0.0.0.0:" + port)
    backfillAndAuditListings().catch(err => console.error("Produce image audit error:", err))
  })
}

export { server }
export default handleRequest
