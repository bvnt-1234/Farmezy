import http from "node:http"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const port = Number(process.env.API_PORT || 3001)
const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"
const cache = new Map()
const ttlMs = 5 * 60 * 1000
const imageCache = new Map()
const imageTtlMs = 24 * 60 * 60 * 1000
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data")
const listingsFile = path.join(dataDir, "listings.json")
const ordersFile = path.join(dataDir, "orders.json")

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

try {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env")
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
  }
} catch {}

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  res.setHeader("Cache-Control", "no-store")
  const requestUrl = new URL(req.url, "http://localhost")

  if (requestUrl.pathname === "/api/listings" && req.method === "GET") {
    const safeListings = listings.map(listing => {
      if (listing.farmerPhone) return listing
      const digits = String(listing.farmerId || "").replace(/\D/g, "")
      return digits.length === 10 ? { ...listing, farmerPhone: digits } : listing
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

  if (req.method !== "GET") {
    res.writeHead(405).end(JSON.stringify({ error: "Method not allowed." }))
    return
  }

  if (requestUrl.pathname === "/api/crop-images") {
    const crops = [...new Set((requestUrl.searchParams.get("crops") || "").split(",").map(value => value.trim()).filter(Boolean))].slice(0, 6)
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
        const search = new URL("https://en.wikipedia.org/w/api.php")
        search.search = new URLSearchParams({
          action: "query",
          format: "json",
          generator: "search",
          gsrsearch: crop,
          gsrnamespace: "0",
          gsrlimit: "1",
          prop: "pageimages",
          piprop: "thumbnail",
          pithumbsize: "640",
          origin: "*",
        }).toString()
        const response = await fetch(search, { signal: AbortSignal.timeout(10000) })
        if (!response.ok) return
        const data = await response.json()
        const page = Object.values(data.query?.pages || {})[0]
        if (!page?.thumbnail?.source) return
        const image = {
          url: page.thumbnail.source,
          alt: page.title || crop,
          photographer: "Wikimedia",
          link: "https://en.wikipedia.org/wiki/" + encodeURIComponent(page.title || crop),
        }
        imageCache.set(crop.toLowerCase(), { data: image, savedAt: Date.now() })
        images[crop] = image
      }))
      res.writeHead(200).end(JSON.stringify({ images }))
    } catch {
      res.writeHead(502).end(JSON.stringify({ error: "Could not load crop images." }))
    }
    return
  }

  if (requestUrl.pathname === "/api/price-history" && req.method === "GET") {
    const commodityName = (requestUrl.searchParams.get("commodity") || "").trim()
    const stateName = (requestUrl.searchParams.get("state") || "").trim()
    const months = Math.min(12, Math.max(3, Number(requestUrl.searchParams.get("months") || 6)))
    if (!commodityName) {
      res.writeHead(400).end(JSON.stringify({ error: "Add a commodity name." }))
      return
    }

    const agmarkHeaders = {
      Accept: "application/json, text/plain, */*",
      Origin: "https://agmarknet.gov.in",
      Referer: "https://agmarknet.gov.in/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/142.0.0.0 Safari/537.36",
    }
    const agmarkFetch = async (path, params = {}) => {
      const url = new URL("https://api.agmarknet.gov.in/v1" + path)
      for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value))
      const response = await fetch(url, { headers: agmarkHeaders, signal: AbortSignal.timeout(20000) })
      const text = await response.text()
      let data
      try { data = JSON.parse(text) } catch { throw new Error("Agmarknet returned a non-JSON response.") }
      if (!response.ok) throw new Error("Agmarknet returned HTTP " + response.status + ".")
      return data
    }
    const findId = (value, wanted, kind) => {
      const target = String(wanted).trim().toLowerCase()
      if (!value || typeof value !== "object") return null
      if (Array.isArray(value)) {
        for (const item of value) {
          const found = findId(item, wanted, kind)
          if (found !== null) return found
        }
        return null
      }
      const nameKeys = kind === "state"
        ? ["name", "stateName", "state_name", "label"]
        : ["name", "commodityName", "commodity_name", "commodity", "label"]
      const idKeys = kind === "state"
        ? ["id", "stateId", "state_id", "value"]
        : ["id", "commodityId", "commodity_id", "value"]
      const name = nameKeys.map(key => value[key]).find(item => typeof item === "string")
      if (name && name.trim().toLowerCase() === target) {
        const id = idKeys.map(key => value[key]).find(item => item !== undefined && item !== null && String(item) !== "")
        if (id !== undefined) return id
      }
      for (const child of Object.values(value)) {
        const found = findId(child, wanted, kind)
        if (found !== null) return found
      }
      return null
    }

    try {
      const stateData = await agmarkFetch("/location/state", { page: 1 })
      const commodityData = await agmarkFetch("/commodities", { page_size: 500 })
      const stateId = stateName ? findId(stateData, stateName, "state") : null
      const commodityId = findId(commodityData, commodityName, "commodity")
      if (!commodityId) {
        res.writeHead(404).end(JSON.stringify({ error: "Agmarknet could not find the commodity '" + commodityName + "'." }))
        return
      }
      if (stateName && !stateId) {
        res.writeHead(404).end(JSON.stringify({ error: "Agmarknet could not find the state '" + stateName + "'." }))
        return
      }

      const points = []
      const today = new Date()
      for (let offset = months - 1; offset >= 0; offset--) {
        const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - offset, 1))
        const year = date.getUTCFullYear()
        const month = date.getUTCMonth() + 1
        const data = await agmarkFetch("/prices-and-arrivals/date-wise/specific-commodity", {
          year,
          month,
          stateId: stateId || 1,
          commodityId,
          includeExcel: false,
        })
        const markets = Array.isArray(data?.markets) ? data.markets : []
        for (const market of markets) {
          const dates = Array.isArray(market?.dates) ? market.dates : []
          for (const day of dates) {
            const prices = Array.isArray(day?.data) ? day.data
              .map(item => Number(item?.modalPrice))
              .filter(value => Number.isFinite(value) && value > 0) : []
            if (!prices.length) continue
            points.push({
              date: String(day.arrivalDate || "").trim(),
              price: prices.reduce((sum, value) => sum + value, 0) / prices.length,
            })
          }
        }
      }

      const byDate = new Map()
      for (const point of points) {
        if (!point.date) continue
        const current = byDate.get(point.date) || []
        current.push(point.price)
        byDate.set(point.date, current)
      }
      const history = [...byDate.entries()].map(([date, values]) => ({
        date,
        price: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
      })).sort((a, b) => {
        const parse = value => {
          const [day, month, year] = value.split("/").map(Number)
          return new Date(year, month - 1, day).getTime()
        }
        return parse(a.date) - parse(b.date)
      })

      if (history.length < 5) {
        res.writeHead(502).end(JSON.stringify({ error: "Agmarknet returned too little historical data to build a forecast." }))
        return
      }

      const n = history.length
      const meanX = (n - 1) / 2
      const meanY = history.reduce((sum, item) => sum + item.price, 0) / n
      let numerator = 0
      let denominator = 0
      history.forEach((item, index) => {
        numerator += (index - meanX) * (item.price - meanY)
        denominator += (index - meanX) ** 2
      })
      const slope = denominator ? numerator / denominator : 0
      const intercept = meanY - slope * meanX
      const forecast = Array.from({ length: 7 }, (_, index) => {
        const x = n + index
        const lastDate = new Date()
        lastDate.setDate(lastDate.getDate() + index + 1)
        return {
          date: lastDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          price: Number(Math.max(0, intercept + slope * x).toFixed(2)),
        }
      })

      res.writeHead(200).end(JSON.stringify({
        commodity: commodityName,
        state: stateName || "India-wide",
        history: history.slice(-60),
        forecast,
        model: "Linear regression trend baseline",
        unit: "₹/quintal",
        source: "Agmarknet 2.0 API",
        note: "Forecast is a baseline trend estimate from recent reported modal prices, not a guaranteed market price.",
      }))
    } catch (error) {
      res.writeHead(502).end(JSON.stringify({ error: error.message || "Could not load historical Agmarknet prices." }))
    }
    return
  }

  if (requestUrl.pathname !== "/api/mandi-prices") {
    res.writeHead(404).end(JSON.stringify({ error: "Endpoint not found." }))
    return
  }
  const apiKey = process.env.DATA_GOV_API_KEY
  if (!apiKey) {
    res.writeHead(503).end(JSON.stringify({ error: "Official price feed is not configured. Add DATA_GOV_API_KEY to backend/.env." }))
    return
  }

  const limit = Math.min(1000, Math.max(1, Number(requestUrl.searchParams.get("limit") || 100)))
  const offset = Math.max(0, Number(requestUrl.searchParams.get("offset") || 0))
  const filters = ["state", "district", "market", "commodity"].filter(k => requestUrl.searchParams.get(k)?.trim())
  const query = new URLSearchParams({ "api-key": apiKey, format: "json", limit: String(limit), offset: String(offset) })
  for (const field of filters) query.set("filters[" + field + "]", requestUrl.searchParams.get(field).trim())
  const cacheKey = query.toString().replace(apiKey, "private-key")
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.savedAt < ttlMs) {
    res.writeHead(200).end(JSON.stringify({ ...cached.data, source: "AGMARKNET via data.gov.in", cached: true }))
    return
  }

  try {
    const response = await fetch("https://api.data.gov.in/resource/" + resourceId + "?" + query, { signal: AbortSignal.timeout(15000) })
    const text = await response.text()
    let payload
    try { payload = JSON.parse(text) } catch { throw new Error("Government API returned a non-JSON response.") }
    if (!response.ok) {
      const message = payload?.message || payload?.error || ("Government API returned HTTP " + response.status + ".")
      res.writeHead(response.status === 429 ? 429 : 502).end(JSON.stringify({ error: String(message) }))
      return
    }
    if (!Array.isArray(payload.records)) throw new Error(payload?.message || "The official API response did not include records.")
    cache.set(cacheKey, { data: payload, savedAt: Date.now() })
    res.writeHead(200).end(JSON.stringify({ ...payload, source: "AGMARKNET via data.gov.in", cached: false }))
  } catch (error) {
    res.writeHead(502).end(JSON.stringify({ error: error.message || "Could not reach the official market-price service." }))
  }
})

server.listen(port, () => console.log("Farmezy official mandi API listening on http://localhost:" + port))
