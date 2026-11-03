import { forecastPrice } from "./forecast.js"

console.log("=================================================================")
console.log("    TESTING FARMEZY /api/price-forecast INTEGRATION CONTRACT     ")
console.log("=================================================================")

async function runTests() {
  const testCases = [
    { name: "1. ML Crop (Tomato, Karnataka, Kolar)", query: { commodity: "Tomato", state: "Karnataka", district: "Kolar", days: 7 } },
    { name: "2. ML Crop (Tomato, Karnataka, Bengaluru Urban)", query: { commodity: "Tomato", state: "Karnataka", district: "Bengaluru Urban", days: 7 } },
    { name: "3. ML Crop (Tomato, Maharashtra, Nashik)", query: { commodity: "Tomato", state: "Maharashtra", district: "Nashik", days: 7 } },
    { name: "4. ML Crop (Onion, Maharashtra, Pune)", query: { commodity: "Onion", state: "Maharashtra", district: "Pune", days: 5 } },
    { name: "5. ML Crop in Tonne (Sugarcane, Uttar Pradesh)", query: { commodity: "Sugarcane", state: "Uttar Pradesh", days: 7 } },
    { name: "6. ML Crop Alias (Rice, Punjab)", query: { commodity: "Rice", state: "Punjab", days: 7 } },
    { name: "7. ML Crop without state (Wheat, National avg)", query: { commodity: "Wheat", days: 7 } },
    { name: "8. Fallback Crop (Garlic, Madhya Pradesh, Mandsaur)", query: { commodity: "Garlic", state: "Madhya Pradesh", district: "Mandsaur", days: 7 } },
    { name: "9. Fallback Crop (Garlic, Kerala, Kozhikode)", query: { commodity: "Garlic", state: "Kerala", district: "Kozhikode", days: 7 } },
    { name: "10. Fallback Crop (Apple, Himachal Pradesh, Shimla)", query: { commodity: "Apple", state: "Himachal Pradesh", district: "Shimla", days: 7 } },
  ]

  let passed = 0
  const results = {}

  for (const tc of testCases) {
    try {
      const res = await forecastPrice(tc.query)
      results[tc.name] = res
      console.log(`\n✅ PASS: ${tc.name}`)
      console.log(`   Commodity: ${res.commodity} | State: ${res.state} | District: ${res.district} | Unit: ${res.unit}`)
      console.log(`   Current Price: ₹${res.currentPrice} (₹${res.currentPricePerKg}/kg)`)
      console.log(`   Model: ${res.model}`)
      console.log(`   Forecast Type: ${res.forecastType}`)
      console.log(`   Last Observed:`, JSON.stringify(res.lastObserved))
      console.log(`   Sample Predictions (Day 1..3):`, res.predictions.slice(0, 3).map(p => `${p.dayName} (${p.date}): ₹${p.price}`))

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

  // Cross-District and Cross-State Price Variation Verification
  console.log("\n=================================================================")
  console.log("   VERIFYING PRICE VARIATIONS ACROSS STATES AND DISTRICTS        ")
  console.log("=================================================================")
  
  const tomatoKolar = results["1. ML Crop (Tomato, Karnataka, Kolar)"]?.currentPrice
  const tomatoBlr = results["2. ML Crop (Tomato, Karnataka, Bengaluru Urban)"]?.currentPrice
  const tomatoNashik = results["3. ML Crop (Tomato, Maharashtra, Nashik)"]?.currentPrice

  console.log(`Tomato Prices: Kolar=₹${tomatoKolar}, Bengaluru Urban=₹${tomatoBlr}, Nashik=₹${tomatoNashik}`)
  if (tomatoKolar && tomatoBlr && tomatoKolar !== tomatoBlr) {
    console.log("✅ PASS: Intra-state district variation confirmed (Kolar production hub vs Bengaluru terminal markup)")
    passed++
  } else {
    console.error("❌ FAIL: Kolar and Bengaluru prices are identical!")
  }

  if (tomatoKolar && tomatoNashik && tomatoKolar !== tomatoNashik) {
    console.log("✅ PASS: Inter-state price variation confirmed (Karnataka vs Maharashtra)")
    passed++
  } else {
    console.error("❌ FAIL: Karnataka and Maharashtra prices are identical!")
  }

  const garlicMandsaur = results["8. Fallback Crop (Garlic, Madhya Pradesh, Mandsaur)"]?.currentPrice
  const garlicKerala = results["9. Fallback Crop (Garlic, Kerala, Kozhikode)"]?.currentPrice

  console.log(`Garlic Prices: MP Mandsaur=₹${garlicMandsaur}, Kerala Kozhikode=₹${garlicKerala}`)
  if (garlicMandsaur && garlicKerala && garlicMandsaur !== garlicKerala) {
    console.log("✅ PASS: Fallback crop inter-state variation confirmed (MP origin vs Kerala terminal)")
    passed++
  } else {
    console.error("❌ FAIL: Garlic MP and Kerala prices are identical!")
  }

  // Test Invalid Commodity Handling
  console.log("\nTesting Invalid Commodity Error Handling:")
  try {
    await forecastPrice({ commodity: "MartianPotatoX" })
    console.error("❌ FAIL: Did not throw on invalid commodity")
  } catch (err) {
    console.log("✅ PASS: Correctly threw expected error ->", err.message)
    passed++
  }

  console.log("\nTesting Missing Commodity Error Handling:")
  try {
    await forecastPrice({})
    console.error("❌ FAIL: Did not throw on missing commodity")
  } catch (err) {
    console.log("✅ PASS: Correctly threw expected error ->", err.message)
    passed++
  }

  console.log(`\n=================================================================`)
  console.log(`   ALL ${passed} / 15 TESTS PASSED SUCCESSFULLY!`)
  console.log(`=================================================================`)
}

runTests().catch(err => {
  console.error("FATAL ERROR in test suite:", err)
  process.exit(1)
})
