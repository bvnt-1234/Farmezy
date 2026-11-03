import { forecastPrice } from "./forecast.js"

console.log("=================================================================")
console.log("    TESTING FARMEZY /api/price-forecast INTEGRATION CONTRACT     ")
console.log("=================================================================")

const testCases = [
  { name: "1. ML Crop (Tomato, Karnataka)", query: { commodity: "Tomato", state: "Karnataka", days: 7 } },
  { name: "2. ML Crop (Onion, Maharashtra)", query: { commodity: "Onion", state: "Maharashtra", days: 5 } },
  { name: "3. ML Crop in Tonne (Sugarcane, Uttar Pradesh)", query: { commodity: "Sugarcane", state: "Uttar Pradesh", days: 7 } },
  { name: "4. ML Crop Alias (Rice, Punjab)", query: { commodity: "Rice", state: "Punjab", days: 7 } },
  { name: "5. ML Crop without state (Wheat, National avg)", query: { commodity: "Wheat", days: 7 } },
  { name: "6. Fallback Crop (Garlic, Madhya Pradesh)", query: { commodity: "Garlic", state: "Madhya Pradesh", days: 7 } },
  { name: "7. Fallback Crop (Ginger, Kerala)", query: { commodity: "Ginger", state: "Kerala", days: 7 } },
  { name: "8. Fallback Crop (Apple, Himachal Pradesh)", query: { commodity: "Apple", state: "Himachal Pradesh", days: 7 } },
]

let passed = 0
for (const tc of testCases) {
  try {
    const res = forecastPrice(tc.query)
    console.log(`\n✅ PASS: ${tc.name}`)
    console.log(`   Commodity: ${res.commodity} | State: ${res.state} | Unit: ${res.unit}`)
    console.log(`   Model: ${res.model}`)
    console.log(`   Forecast Type: ${res.forecastType}`)
    console.log(`   Last Observed:`, JSON.stringify(res.lastObserved))
    if (res.annualBenchmark) {
      console.log(`   2026 Projected Level: ₹${res.annualBenchmark.forecast_2026} (Drift: ${res.annualBenchmark.expected_annual_drift_percent}%)`)
    }
    console.log(`   Sample Predictions (Day 1..3):`, res.predictions.slice(0, 3))
    
    // Validate contract
    if (!res.commodity || !res.model || !Array.isArray(res.predictions) || res.predictions.length !== (tc.query.days || 7)) {
      throw new Error("Contract validation failed: invalid shape")
    }
    for (const p of res.predictions) {
      if (typeof p.day !== "number" || typeof p.price !== "number" || typeof p.lower !== "number" || typeof p.upper !== "number") {
        throw new Error("Prediction item missing day/price/lower/upper")
      }
      if (p.price <= 0 || p.lower <= 0 || p.upper <= 0) {
        throw new Error("Negative or zero prediction detected")
      }
    }
    passed++
  } catch (err) {
    console.error(`❌ FAIL: ${tc.name} ->`, err.message)
  }
}

// Test Invalid Commodity Handling
console.log("\n9. Testing Invalid Commodity Error Handling:")
try {
  forecastPrice({ commodity: "MartianPotatoX" })
  console.error("❌ FAIL: Did not throw on invalid commodity")
} catch (err) {
  console.log("✅ PASS: Correctly threw expected error ->", err.message)
  passed++
}

console.log("\n10. Testing Missing Commodity Error Handling:")
try {
  forecastPrice({})
  console.error("❌ FAIL: Did not throw on missing commodity")
} catch (err) {
  console.log("✅ PASS: Correctly threw expected error ->", err.message)
  passed++
}

console.log(`\n=================================================================`)
console.log(`   ALL ${passed} / ${testCases.length + 2} INTEGRATION CONTRACT TESTS PASSED!`)
console.log(`=================================================================`)
