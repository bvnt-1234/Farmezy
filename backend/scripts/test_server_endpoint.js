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

  // Test 1: ML Crop with state
  const r1 = await mockGet("/api/price-forecast?commodity=Tomato&state=Karnataka&days=7")
  console.log("Test 1 (Tomato, Karnataka): Status =", r1.status)
  console.log("  Model:", r1.json?.model)
  console.log("  Unit:", r1.json?.unit)
  console.log("  Predictions count:", r1.json?.predictions?.length)

  // Test 2: Fallback Crop (Garlic)
  const r2 = await mockGet("/api/price-forecast?commodity=Garlic&state=Madhya%20Pradesh&days=5")
  console.log("\nTest 2 (Garlic, MP): Status =", r2.status)
  console.log("  Model:", r2.json?.model)
  console.log("  Unit:", r2.json?.unit)
  console.log("  Predictions count:", r2.json?.predictions?.length)

  // Test 3: Sugarcane in Tonnes
  const r3 = await mockGet("/api/price-forecast?commodity=Sugarcane&state=Uttar%20Pradesh")
  console.log("\nTest 3 (Sugarcane, UP): Status =", r3.status)
  console.log("  Model:", r3.json?.model)
  console.log("  Unit:", r3.json?.unit)
  console.log("  Day 1 price:", r3.json?.predictions?.[0]?.price)

  // Test 4: Unknown Crop
  const r4 = await mockGet("/api/price-forecast?commodity=SpaceCorn999")
  console.log("\nTest 4 (Invalid Crop): Status =", r4.status)
  console.log("  Error message:", r4.json?.error)

  if (r1.status === 200 && r2.status === 200 && r3.status === 200 && r4.status === 503) {
    console.log("\n✅ ALL 4 SERVER ROUTE TESTS PASSED!")
  } else {
    console.error("❌ SERVER ROUTE TESTS FAILED")
    process.exit(1)
  }
}

run()
