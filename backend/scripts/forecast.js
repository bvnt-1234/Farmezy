import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const mlForecastFile = path.join(root, "models", "price_forecasts_2025_2026.json")
const baselineFile = path.join(root, "data", "user-baselines.json")
const metadataFile = path.join(root, "models", "model_metadata.json")

// Load ML Precomputed Forecasts
let mlForecasts = null
try {
  if (existsSync(mlForecastFile)) {
    mlForecasts = JSON.parse(readFileSync(mlForecastFile, "utf8"))
  }
} catch (err) {
  console.warn("Could not load ML forecasts file:", err.message)
}

// Load APMC Baseline Fallbacks & Metadata
let baselines = {}
let baselineData = null
try {
  if (existsSync(baselineFile)) {
    baselineData = JSON.parse(readFileSync(baselineFile, "utf8"))
    baselines = baselineData?.baselines || {}
  }
} catch (err) {
  console.warn("Could not load APMC baseline file:", err.message)
}

// Precompute National Averages for ML commodities (Unweighted arithmetic mean across all 28 states)
const nationalMlAverages = {}
if (mlForecasts) {
  const commBuckets = {}
  for (const entry of Object.values(mlForecasts)) {
    const c = entry.commodity
    if (!commBuckets[c]) {
      commBuckets[c] = {
        commodity: c,
        unit: entry.unit,
        h23: [],
        h24: [],
        act25: [],
        p25: [],
        p26: []
      }
    }
    commBuckets[c].h23.push(entry.history?.["2023"] || 0)
    commBuckets[c].h24.push(entry.history?.["2024"] || 0)
    commBuckets[c].act25.push(entry.history?.["2025_actual"] || 0)
    commBuckets[c].p25.push(entry.predicted_2025 || 0)
    commBuckets[c].p26.push(entry.predicted_2026 || 0)
  }

  for (const [c, b] of Object.entries(commBuckets)) {
    const avg = arr => (arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length))
    const p25 = Math.round(avg(b.p25) * 100) / 100
    const p26 = Math.round(avg(b.p26) * 100) / 100
    nationalMlAverages[c.toLowerCase()] = {
      state: "All India (Unweighted State Average)",
      commodity: c,
      unit: b.unit,
      aggregationType: "Unweighted arithmetic average across 28 states",
      history: {
        "2023": Math.round(avg(b.h23) * 100) / 100,
        "2024": Math.round(avg(b.h24) * 100) / 100,
        "2025_actual": Math.round(avg(b.act25) * 100) / 100
      },
      predicted_2025: p25,
      predicted_2026: p26,
      expected_annual_drift_percent: Math.round(((p26 - p25) / p25) * 10000) / 100,
      uncertainty_band: {
        lower_bound_2026: Math.round(p26 * 0.88 * 100) / 100,
        upper_bound_2026: Math.round(p26 * 1.12 * 100) / 100,
        band_type: "illustrative_estimate",
        description: "Illustrative ±12% range (not a statistically derived confidence interval; informed by the 9.12% overall test MAPE)"
      }
    }
  }
}

// Canonical Aliases Mapping for the 8 ML commodities
const ML_COMMODITY_ALIASES = {
  "tomato": "Tomato",
  "tomatoes": "Tomato",
  "potato": "Potato",
  "potatoes": "Potato",
  "onion": "Onion",
  "onions": "Onion",
  "wheat": "Wheat",
  "paddy": "Paddy (Rice)",
  "rice": "Paddy (Rice)",
  "paddy (rice)": "Paddy (Rice)",
  "paddy(common)": "Paddy (Rice)",
  "paddy(dhan)(common)": "Paddy (Rice)",
  "paddy(dhan)(basmati)": "Paddy (Rice)",
  "dhan": "Paddy (Rice)",
  "mustard oil": "Mustard Oil",
  "mustard": "Mustard Oil",
  "sugarcane": "Sugarcane",
  "sugar cane": "Sugarcane",
  "tur (arhar) dal": "Tur (Arhar) Dal",
  "tur dal": "Tur (Arhar) Dal",
  "arhar dal": "Tur (Arhar) Dal",
  "arhar": "Tur (Arhar) Dal",
  "tur": "Tur (Arhar) Dal",
  "arhar dal(tur dal)": "Tur (Arhar) Dal",
  "arhar (tur/red gram)(whole)": "Tur (Arhar) Dal"
}

