import http from "node:http"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { spawn } from "node:child_process"
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

function startHistoricalCollector() {
  if (!(process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY)) return
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "scripts", "collect-mandi-history.js")
  const run = () => {
    const child = spawn(process.execPath, [script], { stdio: "inherit" })
    child.on("error", error => console.error("Historical mandi collector:", error.message))
    child.on("exit", code => console.log("Historical mandi collector finished with code", code))
  }
  if (!existsSync(path.join(dataDir, "mandi-history.json"))) run()
  // Automatically refresh the official history once per day.
  setInterval(run, 24 * 60 * 60 * 1000).unref()
}

startHistoricalCollector()

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  res.setHeader("Cache-Control", "no-store")
  const requestUrl = new URL(req.url, "http://localhost")

  if (requestUrl.pathname === "/api/listings" && req.method === "GET") {
    const safeListings = listings.map(listing => {
      if (listing.farmerPhone) return listing
      const existingContactPhone = listing.contact?.phone || listing.contact?.whatsapp || ""
      const contactDigits = String(existingContactPhone).replace(/\D/g, "")
      if (contactDigits.length === 10) return { ...listing, farmerPhone: contactDigits }
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

  if (requestUrl.pathname === "/api/mandi-health" && req.method === "GET") {
    const key = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY || ""
    if (!key) {
      res.writeHead(503).end(JSON.stringify({ ok: false, keyLoaded: false, error: "DATA_GOV key is not loaded." }))
      return
    }
    try {
      const healthUrl = new URL("https://api.data.gov.in/resource/" + resourceId)
      healthUrl.searchParams.set("api-key", key)
      healthUrl.searchParams.set("format", "json")
      healthUrl.searchParams.set("limit", "1")
      const response = await fetch(healthUrl, {
        headers: { Accept: "application/json", "User-Agent": "Farmezy/1.0" },
        signal: AbortSignal.timeout(15000)
      })
      const raw = await response.text()
      const contentType = response.headers.get("content-type") || ""
      let payload = null
      try { payload = raw ? JSON.parse(raw) : null } catch {}
      res.writeHead(200).end(JSON.stringify({
        ok: response.ok && !!payload,
        keyLoaded: true,
        keyLength: key.length,
        httpStatus: response.status,
        contentType,
        json: !!payload,
        recordCount: Array.isArray(payload?.records) ? payload.records.length : 0,
        message: payload?.message || payload?.error?.message || (!payload ? raw.replace(/\s+/g, " ").slice(0, 220) : "")
      }))
    } catch (error) {
      res.writeHead(502).end(JSON.stringify({ ok: false, keyLoaded: true, keyLength: key.length, error: error?.message || "Government API check failed." }))
    }
    return
  }

  if (requestUrl.pathname !== "/api/mandi-prices") {
    res.writeHead(404).end(JSON.stringify({ error: "Endpoint not found." }))
    return
  }

  const dataGovKey = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY
  const apiKey = process.env.CEDA_API_KEY

  const commodity = requestUrl.searchParams.get("commodity")?.trim() || ""
  const state = requestUrl.searchParams.get("state")?.trim() || ""
  const district = requestUrl.searchParams.get("district")?.trim() || ""
  const market = requestUrl.searchParams.get("market")?.trim() || ""

  const normalizedState = state
  const normalizedDistrict = district
  const normalizedCommodity = commodity
  const limit = Math.min(100, Math.max(1, Number(requestUrl.searchParams.get("limit") || 100)))
  const offset = Math.max(0, Number(requestUrl.searchParams.get("offset") || 0))

  if (!commodity) {
    res.writeHead(400).end(JSON.stringify({
      error: "Choose a crop / commodity first. CEDA requires a commodity for price queries."
    }))
    return
  }

  if (!state) {
    res.writeHead(400).end(JSON.stringify({
      error: "Choose a state first. A state is required for official price queries."
    }))
    return
  }

  // Primary live source: Agmarknet 2.0 public backend.
  async function agmarknetRequest(method, endpoint, params = {}) {
    const url = new URL("https://api.agmarknet.gov.in/v1" + endpoint)
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)))
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json, text/plain, */*",
        Origin: "https://agmarknet.gov.in",
        Referer: "https://agmarknet.gov.in/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/142.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(5000)
    })
    const raw = await response.text()
    let payload = null
    try { payload = raw ? JSON.parse(raw) : null } catch {}
    if (!response.ok) throw new Error("Agmarknet HTTP " + response.status + ": " + raw.replace(/\s+/g, " ").slice(0, 220))
    if (!payload) throw new Error("Agmarknet returned a non-JSON response.")
    return payload
  }

  function findArrays(value, output = []) {
    if (!value || typeof value !== "object") return output
    if (Array.isArray(value)) output.push(value)
    else Object.values(value).forEach(item => findArrays(item, output))
    return output
  }

  function findIdByName(payload, wanted, nameKeys, idKeys) {
    const target = String(wanted).trim().toLowerCase()
    for (const list of findArrays(payload)) for (const item of list) {
      if (!item || typeof item !== "object") continue
      const name = nameKeys.map(key => item[key]).find(value => value !== undefined && value !== null)
      if (String(name || "").trim().toLowerCase() === target) {
        const id = idKeys.map(key => item[key]).find(value => value !== undefined && value !== null)
        if (id !== undefined) return id
      }
    }
    return null
  }

  function extractPriceRows(payload) {
    const rows = []
    for (const list of findArrays(payload)) for (const item of list) {
      if (!item || typeof item !== "object") continue
      const modal = item.modal_price ?? item.modalPrice ?? item.modal ?? item.modal_rate
      if (modal !== undefined || item.min_price !== undefined || item.minPrice !== undefined) rows.push(item)
    }
    return rows
  }

  async function fetchAgmarknetPrices() {
    const filtersPayload = await agmarknetRequest("GET", "/daily-price-arrival/filters")
    const stateId = findIdByName(filtersPayload, state, ["state_name","stateName","name","state"], ["state_id","stateId","id"])
    const commodityId = findIdByName(filtersPayload, commodity, ["commodity_name","commodityName","name","commodity"], ["commodity_id","commodityId","id"])
    if (stateId === null || commodityId === null) throw new Error("Agmarknet could not map state/commodity.")

    const base = new Date()
    let rows = []
    for (let i = 0; i < 5 && !rows.length; i++) {
      const date = new Date(base)
      date.setDate(base.getDate() - i)
      const payload = await agmarknetRequest("GET", "/prices-and-arrivals/commodity-wise/daily-report-state", {
        date: date.toISOString().slice(0, 10),
        stateIds: stateId,
        includeExcel: "false"
      })
      rows = extractPriceRows(payload)
    }

    const wantedCommodity = commodity.toLowerCase()
    const wantedDistrict = district.toLowerCase().replace("banglore", "bangalore")
    const wantedMarket = market.toLowerCase()

    const records = rows.map(row => ({
      arrival_date: String(row.date ?? row.arrival_date ?? row.arrivalDate ?? "").slice(0, 10),
      commodity: String(row.commodity ?? row.commodity_name ?? row.commodityName ?? commodity),
      state: String(row.state ?? row.state_name ?? row.stateName ?? state),
      district: String(row.district ?? row.district_name ?? row.districtName ?? ""),
      market: String(row.market ?? row.market_name ?? row.marketName ?? ""),
      min_price: row.min_price ?? row.minPrice ?? row.minimum_price ?? "",
      modal_price: row.modal_price ?? row.modalPrice ?? row.modal ?? row.modal_rate ?? "",
      max_price: row.max_price ?? row.maxPrice ?? row.maximum_price ?? "",
      variety: String(row.variety ?? row.variety_name ?? ""),
      grade: String(row.grade ?? "")
    })).filter(row => row.commodity.toLowerCase().includes(wantedCommodity))
      .filter(row => !wantedDistrict || row.district.toLowerCase().includes(wantedDistrict))
      .filter(row => !wantedMarket || row.market.toLowerCase().includes(wantedMarket))

    return {
      records: records.slice(offset, offset + limit),
      total: records.length,
      total_count: records.length,
      source: "AGMARKNET 2.0 · Government of India",
      live: true,
      cached: false
    }
  }

  try {
    const agmarknetData = await fetchAgmarknetPrices()
    res.writeHead(200).end(JSON.stringify(agmarknetData))
    return
  } catch (error) {
    console.warn("Agmarknet live source failed:", error.message)
  }

  // If live providers are unavailable, use the locally collected official history.
  // This is explicitly marked as cached and never presented as live.
  try {
    const historyFile = path.join(dataDir, "mandi-history.json")
    if (existsSync(historyFile)) {
      const history = JSON.parse(readFileSync(historyFile, "utf8"))
      const historyRows = Array.isArray(history.rows) ? history.rows : []
      const wantedCommodity = commodity.toLowerCase()
      const wantedState = state.toLowerCase()
      const wantedDistrict = district.toLowerCase().replace("banglore", "bangalore")
      let localRows = historyRows.filter(row =>
        String(row.commodity || "").toLowerCase() === wantedCommodity &&
        String(row.state || "").toLowerCase() === wantedState
      )
      if (wantedDistrict) {
        const districtRows = localRows.filter(row =>
          String(row.district || "").toLowerCase().replace("banglore", "bangalore").includes(wantedDistrict)
        )
        if (districtRows.length) localRows = districtRows
      }
      localRows.sort((a, b) => String(b.arrival_date || "").localeCompare(String(a.arrival_date || "")))
      if (localRows.length) {
        const page = localRows.slice(offset, offset + limit)
        res.writeHead(200).end(JSON.stringify({
          records: page,
          total: localRows.length,
          total_count: localRows.length,
          source: "Farmezy official historical cache",
          live: false,
          cached: true
        }))
        return
      }
    }
  } catch (error) {
    console.warn("Historical price cache failed:", error.message)
  }

  // Prefer the Government of India's live data.gov.in feed.
  // CEDA remains a fallback for installations that only have a CEDA key.
  if (dataGovKey) {
    try {
      const govUrl = new URL("https://api.data.gov.in/resource/" + resourceId)
      govUrl.searchParams.set("api-key", dataGovKey)
      govUrl.searchParams.set("format", "json")
      govUrl.searchParams.set("limit", String(Math.min(1000, limit)))
      govUrl.searchParams.set("offset", String(offset))
      govUrl.searchParams.set("sort[arrival_date]", "desc")
      govUrl.searchParams.set("filters[state.keyword]", normalizedState)
      govUrl.searchParams.set("filters[commodity]", normalizedCommodity)
      if (normalizedDistrict) govUrl.searchParams.set("filters[district]", normalizedDistrict)
      if (market) govUrl.searchParams.set("filters[market]", market)

      const govResponse = await fetch(govUrl, {
        headers: { Accept: "application/json", "User-Agent": "Farmezy/1.0" },
        signal: AbortSignal.timeout(20000)
      })
      const raw = await govResponse.text()
      let govPayload = {}
      try { govPayload = raw ? JSON.parse(raw) : {} } catch {
        const contentType = govResponse.headers.get("content-type") || "unknown content-type"
        const preview = raw.replace(/\s+/g, " ").slice(0, 180)
        throw new Error(
          "Government price API returned a non-JSON response (HTTP " +
          govResponse.status + ", " + contentType + "). Response: " + preview
        )
      }

      if (!govResponse.ok) {
        throw new Error(
          govPayload?.error?.message ||
          govPayload?.message ||
          "Government price API returned HTTP " + govResponse.status + "."
        )
      }

      const govRows = Array.isArray(govPayload.records) ? govPayload.records : []
      govRows.sort((a,b) => String(b.arrival_date || "").localeCompare(String(a.arrival_date || "")))

      const govData = {
        records: govRows.map(row => ({
          arrival_date: String(row.arrival_date || ""),
          commodity: row.commodity || commodity,
          state: row.state || state,
          district: row.district || "",
          market: row.market || "",
          min_price: row.min_price,
          modal_price: row.modal_price,
          max_price: row.max_price,
          variety: row.variety || "",
          grade: row.grade || ""
        })),
        total: Number(govPayload.total ?? govPayload.count ?? govRows.length),
        total_count: Number(govPayload.total ?? govPayload.count ?? govRows.length),
        source: "AGMARKNET via Government of India data.gov.in",
        live: true,
        cached: false
      }

      // If a user typed a non-standard district such as "banglore"/"bengaluru"
      // and it produced no rows, retry at state + commodity level.
      if (!govData.records.length && district) {
        const stateUrl = new URL(govUrl)
        stateUrl.searchParams.delete("filters[district]")
        const stateResponse = await fetch(stateUrl, {
          headers: { Accept: "application/json", "User-Agent": "Farmezy/1.0" },
          signal: AbortSignal.timeout(20000)
        })
        const stateRaw = await stateResponse.text()
        let statePayload = {}
        try { statePayload = stateRaw ? JSON.parse(stateRaw) : {} } catch {}
        if (stateResponse.ok && Array.isArray(statePayload.records)) {
          const stateRows = statePayload.records.sort((a,b) =>
            String(b.arrival_date || "").localeCompare(String(a.arrival_date || ""))
          )
          govData.records = stateRows.map(row => ({
            arrival_date: String(row.arrival_date || ""),
            commodity: row.commodity || commodity,
            state: row.state || state,
            district: row.district || "",
            market: row.market || "",
            min_price: row.min_price,
            modal_price: row.modal_price,
            max_price: row.max_price,
            variety: row.variety || "",
            grade: row.grade || ""
          }))
          govData.total = Number(statePayload.total ?? statePayload.count ?? govData.records.length)
          govData.total_count = govData.total
          govData.district_fallback = true
        }
      }

      res.writeHead(200).end(JSON.stringify(govData))
      return
    } catch (error) {
      console.warn("Government live price source failed:", error.message)

      // Do not block Farmezy just because the Government gateway is returning
      // an HTML error page. Try the local official history before failing.
      try {
        const historyFile = path.join(dataDir, "mandi-history.json")
        if (existsSync(historyFile)) {
          const history = JSON.parse(readFileSync(historyFile, "utf8"))
          const historyRows = Array.isArray(history.rows) ? history.rows : []
          const wantedCommodity = commodity.toLowerCase()
          const wantedState = state.toLowerCase()
          const wantedDistrict = district.toLowerCase().replace("banglore", "bangalore")
          let localRows = historyRows.filter(row =>
            String(row.commodity || "").toLowerCase() === wantedCommodity &&
            String(row.state || "").toLowerCase() === wantedState
          )
          if (wantedDistrict) {
            const districtRows = localRows.filter(row =>
              String(row.district || "").toLowerCase().replace("banglore", "bangalore").includes(wantedDistrict)
            )
            if (districtRows.length) localRows = districtRows
          }
          localRows.sort((a,b) => String(b.arrival_date || "").localeCompare(String(a.arrival_date || "")))
          const page = localRows.slice(offset, offset + limit)
          if (page.length) {
            res.writeHead(200).end(JSON.stringify({
              records: page,
              total: localRows.length,
              total_count: localRows.length,
              source: "Farmezy official historical cache",
              live: false,
              cached: true
            }))
            return
          }
        }
      } catch (cacheError) {
        console.warn("Historical fallback failed:", cacheError.message)
      }

      // No fake/sample prices. Return a clean no-data response instead of
      // exposing the broken HTML response from data.gov.in.
      res.writeHead(200).end(JSON.stringify({
        records: [],
        total: 0,
        total_count: 0,
        source: "Government live feed unavailable",
        live: false,
        cached: false,
        notice: "The Government live price gateway is temporarily unavailable and no matching historical record is available."
      }))
      return
    }
  }

  if (!apiKey) {
    res.writeHead(503).end(JSON.stringify({
      error: "No mandi price API key is configured. Add DATA_GOV_API_KEY to backend/.env for the live Government feed."
    }))
    return
  }

  const cedaBase = "https://api.ceda.ashoka.edu.in/v1"
  const cedaHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": "Bearer " + apiKey
  }

  async function cedaRequest(method, endpoint, body) {
    const options = {
      method,
      headers: cedaHeaders,
      signal: AbortSignal.timeout(20000)
    }
    if (body !== undefined) options.body = JSON.stringify(body)

    const response = await fetch(cedaBase + endpoint, options)
    const raw = await response.text()
    let payload = {}
    try {
      payload = raw ? JSON.parse(raw) : {}
    } catch {
      throw new Error("CEDA returned a non-JSON response (HTTP " + response.status + ").")
    }

    if (!response.ok) {
      const message = payload?.output?.message || payload?.message || payload?.error
      throw new Error(message
        ? "CEDA API returned HTTP " + response.status + ": " + message
        : "CEDA API returned HTTP " + response.status + ".")
    }

    if (payload?.output?.type && payload.output.type !== "success") {
      throw new Error(payload.output.message || "CEDA API returned an error.")
    }

    return payload?.output?.data ?? payload?.data ?? []
  }

  try {
    const cacheKey = JSON.stringify({
      commodity: commodity.toLowerCase(),
      state: state.toLowerCase(),
      district: district.toLowerCase(),
      market: market.toLowerCase()
    })
    const cached = cache.get("ceda:" + cacheKey)
    if (cached && Date.now() - cached.savedAt < ttlMs && offset === 0) {
      res.writeHead(200).end(JSON.stringify({ ...cached.data, cached: true }))
      return
    }

    const [commodities, geographies] = await Promise.all([
      cedaRequest("GET", "/agmarknet/commodities"),
      cedaRequest("GET", "/agmarknet/geographies")
    ])

    const normalize = value => String(value || "").trim().toLowerCase()

    const commodityName = normalize(commodity)
    const exactCommodity = commodities.find(item =>
      normalize(item.commodity_name) === commodityName
    )
    const partialCommodities = commodities.filter(item =>
      normalize(item.commodity_name).includes(commodityName)
    )
    const commodityMatch = exactCommodity || (partialCommodities.length === 1 ? partialCommodities[0] : null)

    if (!commodityMatch) {
      res.writeHead(400).end(JSON.stringify({
        error: partialCommodities.length > 1
          ? "Commodity name is ambiguous. Please use a more specific crop name."
          : "CEDA does not have a commodity matching \"" + commodity + "\"."
      }))
      return
    }

    const stateName = normalize(state)
    const stateMatches = geographies.filter(item =>
      normalize(item.census_state_name) === stateName
    )
    const partialStates = stateMatches.length
      ? stateMatches
      : geographies.filter(item => normalize(item.census_state_name).includes(stateName))

    if (!partialStates.length) {
      res.writeHead(400).end(JSON.stringify({
        error: "CEDA does not have a state matching \"" + state + "\"."
      }))
      return
    }

    const stateMatch = partialStates[0]
    const stateId = stateMatch.census_state_id

    let districtId = null
    if (district) {
      const districtName = normalize(district)
      const districtsInState = geographies.filter(item =>
        item.census_state_id === stateId
      )
      const districtMatches = districtsInState.filter(item =>
        normalize(item.census_district_name) === districtName
      )
      const partialDistricts = districtMatches.length
        ? districtMatches
        : districtsInState.filter(item => normalize(item.census_district_name).includes(districtName))

      if (partialDistricts.length) {
        districtId = partialDistricts[0].census_district_id
      } else {
        // District names entered by users often differ from AGMARKNET/ Census naming
        // (for example "banglore rural" vs "Bangalore Rural"). If no district matches,
        // return the state-wide official data instead of failing the entire price page.
        districtId = null
      }
    }

    const today = new Date()
    const toDate = today.toISOString().slice(0, 10)
    const from = new Date(today)
    from.setDate(from.getDate() - 365)
    const fromDate = from.toISOString().slice(0, 10)

    const priceBody = {
      commodity_id: commodityMatch.commodity_id,
      state_id: stateId,
      from_date: fromDate,
      to_date: toDate
    }
    if (districtId !== null) priceBody.district_id = [districtId]

    const rows = await cedaRequest("POST", "/agmarknet/prices", priceBody)

    const districtNames = new Map(
      geographies.map(item => [item.census_district_id, item.census_district_name])
    )
    const stateNames = new Map(
      geographies.map(item => [item.census_state_id, item.census_state_name])
    )

    const districtIds = [...new Set(
      rows.map(row => row.census_district_id).filter(Boolean)
    )]

    const marketMap = new Map()

    await Promise.all(districtIds.map(async currentDistrictId => {
      try {
        const markets = await cedaRequest("POST", "/agmarknet/markets", {
          commodity_id: commodityMatch.commodity_id,
          state_id: stateId,
          district_id: currentDistrictId,
          indicator: "price"
        })
        for (const item of markets) {
          marketMap.set(item.market_id, item.market_name)
        }
      } catch {
        // Market names are optional enrichment. Price rows are still useful.
      }
    }))

    let records = rows.map(row => ({
      arrival_date: String(row.date || "").slice(0, 10),
      commodity: commodityMatch.commodity_name,
      state: stateNames.get(row.census_state_id) || stateMatch.census_state_name,
      district: row.census_district_id
        ? (districtNames.get(row.census_district_id) || String(row.census_district_id))
        : "(all districts)",
      market: row.market_id
        ? (marketMap.get(row.market_id) || "Reported mandi")
        : "(state average)",
      min_price: row.min_price,
      modal_price: row.modal_price,
      max_price: row.max_price,
      variety: "",
      grade: ""
    }))

    if (market) {
      const marketName = normalize(market)
      records = records.filter(row => normalize(row.market).includes(marketName))
    }

    records.sort((a, b) =>
      String(b.arrival_date).localeCompare(String(a.arrival_date))
    )

    const total = records.length
    const page = records.slice(offset, offset + limit)
    const responseData = {
      records: page,
      total,
      total_count: total,
      source: "AGMARKNET via CEDA Ashoka University",
      cached: false
    }

    if (offset === 0) cache.set("ceda:" + cacheKey, { data: responseData, savedAt: Date.now() })
    res.writeHead(200).end(JSON.stringify(responseData))
  } catch (error) {
    res.writeHead(502).end(JSON.stringify({
      error: error?.message || "Could not reach the CEDA market-price service."
    }))
  }

})

server.listen(port, () => console.log("Farmezy official mandi API listening on http://localhost:" + port))
