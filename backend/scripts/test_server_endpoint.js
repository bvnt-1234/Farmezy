import { handleRequest } from "../server.js"

async function mockGet(path) {
  return new Promise((resolve) => {
    const req = {
      method: "GET",
      url: path,
      headers: { host: "localhost:3001" }
    }
    let body = ""
    let statusCode = 200
    const headers = {}
    const res = {
      setHeader: (k, v) => { headers[k] = v },
      writeHead: (code, hdrs) => { statusCode = code; if (hdrs) Object.assign(headers, hdrs); return res },
      end: (data) => {
        if (data) body += data
        try {
          resolve({ status: statusCode, headers, json: JSON.parse(body) })
        } catch {
          resolve({ status: statusCode, headers, body })
        }
      }
    }
    handleRequest(req, res).catch(err => {
      resolve({ status: 500, error: err.message })
    })
  })
}

async function run() {
  console.log("Testing live server handler for /api/price-forecast...")

  // Test 1: ML Crop with state & district
  const r1 = await mockGet("/api/price-forecast?commodity=Tomato&state=Karnataka&district=Kolar&days=7")
  console.log("Test 1 (Tomato, Karnataka, Kolar): Status =", r1.status)
  console.log("  Price:", r1.json?.currentPrice, "Unit:", r1.json?.unit)
  console.log("  Last Observed:", r1.json?.lastObserved?.label)
  console.log("  Predictions count:", r1.json?.predictions?.length)

  // Test 2: Same Crop different district
  const r2 = await mockGet("/api/price-forecast?commodity=Tomato&state=Karnataka&district=Bengaluru%20Urban&days=7")
  console.log("\nTest 2 (Tomato, Karnataka, Bengaluru Urban): Status =", r2.status)
  console.log("  Price:", r2.json?.currentPrice, "Unit:", r2.json?.unit)
  console.log("  Last Observed:", r2.json?.lastObserved?.label)

  // Test 3: Fallback Crop (Garlic, MP, Mandsaur)
  const r3 = await mockGet("/api/price-forecast?commodity=Garlic&state=Madhya%20Pradesh&district=Mandsaur&days=5")
  console.log("\nTest 3 (Garlic, MP, Mandsaur): Status =", r3.status)
  console.log("  Price:", r3.json?.currentPrice, "Unit:", r3.json?.unit)
  console.log("  Last Observed:", r3.json?.lastObserved?.label)

  // Test 4: Sugarcane in Tonnes
  const r4 = await mockGet("/api/price-forecast?commodity=Sugarcane&state=Uttar%20Pradesh")
  console.log("\nTest 4 (Sugarcane, UP): Status =", r4.status)
  console.log("  Price:", r4.json?.currentPrice, "Unit:", r4.json?.unit)

  // Test 5: Unknown Crop
  const r5 = await mockGet("/api/price-forecast?commodity=SpaceCorn999")
  console.log("\nTest 5 (Invalid Crop): Status =", r5.status)
  console.log("  Error message:", r5.json?.error)

  if (r1.status === 200 && r2.status === 200 && r3.status === 200 && r4.status === 200 && r5.status === 503) {
    if (r1.json?.currentPrice !== r2.json?.currentPrice) {
      console.log("\n✅ ALL 5 SERVER ROUTE TESTS PASSED AND DISTRICT DIFFERENTIATION CONFIRMED!")
    } else {
      console.error("❌ Kolar and Bengaluru prices were identical")
      process.exit(1)
    }
  } else {
    console.error("❌ SERVER ROUTE TESTS FAILED")
    process.exit(1)
  }
}

run()