// Common State Name Normalizer
function normalizeState(s) {
  const norm = String(s || "").trim().toLowerCase()
  if (norm.includes("bengaluru") || norm.includes("bangalore") || norm.includes("karnataka")) return "Karnataka"
  if (norm.includes("maharashtra") || norm.includes("mumbai") || norm.includes("pune")) return "Maharashtra"
  if (norm.includes("tamil") || norm.includes("chennai")) return "Tamil Nadu"
  if (norm.includes("andhra") || norm.includes("amaravati")) return "Andhra Pradesh"
  if (norm.includes("telangana") || norm.includes("hyderabad")) return "Telangana"
  if (norm.includes("kerala") || norm.includes("kochi")) return "Kerala"
  if (norm.includes("delhi")) return "Delhi"
  if (norm.includes("uttar pradesh") || norm.includes("lucknow")) return "Uttar Pradesh"
  if (norm.includes("madhya pradesh") || norm.includes("bhopal")) return "Madhya Pradesh"
  if (norm.includes("rajasthan") || norm.includes("jaipur")) return "Rajasthan"
  if (norm.includes("punjab") || norm.includes("amritsar")) return "Punjab"
  if (norm.includes("haryana")) return "Haryana"
  if (norm.includes("gujarat") || norm.includes("ahmedabad")) return "Gujarat"
  if (norm.includes("bihar") || norm.includes("patna")) return "Bihar"
  if (norm.includes("west bengal") || norm.includes("bengal") || norm.includes("kolkata")) return "West Bengal"
  if (norm.includes("odisha") || norm.includes("orissa")) return "Odisha"
  if (norm.includes("assam")) return "Assam"
  if (norm.includes("jharkhand")) return "Jharkhand"
  if (norm.includes("chhattisgarh")) return "Chhattisgarh"
  if (norm.includes("uttarakhand")) return "Uttarakhand"
  if (norm.includes("himachal")) return "Himachal Pradesh"
  if (norm.includes("goa")) return "Goa"
  if (norm.includes("sikkim")) return "Sikkim"
  if (norm.includes("tripura")) return "Tripura"
  if (norm.includes("meghalaya")) return "Meghalaya"
  if (norm.includes("manipur")) return "Manipur"
  if (norm.includes("nagaland")) return "Nagaland"
  if (norm.includes("mizoram")) return "Mizoram"
  if (norm.includes("arunachal")) return "Arunachal Pradesh"
  return s ? (s.charAt(0).toUpperCase() + s.slice(1)) : ""
}

/**
 * Main Forecast Function
 * Satisfies existing GET /api/price-forecast response contract
 */
