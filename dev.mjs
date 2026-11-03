import { spawn } from "node:child_process"

console.log("🌱 Starting Farmezy (Backend API + Frontend Dev Server)...")

const isWindows = process.platform === "win32"
const npmCmd = isWindows ? "npm.cmd" : "npm"

const backend = spawn("node", ["server.js"], {
  stdio: "inherit",
  shell: isWindows
})

const frontend = spawn(npmCmd, ["--prefix", "frontend", "run", "dev"], {
  stdio: "inherit",
  shell: isWindows
})

function cleanup() {
  console.log("\nShutting down Farmezy dev servers...")
  try { backend.kill() } catch (e) {}
  try { frontend.kill() } catch (e) {}
  process.exit(0)
}

process.on("SIGINT", cleanup)
process.on("SIGTERM", cleanup)

backend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Backend process exited with code ${code}`)
  }
})

frontend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Frontend process exited with code ${code}`)
  }
})
