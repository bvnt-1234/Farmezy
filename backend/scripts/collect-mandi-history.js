import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const envFile = path.join(root, ".env")
const outputFile = path.join(root, "data", "mandi-history.json")
const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"

try {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
} catch {}

const key = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY
if (!key) throw new Error("DATA_GOV_API_KEY is missing from backend/.env")

const cutoff = new Date()
cutoff.setFullYear(cutoff.getFullYear() - 3)

const rows = []
const seen = new Set()
const pageSize = 1000
let offset = 0
let pages = 0

function parseDate(value) {
  const s = String(value || "")
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T00:00:00Z")
  const m = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/)
  return m ? new Date(m[3] + "-" + m[2] + "-" + m[1] + "T00:00:00Z") : new Date("invalid")
}

while (true) {
  const url = new URL("https://api.data.gov.in/resource/" + resourceId)
  url.searchParams.set("api-key", key)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", String(pageSize))
  url.searchParams.set("offset", String(offset))
  url.searchParams.set("sort[arrival_date]", "desc")

  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Farmezy/1.0" }, signal: AbortSignal.timeout(30000) })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || "data.gov.in HTTP " + response.status)

  const page = Array.isArray(payload.records) ? payload.records : []
  if (!page.length) break

  for (const row of page) {
    const date = parseDate(row.arrival_date)
    if (Number.isNaN(date.getTime())) continue
    if (date < cutoff) {
      const data = { collectedAt: new Date().toISOString(), cutoff: cutoff.toISOString().slice(0,10), rows }
      mkdirSync(path.dirname(outputFile), { recursive: true })
      writeFileSync(outputFile, JSON.stringify(data))
      console.log("Saved " + rows.length + " records to " + outputFile)
      process.exit(0)
    }
    const clean = {
      state: row.state || "",
      district: row.district || "",
      market: row.market || "",
      commodity: row.commodity || "",
      variety: row.variety || "",
      grade: row.grade || "",
      arrival_date: String(row.arrival_date || ""),
      min_price: Number(row.min_price),
      modal_price: Number(row.modal_price),
      max_price: Number(row.max_price),
    }
    if (!clean.commodity || !Number.isFinite(clean.modal_price) || clean.modal_price <= 0) continue
    const keyRow = [clean.state, clean.district, clean.market, clean.commodity, clean.variety, clean.grade, clean.arrival_date, clean.modal_price].join("|")
    if (!seen.has(keyRow)) {
      seen.add(keyRow)
      rows.push(clean)
    }
  }

  pages += 1
  console.log("Fetched page " + pages + " — " + rows.length + " usable rows")
  if (page.length < pageSize) break
  offset += pageSize
}

mkdirSync(path.dirname(outputFile), { recursive: true })
writeFileSync(outputFile, JSON.stringify({ collectedAt: new Date().toISOString(), cutoff: cutoff.toISOString().slice(0,10), rows }))
console.log("Finished. Saved " + rows.length + " records.")
