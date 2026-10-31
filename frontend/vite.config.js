import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../backend")

function startOfficialPriceApi() {
  let apiProcess
  return {
    name: "start-official-price-api",
    configureServer(server) {
      apiProcess = spawn(process.execPath, ["server.js"], {
        cwd: backendDirectory,
        stdio: "inherit",
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
