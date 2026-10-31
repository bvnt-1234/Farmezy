import { createClient } from "@supabase/supabase-js"

const envUrl = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  ""
).trim()

const envKey = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  ""
).trim()

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  envUrl.startsWith("http") &&
  !envUrl.includes("your-project") &&
  !envKey.includes("your-anon-key")
)

const memoryStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null },
  setItem(k, v) { this._data[k] = String(v) },
  removeItem(k) { delete this._data[k] }
}

const defaultSeedUsers = [
  {
    id: "farmer-demo-uid",
    email: "farmer@farmezy.in",
    password: "farmer123",
    user_metadata: {
      role: "Farmer",
      name: "Ramesh Farmer",
      phone: "9876543210",
      location: "Bengaluru Rural",
      district: "Bengaluru Rural",
      state: "Karnataka",
      farmerId: "farmer-demo-1"
    },
    created_at: new Date().toISOString()
  },
  {
    id: "customer-demo-uid",
    email: "customer@farmezy.in",
    password: "customer123",
    user_metadata: {
      role: "Customer",
      name: "Priya Customer",
      phone: "9876543211",
      location: "Bengaluru South",
      district: "Bengaluru South",
      state: "Karnataka",
      customerId: "customer-demo-1"
    },
    created_at: new Date().toISOString()
  }
]

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage
  }
  return memoryStorage
}

function getStoredUsers() {
  try {
    const list = JSON.parse(getStorage().getItem("farmezy_supabase_users") || "[]")
    if (!Array.isArray(list) || list.length === 0) {
      saveStoredUsers(defaultSeedUsers)
      return [...defaultSeedUsers]
    }
    // Ensure default demo users exist
    let updated = false
    for (const demoUser of defaultSeedUsers) {
      if (!list.some(u => u.email?.toLowerCase() === demoUser.email.toLowerCase())) {
        list.push(demoUser)
        updated = true
      }
    }
    if (updated) saveStoredUsers(list)
    return list
  } catch {
    return [...defaultSeedUsers]
  }
}

function saveStoredUsers(users) {
  try {
    getStorage().setItem("farmezy_supabase_users", JSON.stringify(users))
  } catch {}
}

function getStoredSession() {
  try {
    return JSON.parse(getStorage().getItem("farmezy_supabase_session") || "null")
  } catch {
    return null
  }
}

function saveStoredSession(session) {
  try {
    if (session) {
      getStorage().setItem("farmezy_supabase_session", JSON.stringify(session))
    } else {
      getStorage().removeItem("farmezy_supabase_session")
    }
  } catch {}
}

const authListeners = new Set()

function createFallbackAuthClient() {
  return {
    async signUp({ email, password, options = {} }) {
      await new Promise(r => setTimeout(r, 100))
      const cleanEmail = (email || "").trim().toLowerCase()
      if (!cleanEmail) {
        return { data: { user: null, session: null }, error: { message: "Please provide a valid email address." } }
      }
      const users = getStoredUsers()
      const existing = users.find(u => u.email?.toLowerCase().trim() === cleanEmail)
      if (existing) {
        return {
          data: { user: null, session: null },
          error: { message: `An account with "${email}" already exists. Please choose "Sign In" to continue.` }
        }
      }
      const user = {
        id: "usr-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        email: cleanEmail,
        password: String(password),
        user_metadata: options.data || {},
        created_at: new Date().toISOString()
      }
      users.push(user)
      saveStoredUsers(users)
      const session = {
        access_token: "mock-token-" + Date.now(),
        user
      }
      saveStoredSession(session)
      authListeners.forEach(listener => listener("SIGNED_IN", session))
      return { data: { user, session }, error: null }
    },

    async signInWithPassword({ email, password }) {
      await new Promise(r => setTimeout(r, 100))
      const cleanEmail = (email || "").trim().toLowerCase()
      const cleanPassword = String(password ?? "")
      const users = getStoredUsers()
      const user = users.find(u => u.email?.toLowerCase().trim() === cleanEmail)
      if (!user) {
        return {
          data: { user: null, session: null },
          error: {
            message: `Account not found with email "${email}". Please switch to "Create Account" below to sign up in 1 step, or use Quick Demo Sign-In.`
          }
        }
      }
      if (user.password !== cleanPassword) {
        return {
          data: { user: null, session: null },
          error: { message: "Incorrect password for this account. Please try again." }
        }
      }
      const session = {
        access_token: "mock-token-" + Date.now(),
        user
      }
      saveStoredSession(session)
      authListeners.forEach(listener => listener("SIGNED_IN", session))
      return { data: { user, session }, error: null }
    },

    async updateUser({ data }) {
      await new Promise(r => setTimeout(r, 50))
      const session = getStoredSession()
      if (!session?.user) {
        return { data: { user: null }, error: { message: "No active session." } }
      }
      const users = getStoredUsers()
      const idx = users.findIndex(u => u.id === session.user.id || u.email?.toLowerCase() === session.user.email?.toLowerCase())
      if (idx !== -1) {
        users[idx].user_metadata = { ...users[idx].user_metadata, ...data }
        saveStoredUsers(users)
        session.user = { ...session.user, user_metadata: users[idx].user_metadata }
        saveStoredSession(session)
        authListeners.forEach(listener => listener("USER_UPDATED", session))
        return { data: { user: session.user }, error: null }
      }
      return { data: { user: session.user }, error: null }
    },

    async signOut() {
      saveStoredSession(null)
      authListeners.forEach(listener => listener("SIGNED_OUT", null))
      return { error: null }
    },

    async getSession() {
      const session = getStoredSession()
      return { data: { session }, error: null }
    },

    async getUser() {
      const session = getStoredSession()
      return { data: { user: session?.user || null }, error: null }
    },

    onAuthStateChange(callback) {
      authListeners.add(callback)
      const session = getStoredSession()
      if (session) {
        setTimeout(() => callback("SIGNED_IN", session), 0)
      }
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback)
            }
          }
        }
      }
    }
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(envUrl, envKey)
  : { auth: createFallbackAuthClient() }
