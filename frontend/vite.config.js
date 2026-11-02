import { spawn } from "node:child_process"
import net from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../backend")

function isPortInUse(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: "127.0.0.1", port })
    socket.setTimeout(700)
    socket.once("connect", () => { socket.destroy(); resolve(true) })
    socket.once("timeout", () => { socket.destroy(); resolve(false) })
    socket.once("error", () => resolve(false))
  })
}

async function isFarmzyApiAvailable(port) {
  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(700) })
    if (health.ok && (await health.json()).service === "farmezy-api") return true
  } catch {}
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/listings`, { signal: AbortSignal.timeout(700) })
    return response.ok && Array.isArray((await response.json()).listings)
  } catch {
    return false
  }
}

function startOfficialPriceApi() {
  let apiProcess
  return {
    name: "start-official-price-api",
    async configureServer(server) {
      const apiPort = Number(process.env.API_PORT || 3001)
      if (await isPortInUse(apiPort)) {
        if (await isFarmzyApiAvailable(apiPort)) {
          console.log(`Reusing the existing Farmzy API on port ${apiPort}.`)
        } else {
          console.warn(`Port ${apiPort} is already occupied; not starting a duplicate API process.`)
        }
        return
      }

      apiProcess = spawn(process.execPath, ["server.js"], {
        cwd: backendDirectory,
        stdio: "inherit",
      })
      apiProcess.on("error", error => console.error("Could not start Farmzy API:", error.message))
      apiProcess.on("exit", code => {
        if (code) console.error(`Farmzy API exited with code ${code}.`)
      })
      server.httpServer?.once("close", () => {
        if (apiProcess && !apiProcess.killed) apiProcess.kill()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), startOfficialPriceApi()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
})
