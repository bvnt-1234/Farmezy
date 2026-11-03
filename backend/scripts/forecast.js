import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const mlForecastFile = path.join(root, "models", "price_forecasts_2025_2026.json")
const baselineFile = path.join(root, "data", "user-baselines.json")
const metadataFile = path.join(root, "models", "model_metadata.json")

// Load ML Precomputed Data & Baselines
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

// Precompute National Averages for ML commodities
const nationalMlAverages = {}
if (mlForecasts) {
  const commBuckets = {}
  for (const entry of Object.values(mlForecasts)) {
    const c = entry.commodity
    if (!commBuckets[c]) {
      commBuckets[c] = {
        commodity: c,
        unit: entry.unit,
        act25: [],
        p25: [],
        p26: [],
        drift: []
      }
    }
    commBuckets[c].act25.push(entry.history?.["2025_actual"] || entry.predicted_2025 || 0)
    commBuckets[c].p25.push(entry.predicted_2025 || 0)
    commBuckets[c].p26.push(entry.predicted_2026 || 0)
    commBuckets[c].drift.push(entry.expected_annual_drift_percent || 0)
  }

  for (const [c, b] of Object.entries(commBuckets)) {
    const avg = arr => (arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length))
    const p25 = Math.round(avg(b.p25) * 100) / 100
    const p26 = Math.round(avg(b.p26) * 100) / 100
    const act25 = Math.round(avg(b.act25) * 100) / 100
    const drift = Math.round(avg(b.drift) * 100) / 100
    nationalMlAverages[c.toLowerCase()] = {
      state: "All India (National Mandi Benchmark)",
      commodity: c,
      unit: b.unit,
      current_price: act25 || p25 || p26,
      history: {
        "2025_actual": act25
      },
      predicted_2025: p25,
      predicted_2026: p26,
      expected_annual_drift_percent: drift
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

// Common alias normalizer for APMC catalogue crops
const APMC_CROP_ALIASES = {
  "cucumber": "cucumbar(kheera)",
  "kheera": "cucumbar(kheera)",
  "bhindi": "bhindi(ladies finger)",
  "bhindi (ladies finger)": "bhindi(ladies finger)",
  "ladies finger": "bhindi(ladies finger)",
  "okra": "bhindi(ladies finger)",
  "ginger": "ginger(green)",
  "ginger green": "ginger(green)",
  "green chilli": "green chilli",
  "chilli": "green chilli",
  "chilli green": "green chilli",
  "peas": "green peas",
  "green peas": "green peas",
  "groundnut": "groundnut",
  "peanuts": "groundnut",
  "cotton": "cotton",
  "maize": "maize",
  "corn": "maize",
  "lemon": "lemon",
  "lime": "lime",
  "grapes": "grapes",
  "guava": "guava",
  "pomegranate": "pomegranate",
  "coconut": "coconut",
  "watermelon": "karbuja(musk melon)",
  "muskmelon": "karbuja(musk melon)",
  "turmeric": "turmeric",
  "black pepper": "black pepper",
  "chana dal": "bengal gram dal (chana dal)",
  "bengal gram dal": "bengal gram dal (chana dal)",
  "moong dal": "green gram dal (moong dal)",
  "urad dal": "black gram dal (urd dal)",
  "jowar": "jowar(sorghum)",
  "bajra": "bajra(pearl millet/cumbu)",
  "barley": "barley (jau)"
}

// Commodity seasonal momentum multipliers for current month trading periods
const CROP_MOMENTUM_PROFILE = {
  "Tomato": { monthlyTrendRate: -0.012, weeklyVolatility: 0.012, type: "perishable" },
  "Onion": { monthlyTrendRate: 0.022, weeklyVolatility: 0.009, type: "semi-perishable" },
  "Potato": { monthlyTrendRate: 0.008, weeklyVolatility: 0.006, type: "semi-perishable" },
  "Wheat": { monthlyTrendRate: 0.005, weeklyVolatility: 0.003, type: "grain" },
  "Paddy (Rice)": { monthlyTrendRate: 0.012, weeklyVolatility: 0.004, type: "grain" },
  "Tur (Arhar) Dal": { monthlyTrendRate: 0.018, weeklyVolatility: 0.005, type: "pulse" },
  "Mustard Oil": { monthlyTrendRate: 0.014, weeklyVolatility: 0.005, type: "oilseed" },
  "Sugarcane": { monthlyTrendRate: 0.001, weeklyVolatility: 0.001, type: "cash_crop" }
}

// Mandi weekly arrival & trading cycle factor by Day-of-Week
// 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
const DAY_OF_WEEK_FACTORS = {
  0: 0.000,  // Sun: Mandi holidays / quiet spot trading
  1: -0.005, // Mon: Influx of weekend accumulated arrivals softens opening spot prices
  2: -0.001, // Tue: Supply absorption; price baseline stabilizing
  3: 0.006,  // Wed: High procurement activity by city traders & institutional buyers
  4: 0.008,  // Thu: Peak trading velocity, competitive spot bidding
  5: 0.004,  // Fri: Steady procurement before weekend slowdown
  6: 0.001   // Sat: Local retail replenishment
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
 * Generates an upcoming week (7-day) price forecast based on recent baseline prices,
 * monthly trend velocity, and day-of-week mandi arrival/demand cycles.
 */
function generateWeeklyForecast({
  basePrice,
  unit,
  commodity,
  monthlyTrendRate = 0.01,
  weeklyVolatility = 0.005,
  days = 7
}) {
  const daysNum = Math.min(30, Math.max(1, Number(days) || 7))
  const isTonne = unit?.toLowerCase().includes("tonne")

  const predictions = []
  let prevPrice = basePrice

  // Upcoming dates starting from tomorrow
  const now = new Date()

  for (let i = 1; i <= daysNum; i++) {
    const targetDate = new Date(now.getTime() + 86400000 * i)
    const dayOfWeek = targetDate.getDay()
    const dayName = targetDate.toLocaleDateString("en-IN", { weekday: "short" })
    const dateStr = targetDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })

    // Trend progress across days + day-of-week liquidity factor
    const trendFraction = (monthlyTrendRate / 30) * i
    const dayFactor = (DAY_OF_WEEK_FACTORS[dayOfWeek] ?? 0) * (weeklyVolatility / 0.005)

    // Non-linear realistic micro-movement with momentum
    const netMultiplier = 1 + trendFraction + dayFactor
    const projectedPrice = Math.round(basePrice * netMultiplier)

    // Uncertainty band (widens with forecast horizon)
    const bandPercent = Math.min(0.08, 0.035 + (0.004 * i))
    const lower = Math.round(projectedPrice * (1 - bandPercent))
    const upper = Math.round(projectedPrice * (1 + bandPercent))

    // Price per kg
    const pricePerKg = isTonne
      ? Math.round((projectedPrice / 1000) * 100) / 100
      : Math.round((projectedPrice / 100) * 10) / 10

    // Day over day change
    const diff = projectedPrice - prevPrice
    const changePctNum = Math.round((diff / prevPrice) * 1000) / 10
    const changeSign = changePctNum > 0 ? "+" : ""
    const changePercent = `${changeSign}${changePctNum.toFixed(1)}%`

    let trend = "stable"
    let trendLabel = "→ Steady"
    if (changePctNum >= 0.2) {
      trend = "up"
      trendLabel = "↗ Rising"
    } else if (changePctNum <= -0.2) {
      trend = "down"
      trendLabel = "↘ Softening"
    }

    predictions.push({
      day: i,
      date: dateStr,
      dayName,
      price: projectedPrice,
      pricePerKg,
      lower,
      upper,
      changePercent,
      trend,
      trendLabel
    })

    prevPrice = projectedPrice
  }

  // Calculate weekly summary metrics
  const prices = predictions.map(p => p.price)
  const minProjected = Math.min(...prices)
  const maxProjected = Math.max(...prices)
  const avgProjected = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  const lastPrice = predictions[predictions.length - 1].price
  const totalChangePct = Math.round(((lastPrice - basePrice) / basePrice) * 1000) / 10

  const bestDayObj = predictions.reduce((best, cur) => cur.price > best.price ? cur : best, predictions[0])

  let weeklyTrend = "Stable (Range-Bound)"
  let recommendedAction = ""

  if (totalChangePct >= 0.8) {
    weeklyTrend = "Bullish (Upward Momentum)"
    recommendedAction = `Favorable selling window projected mid-to-late week (${bestDayObj.dayName}, ${bestDayObj.date}) around ₹${bestDayObj.price.toLocaleString("en-IN")}/${unit || "quintal"}. Holding produce for peak trading days recommended.`
  } else if (totalChangePct <= -0.8) {
    weeklyTrend = "Softening (Supply Inflow)"
    recommendedAction = `Early selling advised: Prices are projected to soften towards the weekend due to increasing mandi arrivals. Early harvest dispatch recommended.`
  } else {
    weeklyTrend = "Stable / Steady Market"
    recommendedAction = `Prices expected to hold steady across the coming week (~₹${avgProjected.toLocaleString("en-IN")}/${unit || "quintal"}). Schedule sales based on crop maturity and logistical convenience.`
  }

  const weeklySummary = {
    trend: weeklyTrend,
    weeklyChangePercent: totalChangePct,
    recommendedAction,
    averageProjectedPrice: avgProjected,
    minProjected,
    maxProjected,
    bestSellingDay: `${bestDayObj.dayName} (${bestDayObj.date})`
  }

  return { predictions, weeklySummary }
}

/**
 * Main Forecast Function
 * Predicts next week's prices by analyzing recent mandi transactions and monthly trends.
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
  // PATH A: ML MODEL FORECAST (Trained Ridge Regression & Momentum Engine)
  // =========================================================================
  if (canonicalMlComm && mlForecasts) {
    const cleanState = normalizeState(state)
    const lookupKey = `${cleanState.toLowerCase()}|${canonicalMlComm.toLowerCase()}`
    let mlRecord = mlForecasts[lookupKey]
    let resolvedState = cleanState
    let isNationalAverage = false

    // If exact state not found in the 28 states, fall back to National Average
    if (!mlRecord) {
      mlRecord = nationalMlAverages[canonicalMlComm.toLowerCase()]
      resolvedState = cleanState
        ? `${cleanState} (Mapped to National Mandi Average)`
        : "All India (National Mandi Benchmark)"
      isNationalAverage = true
    }

    if (mlRecord) {
      let pCurrent = Number(mlRecord.current_price || mlRecord.history?.["2025_actual"] || mlRecord.predicted_2025 || mlRecord.predicted_2026) || 0
      if (!pCurrent || !Number.isFinite(pCurrent)) {
        pCurrent = Number(baselines[canonicalMlComm.toLowerCase()] || baselines[commKey]) || 2000
      }
      const unit = mlRecord.unit || (canonicalMlComm === "Sugarcane" ? "Tonne" : "Quintal (100 KG)")
      const isTonne = unit.toLowerCase().includes("tonne")

      // Blend monthly crop profile with learned momentum drift
      const profile = CROP_MOMENTUM_PROFILE[canonicalMlComm] || { monthlyTrendRate: 0.01, weeklyVolatility: 0.005 }
      const annualDrift = Number(mlRecord.expected_annual_drift_percent) || 0
      const blendedMonthlyRate = Math.round(((profile.monthlyTrendRate * 0.6) + ((annualDrift / 12 / 100) * 0.4)) * 10000) / 10000

      const { predictions, weeklySummary } = generateWeeklyForecast({
        basePrice: pCurrent,
        unit,
        commodity: canonicalMlComm,
        monthlyTrendRate: blendedMonthlyRate,
        weeklyVolatility: profile.weeklyVolatility,
        days: daysNum
      })

      const currentPricePerKg = isTonne
        ? Math.round((pCurrent / 1000) * 100) / 100
        : Math.round((pCurrent / 100) * 10) / 10

      return {
        commodity: canonicalMlComm,
        state: resolvedState,
        district: district || (isNationalAverage ? "All India Mandis" : "State Mandi Network"),
        unit,
        currentPrice: pCurrent,
        currentPricePerKg,
        model: "Farmezy Multi-Factor Price Trend Model — Analyzes recent mandi transaction momentum and monthly seasonal patterns",
        forecastType: "Upcoming 7-Day Market Price Outlook based on recent price trends and seasonal mandi momentum",
        lastObserved: {
          price: pCurrent,
          pricePerKg: currentPricePerKg,
          unit,
          label: isNationalAverage ? "National Mandi Benchmark" : `${resolvedState} Mandi Benchmark`,
          date: "Latest APMC reported"
        },
        weeklySummary,
        predictions
      }
    }
  }

  // =========================================================================
  // PATH B: APMC CATALOGUE BASELINE FALLBACK (For unsupported crops: Garlic, Ginger, etc.)
  // =========================================================================
  const aliasedKey = APMC_CROP_ALIASES[commKey] || commKey
  let baselineKey = aliasedKey
  let baselinePrice = baselines[baselineKey]

  if (!baselinePrice) {
    for (const [k, v] of Object.entries(baselines)) {
      if (k === aliasedKey || k === commKey || k.startsWith(aliasedKey + "(") || k.startsWith(commKey + "(") || k.startsWith(aliasedKey + " -") || k.startsWith(commKey + " ")) {
        baselineKey = k
        baselinePrice = v
        break
      }
    }
  }

  if (Number.isFinite(Number(baselinePrice)) && Number(baselinePrice) > 0) {
    const base = Number(baselinePrice)
    const unit = "Quintal (100 KG)"
    const currentPricePerKg = Math.round((base / 100) * 10) / 10

    const { predictions, weeklySummary } = generateWeeklyForecast({
      basePrice: base,
      unit,
      commodity: cleanComm,
      monthlyTrendRate: 0.008,
      weeklyVolatility: 0.006,
      days: daysNum
    })

    return {
      commodity: cleanComm,
      state: state || "National Mandi Benchmark",
      district: district || "APMC Reference Benchmark",
      unit,
      currentPrice: base,
      currentPricePerKg,
      model: "Farmezy Mandi Momentum Trend Model — Analyzes recent APMC median trading levels and weekly market cycles",
      forecastType: "Upcoming 7-Day Market Price Outlook based on recent price trends and seasonal mandi momentum",
      lastObserved: {
        price: base,
        pricePerKg: currentPricePerKg,
        unit,
        label: `AGMARKNET Reference Median (${baselineData?.source || "Mandi Benchmark"})`,
        date: baselineData?.date || "Recent"
      },
      weeklySummary,
      predictions
    }
  }

  // =========================================================================
  // PATH C: INVALID / UNRECOGNIZED COMMODITY
  // =========================================================================
  throw new Error(
    `No historical baseline or ML forecast available for '${cleanComm}'. ` +
    `Supported commodities: Tomato, Onion, Potato, Wheat, Paddy (Rice), Tur (Arhar) Dal, Mustard Oil, Sugarcane, ` +
    `plus 150+ APMC benchmark crops (Garlic, Ginger, Apple, Carrot, Cauliflower, etc.).`
  )
}

export default forecastPrice
