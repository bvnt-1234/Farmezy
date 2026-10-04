import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const file = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "data", "mandi-history.json")
if (!existsSync(file)) throw new Error("Historical mandi dataset not found. Run: node backend/scripts/collect-mandi-history.js")

const data = JSON.parse(readFileSync(file, "utf8"))
const rows = Array.isArray(data.rows) ? data.rows : []

export function forecastPrice({ commodity, state, district = "", days = 7 }) {
  const wanted = String(commodity || "").trim().toLowerCase()
  const wantedState = String(state || "").trim().toLowerCase()
  const wantedDistrict = String(district || "").trim().toLowerCase()

  let filtered = rows.filter(r =>
    String(r.commodity).trim().toLowerCase() === wanted &&
    String(r.state).trim().toLowerCase() === wantedState
  )

  if (wantedDistrict) {
    const districtRows = filtered.filter(r => String(r.district).trim().toLowerCase() === wantedDistrict)
    if (districtRows.length >= 10) filtered = districtRows
  }

  const daily = new Map()
  for (const row of filtered) {
    const value = Number(row.modal_price)
    if (!Number.isFinite(value) || value <= 0) continue
    const date = String(row.arrival_date).slice(0, 10)
    if (!daily.has(date)) daily.set(date, [])
    daily.get(date).push(value)
  }

  const points = [...daily.entries()]
    .map(([date, values]) => ({ date, price: values.reduce((a,b)=>a+b,0)/values.length }))
    .sort((a,b)=>a.date.localeCompare(b.date))

  if (points.length < 14) throw new Error("Not enough historical observations for this crop and location.")

  const recent = points.slice(-180)
  const mean = recent.reduce((s,p)=>s+p.price,0) / recent.length
  const n = recent.length
  let sx=0, sy=0, sxx=0, sxy=0
  recent.forEach((p,i)=>{ sx+=i; sy+=p.price; sxx+=i*i; sxy+=i*p.price })
  const slope = (n*sxy-sx*sy) / Math.max(1, n*sxx-sx*sx)
  const last = recent[n-1].price
  const safeSlope = Math.max(-mean*0.03, Math.min(mean*0.03, slope))
  const predictions = []
  for (let i=1;i<=Math.min(30, Math.max(1, Number(days)||7));i++) {
    const predicted = Math.max(0, last + safeSlope*i)
    predictions.push({ day:i, price:Math.round(predicted), lower:Math.round(predicted*0.9), upper:Math.round(predicted*1.1) })
  }

  return {
    commodity,
    state,
    district: district || "state average",
    trainingRows: rows.length,
    observations: points.length,
    model: "30%-bounded linear trend on the latest 180 daily observations",
    lastObserved: points.at(-1),
    predictions
  }
}
