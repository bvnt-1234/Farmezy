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
    res.writeHead(200).end(JSON.stringify({ listings }))
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
        farmerLocation: String(data.farmerLocation || "").trim(),
        farmerDistrict: String(data.farmerDistrict || "").trim(),
        farmerState: String(data.farmerState || "").trim(),
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
