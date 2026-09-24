import http from "node:http"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const port = Number(process.env.API_PORT || 3001)
const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"
const cache = new Map()
const ttlMs = 5 * 60 * 1000
const imageCache = new Map()
const imageTtlMs = 24 * 60 * 60 * 1000

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
  if (req.method !== "GET") {
    res.writeHead(405).end(JSON.stringify({ error: "GET requests only." }))
    return
  }

  const requestUrl = new URL(req.url, "http://localhost")
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