export function forecastPrice({ commodity = "", state = "", district = "", days = 7 }) {
  const cleanComm = String(commodity || "").trim()
  if (!cleanComm) {
    throw new Error("Commodity name is required for price forecasting.")
  }

  const commKey = cleanComm.toLowerCase()
  const daysNum = Math.min(30, Math.max(1, Number(days) || 7))
  const canonicalMlComm = ML_COMMODITY_ALIASES[commKey]

  // =========================================================================
  // PATH A: ML MODEL FORECAST (Trained Ridge Regression on 3-Year Historical Mandi Data)
  // =========================================================================
  if (canonicalMlComm && mlForecasts) {
    const cleanState = normalizeState(state)
    const lookupKey = `${cleanState.toLowerCase()}|${canonicalMlComm.toLowerCase()}`
    let mlRecord = mlForecasts[lookupKey]
    let resolvedState = cleanState
    let isNationalAverage = false

    // If exact state not found in the 28 states, fall back to National Average for this ML crop
    if (!mlRecord) {
      mlRecord = nationalMlAverages[canonicalMlComm.toLowerCase()]
      resolvedState = cleanState
        ? `${cleanState} (Mapped to All India Unweighted Average)`
        : "All India (Unweighted State Average)"
      isNationalAverage = true
    }

    if (mlRecord) {
      const p2025 = mlRecord.history?.["2025_actual"] || mlRecord.predicted_2025
      const p2026 = mlRecord.predicted_2026
      const unit = mlRecord.unit || (canonicalMlComm === "Sugarcane" ? "Tonne" : "Quintal (100 KG)")

      // Uncertainty range: clearly labeled as an illustrative ±12% estimate (not a statistically derived confidence interval)
      const lowerBound2026 = mlRecord.uncertainty_band?.lower_bound_2026 ?? Math.round(p2026 * 0.88 * 100) / 100
      const upperBound2026 = mlRecord.uncertainty_band?.upper_bound_2026 ?? Math.round(p2026 * 1.12 * 100) / 100

      // Backward compatibility: provide constant 2026 annual benchmark level across the requested days array.
      // We do NOT simulate or fabricate day-by-day movements from an annual model.
      const predictions = Array.from({ length: daysNum }, (_, i) => ({
        day: i + 1,
        price: p2026,
        lower: lowerBound2026,
        upper: upperBound2026,
        type: "annual_benchmark_level",
        note: "Constant 2026 annual wholesale benchmark level provided for API compatibility. Annual ML models do not forecast intra-day or daily variations."
      }))

      // Explicit district and level labeling to ensure district-level accuracy is never implied
      const resolvedDistrict = district
        ? `${district} (State-level estimate; district data not modeled)`
        : (isNationalAverage ? "All-India Unweighted Average" : "State-wide Average (No district modeling)")

      return {
        commodity: canonicalMlComm,
        state: resolvedState,
        district: resolvedDistrict,
        unit,
        trainingRows: 448,
        observations: 3,
        geographicLevel: isNationalAverage
          ? "All-India unweighted average across 28 states (state-level historical data)"
          : "State-level estimate (annual model does not provide district-specific forecasts)",
        model: "Farmezy Ridge Regression (Log-Scale) Model — Trained on 2023-2024 Indian Mandi Dataset, Evaluated on 2025 Held-Out Test Split with 9.12% MAPE",
        forecastType: isNationalAverage
          ? "Annual unweighted national wholesale estimate based on 3-year historical APMC state averages (not district-specific or live daily prices)"
          : "Annual state-level wholesale estimate based on 3-year historical APMC mandi data (not district-specific or live daily prices)",
        lastObserved: {
          year: 2025,
          price: mlRecord.history?.["2025_actual"] || mlRecord.predicted_2025,
          unit,
          label: isNationalAverage
            ? "Unweighted 28-State Average Benchmark (2025)"
            : "State Annual Wholesale Benchmark (2025)"
        },
        annualBenchmark: {
          historical_2023: mlRecord.history?.["2023"],
          historical_2024: mlRecord.history?.["2024"],
          actual_2025: mlRecord.history?.["2025_actual"],
          forecast_2026: mlRecord.predicted_2026,
          expected_annual_drift_percent: mlRecord.expected_annual_drift_percent,
          uncertainty_band: {
            lower_bound_2026: lowerBound2026,
            upper_bound_2026: upperBound2026,
            band_type: "illustrative_estimate",
            description: "Illustrative ±12% range (not a statistically derived confidence interval; informed by the 9.12% overall test MAPE)"
          }
        },
        predictions
      }
    }
  }

  // =========================================================================
  // PATH B: APMC CATALOGUE BASELINE FALLBACK (For unsupported crops: Garlic, Ginger, etc.)
  // =========================================================================
  // Normalize lookup key for baselines
  let baselineKey = commKey
  let baselinePrice = baselines[baselineKey]

  if (!baselinePrice) {
    // Exact or direct alias match in baselines
    for (const [k, v] of Object.entries(baselines)) {
      if (k === commKey || k.startsWith(commKey + "(") || k.startsWith(commKey + " -") || k.startsWith(commKey + " ")) {
        baselineKey = k
        baselinePrice = v
        break
      }
    }
  }

  if (Number.isFinite(Number(baselinePrice)) && Number(baselinePrice) > 0) {
    const base = Number(baselinePrice)
    const predictions = Array.from({ length: daysNum }, (_, i) => {
      const step = i + 1
      const price = Math.round(base * (1 + 0.002 * step))
      return {
        day: step,
        price,
        lower: Math.round(price * 0.9),
        upper: Math.round(price * 1.1),
        type: "illustrative_baseline_projection",
        note: "Illustrative +0.2%/day baseline progression (not an ML prediction or verified market forecast)"
      }
    })

    const baselineDate = baselineData?.date || "2026-10-30"
    const baselineSource = baselineData?.source || "AGMARKNET Mandi Benchmark"

    return {
      commodity: cleanComm,
      state: state || "National Baseline Reference",
      district: district ? `${district} (National baseline reference applied)` : "APMC Reference Benchmark",
      unit: "Quintal (100 KG)",
      trainingRows: 0,
      observations: 0,
      model: "Illustrative baseline projection (+0.2%/day progression from AGMARKNET reference; not an ML model or verified market forecast)",
      forecastType: "Illustrative baseline wholesale projection based on AGMARKNET static reference median (not an ML forecast or verified market prediction)",
      lastObserved: {
        date: baselineDate,
        price: base,
        unit: "Quintal (100 KG)",
        label: `AGMARKNET Reference Median (${baselineSource}; static benchmark, not a confirmed live daily observation)`
      },
      predictions
    }
  }

  // =========================================================================
  // PATH C: INVALID / UNRECOGNIZED COMMODITY
  // =========================================================================
  throw new Error(
    `No historical baseline or ML forecast available for '${cleanComm}'. ` +
    `Supported ML commodities: Tomato, Onion, Potato, Wheat, Paddy (Rice), Tur (Arhar) Dal, Mustard Oil, Sugarcane; ` +
    `plus 150+ APMC benchmark crops (Garlic, Ginger, Apple, Carrot, etc.).`
  )
}

export default forecastPrice
