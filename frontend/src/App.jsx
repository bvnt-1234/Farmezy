import { useEffect, useState, useRef } from "react"
import OfficialPrices from "./OfficialPrices.jsx"
import "./App.css"

const words = {
  English: ["Home", "Market prices", "Price outlook", "Find a mandi", "List your harvest", "Good morning", "A fairer market starts here."],
  "हिन्दी": ["होम", "मंडी भाव", "भाव का अनुमान", "मंडी खोजें", "फसल बेचें", "सुप्रभात", "बेहतर बाज़ार, बेहतर कमाई।"],
  "தமிழ்": ["முகப்பு", "சந்தை விலை", "விலை கணிப்பு", "சந்தையை காண்க", "விளைபொருள் பட்டியலிடு", "காலை வணக்கம்", "நியாயமான சந்தை இங்கே தொடங்குகிறது."]
}

function CropCameraCapture({ image, onCapture, onClear }) {
  const [isOpen, setIsOpen] = useState(false)
  const [facingMode, setFacingMode] = useState("environment")
  const [cameraError, setCameraError] = useState("")
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      return
    }

    let active = true
    setCameraError("")

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API is not supported by your browser.")
        }
        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          })
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        }
        if (!active) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      } catch (err) {
        if (active) {
          setCameraError(err.message || "Unable to access camera. Please allow camera permissions or upload a photo.")
        }
      }
    }

    initCamera()

    return () => {
      active = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [isOpen, facingMode])

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setIsOpen(false)
    setCameraError("")
  }

  const snapPhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    const maxDim = 800
    let w = video.videoWidth || 640
    let h = video.videoHeight || 480
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w)
        w = maxDim
      } else {
        w = Math.round((w * maxDim) / h)
        h = maxDim
      }
    }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
    onCapture(dataUrl)
    closeCamera()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const maxDim = 800
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          } else {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
        onCapture(dataUrl)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <div className="crop-photo-section">
      <label className="crop-photo-label">Harvest photo (optional)</label>
      {image ? (
        <div className="crop-photo-preview-card">
          <img src={image} alt="Crop preview" className="crop-preview-img" />
          <div className="crop-preview-info">
            <span className="crop-photo-badge">✓ Photo attached</span>
            <p>Customers will see this real photo of your harvest when browsing.</p>
            <div className="crop-preview-btns">
              <button type="button" className="btn-secondary-sm" onClick={() => setIsOpen(true)}>
                📸 Retake camera photo
              </button>
              <button type="button" className="btn-secondary-sm" onClick={() => fileInputRef.current?.click()}>
                📁 Choose from files
              </button>
              <button type="button" className="btn-danger-sm" onClick={onClear}>
                🗑️ Remove
              </button>
            </div>
          </div>
        </div>
      ) : isOpen ? (
        <div className="camera-viewfinder-box">
          <div className="camera-viewfinder-header">
            <span>📸 Live Camera Viewfinder</span>
            <button type="button" className="camera-close-x" onClick={closeCamera} aria-label="Close camera">×</button>
          </div>
          {cameraError ? (
            <div className="camera-error-msg">
              <p>{cameraError}</p>
              <button type="button" className="btn-secondary-sm" onClick={() => fileInputRef.current?.click()}>
                📁 Choose image file instead
              </button>
            </div>
          ) : (
            <>
              <div className="camera-video-container">
                <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                <div className="camera-reticle" />
              </div>
              <div className="camera-controls">
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={() => setFacingMode(prev => (prev === "environment" ? "user" : "environment"))}
                >
                  🔄 Switch Camera
                </button>
                <button type="button" className="camera-shutter-btn" onClick={snapPhoto}>
                  📸 Snap Crop Photo
                </button>
                <button type="button" className="btn-secondary-sm" onClick={closeCamera}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="camera-prompt-box">
          <div className="camera-prompt-content">
            <span className="camera-icon-badge">📷</span>
            <div>
              <b>Add a crop photo with Camera</b>
              <p>Take a live picture of your crops or upload an existing image from your device.</p>
            </div>
          </div>
          <div className="camera-prompt-buttons">
            <button type="button" className="btn-camera-primary" onClick={() => setIsOpen(true)}>
              📸 Open Camera
            </button>
            <button type="button" className="btn-camera-secondary" onClick={() => fileInputRef.current?.click()}>
              📁 Upload file
            </button>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  )
}

function App() {
  const [role, setRole] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const [listing, setListing] = useState(null)
  const [listings, setListings] = useState([])
  const [listingLoading, setListingLoading] = useState(false)
  const [listingError, setListingError] = useState("")
  const [deleteNotice, setDeleteNotice] = useState("")
  const [listingScope, setListingScope] = useState("my")
  const [cropImage, setCropImage] = useState(null)
  const [customerLocation, setCustomerLocation] = useState(null)
  const [orders, setOrders] = useState([])
  const [buyItem, setBuyItem] = useState(null)
  const [buyQuantity, setBuyQuantity] = useState("")
  const [orderLoading, setOrderLoading] = useState(false)
  const [page, setPage] = useState("Home")
  const [lang, setLang] = useState("English")
  const [listed, setListed] = useState(false)
  const [chat, setChat] = useState(false)
  const [msg, setMsg] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [messages, setMessages] = useState(["Namaste 👋 I can help you check official mandi prices, find a mandi, or understand how Farmezy works."])

  useEffect(() => {
    if (!role) return
    setListingLoading(true)
    fetch("/api/listings")
      .then(response => response.json().then(data => {
        if (!response.ok) throw new Error(data.error || "Could not load listings.")
        setListings(Array.isArray(data.listings) ? data.listings : [])
      }))
      .catch(error => setListingError(error.message))
      .finally(() => setListingLoading(false))
  }, [role])

  const farmerId = profile?.farmerId || profile?.phone?.replace(/\D/g, "") || profile?.name || "farmer"
  const customerId = profile?.customerId || profile?.phone?.replace(/\D/g, "") || profile?.name || "customer"

  const loadOrders = async () => {
    try {
      const params = role === "Farmer" ? "farmerId=" + encodeURIComponent(farmerId) : "customerId=" + encodeURIComponent(customerId)
      const response = await fetch("/api/orders?" + params)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not load orders.")
      setOrders(Array.isArray(data.orders) ? data.orders.map(order => ({ ...order, status: order.status === "new" ? "Requested" : order.status })) : [])
    } catch (error) {
      setListingError(error.message)
    }
  }

  useEffect(() => {
    if (role) {
      loadOrders()
    }
  }, [role])

  const deleteListing = async (id, cropName) => {
    if (!window.confirm(`Are you sure you want to delete the listing for "${cropName}"? This action cannot be undone.`)) {
      return
    }
    setListingLoading(true)
    setListingError("")
    try {
      const response = await fetch("/api/listings/" + id, { method: "DELETE" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not delete listing.")
      setListings(prev => prev.filter(item => String(item.id) !== String(id)))
      if (listing?.id === id) {
        setListing(null)
        setListed(false)
      }
      setDeleteNotice(`Listing for "${cropName}" was deleted successfully.`)
      setTimeout(() => setDeleteNotice(""), 4500)
    } catch (error) {
      setListingError(error.message)
    } finally {
      setListingLoading(false)
    }
  }

  const locateCustomer = () => {
    if (!navigator.geolocation) {
      setListingError("Location is not supported by this browser.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        setListingError("")
        setCustomerLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      () => setListingError("Location access was blocked. You can still browse and contact farmers.")
    )
  }

  const distanceKm = (lat1, lng1, lat2, lng2) => {
    if ([lat1, lng1, lat2, lng2].some(value => value === undefined || value === null || value === "")) return null
    const R = 6371
    const toRad = value => value * Math.PI / 180
    const dLat = toRad(Number(lat2) - Number(lat1))
    const dLng = toRad(Number(lng2) - Number(lng1))
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const contactPhone = item => item?.farmerPhone || item?.contact?.phone || item?.contact?.whatsapp || item?.phone || ""
  const whatsappNumber = phone => {
    let digits = String(phone || "").replace(/\D/g, "")
    if (!digits) return ""
    if (digits.startsWith("00")) digits = digits.slice(2)
    if (digits.startsWith("91") && digits.length === 12) return digits
    if (digits.length === 10) return "91" + digits
    return digits
  }
  const whatsappUrl = (phone, text = "") => {
    const number = whatsappNumber(phone)
    return number ? "https://wa.me/" + number + (text ? "?text=" + encodeURIComponent(text) : "") : ""
  }
  const phoneUrl = phone => {
    const digits = String(phone || "").replace(/\D/g, "")
    if (!digits) return ""
    return digits.length === 10 ? "tel:+91" + digits : digits.startsWith("91") ? "tel:+" + digits : "tel:+" + digits
  }
  const routeUrl = item => {
    const hasCoords = item.farmerLat !== undefined && item.farmerLat !== "" && item.farmerLng !== undefined && item.farmerLng !== ""
    const destination = hasCoords ? encodeURIComponent(String(item.farmerLat) + "," + String(item.farmerLng)) : encodeURIComponent(String(item.address || ""))
    if (!destination) return ""
    const origin = customerLocation ? encodeURIComponent(customerLocation.lat + "," + customerLocation.lng) : "Current+Location"
    return "https://www.google.com/maps/dir/?api=1&origin=" + origin + "&destination=" + destination + "&travelmode=driving"
  }

  if (!role) {
    if (!selectedRole) return <RoleChooser onChoose={setSelectedRole} lang={lang} setLang={setLang} />
    return (
      <ProfileSetup
        role={selectedRole}
        lang={lang}
        setLang={setLang}
        onBack={() => setSelectedRole(null)}
        onSave={data => {
          localStorage.setItem("farmezyProfile-" + selectedRole, JSON.stringify(data))
          setProfile(data)
          setRole(selectedRole)
          setSelectedRole(null)
        }}
      />
    )
  }

  const myListings = listings.filter(item =>
    item.farmerId === farmerId ||
    (profile?.phone && item.farmerPhone && String(item.farmerPhone).replace(/\D/g, "") === String(profile.phone).replace(/\D/g, "")) ||
    (profile?.name && item.farmerName && item.farmerName.trim().toLowerCase() === profile.name.trim().toLowerCase())
  )

  const displayedFarmerListings = listingScope === "all" ? listings : myListings

  const w = words[lang]
  const nav = [
    [w[0], "Home", "⌂"],
    [w[1], "Prices", "↗"],
    ...(role === "Farmer" ? [[w[2], "Forecast", "◷"]] : []),
    [w[3], "Mandi", "⌖"],
    ...(role === "Farmer" ? [[w[4], "Sell", "+"]] : [["Browse produce", "Browse", "🧺"]]),
    ...(role === "Farmer" ? [["Requests", "Requests", "✓"]] : [["My requests", "Orders", "▣"]])
  ]

  const askPrice = async question => {
    const text = question.trim()
    if (!text) return
    setMessages(current => [...current, text])
    setChatLoading(true)
    const reply = await getOfficialPriceAnswer(text, profile)
    setMessages(current => [...current, reply])
    setChatLoading(false)
  }

  const updateOrder = async (id, status) => {
    try {
      const response = await fetch("/api/orders/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not update order.")
      setOrders(current => current.map(order => order.id === id ? data.order : order))
    } catch (error) {
      setListingError(error.message)
    }
  }

  const send = e => {
    e.preventDefault()
    const question = msg.trim()
    if (!question) return
    setMsg("")
    askPrice(question)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); setPage("Home") }}>
          <span className="brand-mark">f</span>farmezy<span className="brand-dot">.</span>
        </a>
        <div className="side-label">YOUR WORKSPACE</div>
        <div className="role-switch">
          <button className={role === "Farmer" ? "active" : ""} onClick={() => { setProfile(readProfile("Farmer")); setRole("Farmer"); setPage("Home") }}>
            🌾 Farmer
          </button>
          <button className={role === "Customer" ? "active" : ""} onClick={() => { setProfile(readProfile("Customer")); setRole("Customer"); setPage("Home") }}>
            🧺 Customer
          </button>
        </div>
        <div className="side-label menu-label">MENU</div>
        <nav>
          {nav.map(([label, id, icon]) => (
            <button key={id} className={page === id ? "selected" : ""} onClick={() => setPage(id)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <b>✳ &nbsp; Here to help</b>
            <p>Ask Farmezy about your crops.</p>
            <button onClick={() => setChat(true)}>Chat with us ↗</button>
          </div>
          <div className="profile">
            <span className="avatar">{role === "Farmer" ? "RK" : "AS"}</span>
            <span>
              <b>{profile?.name || role}</b>
              <small>{profile?.location || profile?.district || "Set your location"}</small>
            </span>
            <span className="dots">···</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>Workspace <span>/</span> <b>{page === "Home" ? w[0] : nav.find(n => n[1] === page)?.[0]}</b></div>
          <div className="top-tools">
            <select value={lang} onChange={e => setLang(e.target.value)} aria-label="Language">
              {Object.keys(words).map(x => <option key={x}>{x}</option>)}
            </select>
            <button className="bell">♧</button>
            <span className="avatar">RK</span>
          </div>
        </header>

        <div className="page">
          {page === "Home" && (
            <>
              <div className="welcome">
                <div>
                  <div className="eyebrow">{w[5]}, {profile?.name || (role === "Farmer" ? "Farmer" : "Customer")} *</div>
                  <h1>{role === "Farmer" ? "Your harvest, your business." : "Find fresh crops from Indian mandis."}</h1>
                  <p>{role === "Farmer" ? "Add the crops you are selling with camera photos, then check official market prices across India." : "Browse daily reported mandi prices from the Government of India."}</p>
                </div>
              </div>

              {deleteNotice && <div className="delete-notification">✓ {deleteNotice}</div>}

              <section className="workspace-hero">
                <div>
                  <span className="hero-tag">{role === "Farmer" ? "FARMER WORKSPACE" : "CUSTOMER MARKETPLACE"}</span>
                  <h2>{role === "Farmer" ? "Ready to list a crop?" : "Find the right market price."}</h2>
                  <p>
                    {role === "Farmer"
                      ? "Add crop, photo from your camera, variety, quantity, price, harvest date, and pickup location. Your listings are saved to the Farmezy server so customers can browse them."
                      : "Search reported commodity prices by state, district, and mandi. Rates are shown as reported by AGMARKNET."}
                  </p>
                  <button onClick={() => setPage(role === "Farmer" ? "Sell" : "Browse")}>
                    {role === "Farmer" ? "Add crops for sale" : "Browse farmer produce"} →
                  </button>
                </div>
                <span className="workspace-art">{role === "Farmer" ? "🌾" : "🧺"}</span>
              </section>

              {role === "Farmer" ? (
                <section className="panel inventory-preview">
                  <div className="panel-head">
                    <div>
                      <h3>My crop listings</h3>
                      <p>{myListings.length} crop{myListings.length === 1 ? "" : "s"} on your account</p>
                    </div>
                    <button className="link" onClick={() => setPage("Sell")}>Manage & delete listings →</button>
                  </div>
                  {myListings.length ? (
                    myListings.slice(0, 4).map(item => (
                      <div className="saved-row-with-action" key={item.id}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {item.image ? (
                            <img src={item.image} alt={item.crop} style={{ width: 28, height: 28, borderRadius: 5, objectFit: "cover" }} />
                          ) : (
                            <span>🌾</span>
                          )}
                          <b>{item.crop}</b>
                        </span>
                        <span>{item.variety || "—"}</span>
                        <span>{item.quantity} {item.unit}</span>
                        <strong>₹{item.price}/{item.unit}</strong>
                        <span>{item.address}</span>
                        <button
                          type="button"
                          className="btn-delete-sm"
                          title="Delete this listing"
                          onClick={() => deleteListing(item.id, item.crop)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="empty-list">You have not added crops yet. Use Add crops for sale to create your first listing.</p>
                  )}
                </section>
              ) : (
                <section className="panel customer-prompt">
                  <h3>Official market data from across India</h3>
                  <p>See reported min, modal, and max wholesale prices for the commodity and mandi you choose.</p>
                  <button className="link" onClick={() => setPage("Prices")}>Search state, district & mandi →</button>
                </section>
              )}
              <OfficialPrices location={profile} preview onViewAll={() => setPage("Prices")} />
            </>
          )}

          {page === "Prices" && <OfficialPrices location={profile} />}

          {page === "Browse" && (
            <>
              <Title eyebrow="FARMER MARKETPLACE" title="Browse fresh produce." sub="See crops currently listed by farmers on Farmezy." />
              {deleteNotice && <div className="delete-notification">✓ {deleteNotice}</div>}
              <section className="panel location-panel">
                <div className="panel-head">
                  <div>
                    <h3>📍 Delivery & route</h3>
                    <p>Allow location to see how far each farmer is from you and open the best driving route.</p>
                  </div>
                  <button className="link" onClick={locateCustomer}>{customerLocation ? "Location enabled ✓" : "Use my location"}</button>
                </div>
                {customerLocation && <p className="note">Your location is ready. Distances are calculated from your current position.</p>}
              </section>
              {listingError && (
                <section className="official-error">
                  <b>Could not load farmer listings.</b>
                  <p>{listingError}</p>
                </section>
              )}
              {listingLoading ? (
                <section className="panel no-demo"><p>Loading farmer listings…</p></section>
              ) : listings.length ? (
                <section className="panel farmer-listings">
                  <div className="panel-head">
                    <div>
                      <h3>Available from farmers</h3>
                      <p>{listings.length} listing{listings.length === 1 ? "" : "s"} available</p>
                    </div>
                  </div>
                  {listings.map(item => {
                    const km = distanceKm(customerLocation?.lat, customerLocation?.lng, item.farmerLat, item.farmerLng)
                    const isOwner = item.farmerId === farmerId || (profile?.phone && item.farmerPhone && String(item.farmerPhone).replace(/\D/g, "") === String(profile.phone).replace(/\D/g, ""))
                    return (
                      <article className="listing-card" key={item.id}>
                        {item.image && (
                          <div className="listing-photo-thumb">
                            <img src={item.image} alt={item.crop} />
                          </div>
                        )}
                        <div>
                          <small>CROP</small>
                          <b>{item.crop}</b>
                          <span>{item.variety || "Variety not specified"}</span>
                        </div>
                        <div>
                          <small>AVAILABLE</small>
                          <b>{item.quantity} {item.unit}</b>
                          <span>{item.date || "Ready date not specified"}</span>
                        </div>
                        <div>
                          <small>ASKING PRICE</small>
                          <b>₹{item.price} / {item.unit}</b>
                          <span>Listed by {item.farmerName}</span>
                        </div>
                        <div>
                          <small>FARMER / PICKUP</small>
                          <b>{item.address}</b>
                          <span>{contactPhone(item) ? "📞 " + contactPhone(item) : "Contact details unavailable"}</span>
                          {km !== null && <span>📍 {km.toFixed(1)} km away</span>}
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                            <button onClick={() => { setBuyItem(item); setBuyQuantity("") }}>Buy / Request</button>
                            {contactPhone(item) && phoneUrl(contactPhone(item)) && (
                              <a href={phoneUrl(contactPhone(item))} className="link">📞 Call</a>
                            )}
                            {contactPhone(item) && whatsappUrl(contactPhone(item)) && (
                              <a href={whatsappUrl(contactPhone(item))} target="_blank" rel="noopener noreferrer" className="link">WhatsApp</a>
                            )}
                            {routeUrl(item) && (
                              <a href={routeUrl(item)} target="_blank" rel="noopener noreferrer" className="link">Best route ↗</a>
                            )}
                            {(role === "Farmer" || isOwner) && (
                              <button
                                type="button"
                                className="btn-delete-sm"
                                title="Delete this listing"
                                onClick={() => deleteListing(item.id, item.crop)}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </section>
              ) : (
                <section className="panel no-demo">
                  <h3>No farmer listings yet</h3>
                  <p>Once a farmer adds a crop, it will appear here for customers.</p>
                </section>
              )}
              {buyItem && (
                <section className="panel form-panel request-panel">
                  <h3>Request {buyItem.crop}</h3>
                  <p>Farmer: <b>{buyItem.farmerName}</b> · ₹{buyItem.price}/{buyItem.unit}</p>
                  <label>
                    How much do you want?
                    <input
                      type="number"
                      min="1"
                      max={buyItem.quantity}
                      value={buyQuantity}
                      onChange={e => setBuyQuantity(e.target.value)}
                      placeholder={"Quantity in " + buyItem.unit}
                    />
                  </label>
                  <div className="form-foot">
                    <small>Farmezy currently connects you directly with the farmer; payment can be added next.</small>
                    <button
                      disabled={!buyQuantity || orderLoading}
                      onClick={async () => {
                        setOrderLoading(true)
                        try {
                          const response = await fetch("/api/orders", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              listingId: buyItem.id,
                              crop: buyItem.crop,
                              unit: buyItem.unit,
                              price: buyItem.price,
                              quantity: buyQuantity,
                              availableQuantity: buyItem.quantity,
                              farmerId: buyItem.farmerId,
                              farmerName: buyItem.farmerName,
                              farmerPhone: buyItem.farmerPhone,
                              customerId,
                              customerName: profile?.name || "Customer",
                              customerPhone: profile?.phone || "",
                              customerLocation: profile?.location || ""
                            })
                          })
                          const data = await response.json()
                          if (!response.ok) throw new Error(data.error || "Could not create request.")
                          await loadOrders()
                          const text = "Hi " + buyItem.farmerName + ", I requested " + buyQuantity + " " + buyItem.unit + " of your " + buyItem.crop + " on Farmezy. Request ID: " + data.order.id
                          const url = whatsappUrl(buyItem.farmerPhone, text)
                          if (!url) {
                            alert("Request saved, but this farmer has not added a valid WhatsApp number yet.")
                          } else {
                            window.location.href = url
                          }
                          setBuyItem(null)
                          setBuyQuantity("")
                        } catch (error) {
                          setListingError(error.message)
                        } finally {
                          setOrderLoading(false)
                        }
                      }}
                    >
                      Send request on WhatsApp →
                    </button>
                    <button className="link" onClick={() => setBuyItem(null)}>Cancel</button>
                  </div>
                </section>
              )}
            </>
          )}

          {page === "Requests" && (
            <>
              <Title eyebrow="FARMER ORDERS" title="Customer requests." sub="Manage requests from customers who want to buy your crops." />
              <section className="panel farmer-listings">
                {orders.length ? (
                  orders.map(order => (
                    <article className="listing-card" key={order.id}>
                      <div>
                        <small>CROP</small>
                        <b>{order.crop}</b>
                        <span>{order.quantity} {order.unit} · ₹{order.price}/{order.unit}</span>
                      </div>
                      <div>
                        <small>CUSTOMER</small>
                        <b>{order.customerName}</b>
                        <span>{order.customerPhone || "Phone not provided"}</span>
                      </div>
                      <div>
                        <small>STATUS</small>
                        <b>{order.status}</b>
                        <span>{formatIndiaTime(order.createdAt)}</span>
                      </div>
                      <div>
                        <small>ACTIONS</small>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {order.status === "Requested" && (
                            <>
                              <button onClick={() => updateOrder(order.id, "Accepted")}>Accept</button>
                              <button onClick={() => updateOrder(order.id, "Rejected")}>Reject</button>
                            </>
                          )}
                          {order.status === "Accepted" && <button onClick={() => updateOrder(order.id, "Ready")}>Mark ready</button>}
                          {order.status === "Ready" && <button onClick={() => updateOrder(order.id, "Completed")}>Complete</button>}
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="empty-list">No customer requests yet.</p>
                )}
              </section>
            </>
          )}

          {page === "Orders" && (
            <>
              <Title eyebrow="MY REQUESTS" title="Track your purchases." sub="See requests you have sent to farmers." />
              <section className="panel farmer-listings">
                {orders.length ? (
                  orders.map(order => (
                    <article className="listing-card" key={order.id}>
                      <div>
                        <small>CROP</small>
                        <b>{order.crop}</b>
                        <span>{order.quantity} {order.unit} · ₹{order.price}/{order.unit}</span>
                      </div>
                      <div>
                        <small>FARMER</small>
                        <b>{order.farmerName}</b>
                        <span>{order.farmerPhone || "Phone not provided"}</span>
                      </div>
                      <div>
                        <small>STATUS</small>
                        <b>{order.status}</b>
                        <span>Request #{order.id}</span>
                      </div>
                      <div>
                        <small>CONTACT</small>
                        {order.farmerPhone && (
                          <a href={whatsappUrl(order.farmerPhone)} target="_blank" rel="noreferrer" className="link">WhatsApp farmer ↗</a>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="empty-list">You have not requested any crops yet. Browse farmer produce to start.</p>
                )}
              </section>
            </>
          )}

          {page === "Forecast" && (
            <>
              <Title eyebrow="PRICE FORECAST" title="Predict the next mandi price." sub="Farmezy trains on official AGMARKNET observations collected from the Government of India feed. No sample prices are used." />
              <PriceForecast location={profile} onPrices={() => setPage("Prices")} />
            </>
          )}

          {page === "Mandi" && (
            <>
              <Title eyebrow="INDIA-WIDE MARKET DATA" title="Explore reported mandis." sub="Filter the Government of India daily market-price feed by commodity, state, district, and mandi." />
              <section className="panel no-demo">
                <h3>Official mandi reports</h3>
                <p>Farmezy does not estimate transport charges or calculate net returns yet. Compare the reported wholesale prices and confirm logistics directly with the mandi.</p>
                <button className="link" onClick={() => setPage("Prices")}>Browse official prices →</button>
              </section>
            </>
          )}

          {page === "Sell" && (
            <>
              <Title eyebrow="FARMER SELLING SPACE" title="Manage your crop listings." sub="Add each crop separately with its own photo, quantity, price, harvest date, and pickup location." />
              {listingError && (
                <section className="official-error">
                  <b>Action failed.</b>
                  <p>{listingError}</p>
                </section>
              )}
              {deleteNotice && <div className="delete-notification">✓ {deleteNotice}</div>}

              {listed && (
                <section className="success">
                  <h2>✓ &nbsp; Crop saved in your listings</h2>
                  {listing?.image && (
                    <div style={{ margin: "14px 0" }}>
                      <img src={listing.image} alt={listing.crop} style={{ width: 120, height: 120, borderRadius: 8, objectFit: "cover" }} />
                    </div>
                  )}
                  <p>{listing?.crop} · {listing?.quantity} {listing?.unit} · ₹{listing?.price}/{listing?.unit}</p>
                  <button onClick={() => { setListed(false); setCropImage(null) }}>Add another crop</button>
                </section>
              )}

              {!listed && (
                <section className="panel form-panel">
                  <h3>Add a crop for sale</h3>
                  <p>Enter the details buyers need to understand what is available, and take a real photo using your camera.</p>
                  <form
                    onSubmit={async e => {
                      e.preventDefault()
                      setListingError("")
                      setListingLoading(true)
                      const form = e.currentTarget
                      const data = Object.fromEntries(new FormData(form))
                      const saveListing = async coords => {
                        const item = {
                          ...data,
                          image: cropImage || "",
                          farmerId,
                          farmerName: profile?.name || "Farmer",
                          farmerPhone: profile?.phone || "",
                          farmerLocation: profile?.location || "",
                          farmerDistrict: profile?.district || "",
                          farmerState: profile?.state || "",
                          farmerLat: coords?.lat || "",
                          farmerLng: coords?.lng || ""
                        }
                        try {
                          const response = await fetch("/api/listings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(item)
                          })
                          const result = await response.json()
                          if (!response.ok) throw new Error(result.error || "Could not save listing.")
                          setListing(result.listing)
                          setListings(prev => [result.listing, ...prev])
                          setListed(true)
                          setCropImage(null)
                          form.reset()
                        } catch (error) {
                          setListingError(error.message)
                        } finally {
                          setListingLoading(false)
                        }
                      }
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          position => saveListing({ lat: position.coords.latitude, lng: position.coords.longitude }),
                          () => saveListing(null)
                        )
                      } else {
                        saveListing(null)
                      }
                    }}
                  >
                    <div className="form-grid">
                      <label>
                        Crop name
                        <input name="crop" required placeholder="e.g. Tomato" />
                      </label>
                      <label>
                        Variety / grade
                        <input name="variety" placeholder="e.g. Local · Grade A" />
                      </label>
                      <label>
                        Available quantity
                        <input name="quantity" type="number" min="1" required placeholder="250" />
                      </label>
                      <label>
                        Unit
                        <select name="unit">
                          <option>kg</option>
                          <option>quintal</option>
                          <option>tonne</option>
                          <option>crate</option>
                        </select>
                      </label>
                      <label>
                        Your asking price (₹ / selected unit)
                        <input name="price" min="1" step="0.01" required type="number" placeholder="32" />
                      </label>
                      <label>
                        Harvest / ready date
                        <input name="date" type="date" />
                      </label>

                      {/* Camera Photo Component */}
                      <CropCameraCapture
                        image={cropImage}
                        onCapture={dataUrl => setCropImage(dataUrl)}
                        onClear={() => setCropImage(null)}
                      />

                      <label className="wide">
                        Pickup address
                        <input name="address" required placeholder="Village, district, state" />
                      </label>
                      <label className="wide">
                        Notes for buyers
                        <textarea name="notes" placeholder="Freshness, delivery, minimum order…" />
                      </label>
                    </div>
                    <div className="form-foot">
                      <small>Listing with your photo will be saved to the Farmezy backend and visible to customers.</small>
                      <button disabled={listingLoading}>{listingLoading ? "Saving…" : "Save crop listing →"}</button>
                    </div>
                  </form>
                </section>
              )}

              {listings.length > 0 && (
                <section className="panel farmer-listings">
                  <div className="panel-head">
                    <div>
                      <h3>Manage crop listings</h3>
                      <p>{displayedFarmerListings.length} listing{displayedFarmerListings.length === 1 ? "" : "s"} shown</p>
                    </div>
                    <div className="listing-tabs">
                      <button
                        type="button"
                        className={listingScope === "my" ? "active" : ""}
                        onClick={() => setListingScope("my")}
                      >
                        My crops ({myListings.length})
                      </button>
                      <button
                        type="button"
                        className={listingScope === "all" ? "active" : ""}
                        onClick={() => setListingScope("all")}
                      >
                        All farmer listings ({listings.length})
                      </button>
                    </div>
                  </div>

                  {displayedFarmerListings.length === 0 ? (
                    <p className="empty-list">No crops found in this view.</p>
                  ) : (
                    displayedFarmerListings.map(item => (
                      <article className="listing-card" key={item.id}>
                        {item.image && (
                          <div className="listing-photo-thumb">
                            <img src={item.image} alt={item.crop} />
                          </div>
                        )}
                        <div>
                          <small>CROP</small>
                          <b>{item.crop}</b>
                          <span>{item.variety || "Variety not specified"}</span>
                        </div>
                        <div>
                          <small>AVAILABLE</small>
                          <b>{item.quantity} {item.unit}</b>
                          <span>{item.date || "Ready date not specified"}</span>
                        </div>
                        <div>
                          <small>ASKING PRICE</small>
                          <b>₹{item.price} / {item.unit}</b>
                          <span>{item.farmerName ? "Farmer: " + item.farmerName : "Farmer set price"}</span>
                        </div>
                        <div>
                          <small>PICKUP</small>
                          <b>{item.address}</b>
                          <span>{item.notes || "No additional notes"}</span>
                          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                            <button
                              type="button"
                              className="btn-delete"
                              onClick={() => deleteListing(item.id, item.crop)}
                            >
                              🗑️ Delete listing
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </section>
              )}
            </>
          )}

          <footer className="footer">
            <span>© 2026 Farmezy</span>
            <span>Grown with care, shared with trust ✳</span>
            <button onClick={() => setChat(true)}>Need a hand? <b>Chat with us ↗</b></button>
          </footer>
        </div>
      </main>

      <button className="chat-launch" aria-label="Open Farmezy assistant" onClick={() => setChat(!chat)}>
        {chat ? "×" : "✳"}
      </button>

      {chat && (
        <div className="chat-box">
          <header>
            <div>
              <b>✳ &nbsp; Farmezy assistant</b>
              <small>Official prices + marketplace help</small>
            </div>
            <button onClick={() => setChat(false)}>×</button>
          </header>
          <div className="chat-messages">
            <div className="chat-intro">
              <b>Hi {profile?.name || "there"} 👋</b>
              <span>Ask me about mandi prices, crops, or finding a market.</span>
            </div>
            {messages.map((m, i) => (
              <p className={i % 2 ? "user-message" : "assistant-message"} key={i}>{m}</p>
            ))}
            {chatLoading && <p className="assistant-message typing">Checking official data…</p>}
            <div className="chat-actions">
              <button onClick={() => askPrice("What is today's tomato price?")}>🍅 Tomato price</button>
              <button onClick={() => askPrice("What is today's onion price?")}>🧅 Onion price</button>
              <button onClick={() => setPage("Mandi")}>⌖ Find a mandi</button>
              <button onClick={() => setPage(role === "Farmer" ? "Sell" : "Browse")}>
                {role === "Farmer" ? "🌾 Sell a crop" : "🧺 Browse produce"}
              </button>
            </div>
          </div>
          <form onSubmit={send}>
            <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Try: tomato price in Karnataka…" />
            <button disabled={chatLoading} aria-label="Send">{chatLoading ? "…" : "↑"}</button>
          </form>
        </div>
      )}
    </div>
  )
}

function RoleChooser({ onChoose, lang, setLang }) {
  return (
    <main className="role-entry">
      <header>
        <a className="brand" href="#"><span className="brand-mark">f</span>farmezy<span className="brand-dot">.</span></a>
        <label>
          Language
          <select value={lang} onChange={e => setLang(e.target.value)}>
            {Object.keys(words).map(x => <option key={x}>{x}</option>)}
          </select>
        </label>
      </header>
      <section>
        <div className="eyebrow">A FAIRER WAY TO TRADE</div>
        <h1>Welcome to Farmezy.</h1>
        <p>Choose your space, then tell us who you are and where you are based to see local prices first.</p>
        <div className="role-cards">
          <article>
            <span>🌾</span>
            <small>FOR FARMERS & GROWERS</small>
            <h2>Sell your harvest.</h2>
            <p>Manage your crop listings, take camera photos of produce, and check official mandi rates in your area.</p>
            <button onClick={() => onChoose("Farmer")}>Continue as Farmer <b>→</b></button>
          </article>
          <article>
            <span>🧺</span>
            <small>FOR CUSTOMERS & BUYERS</small>
            <h2>Buy fresh, locally.</h2>
            <p>Find vegetables, real farm produce photos, and official wholesale prices near your home.</p>
            <button onClick={() => onChoose("Customer")}>Continue as Customer <b>→</b></button>
          </article>
        </div>
      </section>
      <footer>Grown with care, shared with trust ✳</footer>
    </main>
  )
}

function ProfileSetup({ role, lang, setLang, onBack, onSave }) {
  const [form, setForm] = useState(() => readProfile(role))
  const [error, setError] = useState("")

  function submit(e) {
    e.preventDefault()
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number.")
      return
    }
    onSave({
      ...form,
      ...(role === "Farmer" ? { farmerId: form.farmerId || ("farmer-" + Date.now()) } : { customerId: form.customerId || ("customer-" + Date.now()) })
    })
  }

  return (
    <main className="role-entry">
      <header>
        <a className="brand" href="#"><span className="brand-mark">f</span>farmezy<span className="brand-dot">.</span></a>
        <label>
          Language
          <select value={lang} onChange={e => setLang(e.target.value)}>
            {Object.keys(words).map(x => <option key={x}>{x}</option>)}
          </select>
        </label>
      </header>
      <section className="profile-entry">
        <button className="back-link" onClick={onBack}>← Change role</button>
        <div className="eyebrow">{role === "Farmer" ? "FARMER PROFILE" : "CUSTOMER PROFILE"}</div>
        <h1>Set up your local profile.</h1>
        <p>We will remember these details in this browser and use your area to preselect mandi prices next time.</p>
        <form className="profile-form" onSubmit={submit}>
          <label>
            Your name
            <input required value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </label>
          <label>
            Phone number
            <input required type="tel" inputMode="numeric" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" />
          </label>
          <label>
            Village / town or PIN code
            <input required value={form.location || ""} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Velachery or 600042" />
          </label>
          <label>
            District
            <input required value={form.district || ""} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="Your district" />
          </label>
          <label className="profile-state">
            State / Union Territory
            <select required value={form.state || ""} onChange={e => setForm({ ...form, state: e.target.value })}>
              <option value="">Choose your state</option>
              {profileStates.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          {error && <p className="profile-error">{error}</p>}
          <button className="profile-submit">Continue to {role === "Farmer" ? "Farmer workspace" : "Customer marketplace"} →</button>
        </form>
        <small className="profile-privacy">Your name, phone, and location are saved only in this browser for now.</small>
      </section>
      <footer>Grown with care, shared with trust ✳</footer>
    </main>
  )
}

function readProfile(role) {
  try {
    return JSON.parse(localStorage.getItem("farmezyProfile-" + role) || "{}")
  } catch {
    return {}
  }
}

const profileStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

function formatIndiaTime(value) {
  if (!value) return "Time unavailable"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Time unavailable"
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(date)
}

function Title({ eyebrow, title, sub }) {
  return (
    <div className="page-title">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{sub}</p>
    </div>
  )
}

const commodityAliases = [
  { name: "Tomato", aliases: ["tomato", "tamatar"] },
  { name: "Onion", aliases: ["onion", "pyaz"] },
  { name: "Potato", aliases: ["potato", "aloo"] },
  { name: "Green Chilli", aliases: ["chilli", "chili", "mirchi"] },
  { name: "Brinjal", aliases: ["brinjal", "eggplant", "baingan"] },
  { name: "Cabbage", aliases: ["cabbage", "patta"] }
]

function editDistance(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= right.length; j++) {
      const current = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[right.length]
}

function findCommodity(message) {
  const wordsList = message.toLowerCase().match(/[a-z]+/g) || []
  for (const commodity of commodityAliases) {
    if (wordsList.some(word => commodity.aliases.some(alias => word === alias || editDistance(word, alias) <= 2))) {
      return commodity.name
    }
  }
  return null
}

const stateAliases = {
  ap: "Andhra Pradesh", ar: "Arunachal Pradesh", as: "Assam", br: "Bihar", cg: "Chhattisgarh",
  dl: "Delhi", ga: "Goa", gj: "Gujarat", hr: "Haryana", hp: "Himachal Pradesh", jh: "Jharkhand",
  ka: "Karnataka", kl: "Kerala", mp: "Madhya Pradesh", mh: "Maharashtra", od: "Odisha",
  pb: "Punjab", rj: "Rajasthan", tn: "Tamil Nadu", ts: "Telangana", up: "Uttar Pradesh",
  uk: "Uttarakhand", wb: "West Bengal"
}

function findState(message) {
  const lower = message.toLowerCase()
  const full = profileStates.find(state => lower.includes(state.toLowerCase()))
  if (full) return full
  const wordsList = lower.match(/[a-z]+/g) || []
  return wordsList.map(word => stateAliases[word]).find(Boolean) || null
}

function cleanStateRecords(records, state) {
  return state ? records.filter(record => String(record.state || "").toLowerCase() === state.toLowerCase()) : records
}

async function getOfficialPriceAnswer(question, profile) {
  const q = question.toLowerCase().trim()
  if (/how.*(sell|list)|list.*crop|sell.*crop/.test(q)) {
    return "To sell on Farmezy: open List your harvest → take a live photo of your crop with camera → add quantity, unit, price, and pickup address → save it. Customers can then see your crop and photo and send a request."
  }
  if (/how.*(buy|request)|request.*crop|buy.*crop/.test(q)) {
    return "To buy: open Browse produce → choose a farmer → select Buy / Request → enter the quantity. Farmezy saves the request and can open WhatsApp so you can contact the farmer."
  }
  if (/whatsapp|contact.*farmer|call.*farmer/.test(q)) {
    return "Open Browse produce and use WhatsApp or Call on a farmer's listing. A valid mobile number is required for direct WhatsApp contact."
  }
  if (/find.*mandi|near.*mandi|mandi.*near/.test(q)) {
    return "Open Find a mandi to explore the official mandi-price area. You can also use the Market prices page to filter by state, district, mandi and commodity."
  }
  const commodity = findCommodity(question)
  if (!commodity) return "I can help with official crop prices, finding a mandi, selling a crop, or requesting produce. Try: “tomato price in Karnataka”."
  const requestedState = findState(question)
  const state = requestedState || profile?.state || ""
  const district = requestedState ? "" : (profile?.district || "")
  const params = new URLSearchParams({ limit: "100", commodity })
  if (state) params.set("state", state)
  if (district) params.set("district", district)
  try {
    let response = await fetch("/api/mandi-prices?" + params)
    let body = await response.text()
    let data
    try {
      data = JSON.parse(body)
    } catch {
      throw new Error("The official market-price service returned an invalid response. Check the backend price-feed configuration.")
    }
    if (!response.ok) throw new Error(data.error || "The official price service is unavailable.")
    let records = cleanStateRecords(Array.isArray(data.records) ? data.records : [], state)
    let locationLabel = district ? (district + ", " + state) : (state || "India")
    if (!records.length && district && state) {
      params.delete("district")
      response = await fetch("/api/mandi-prices?" + params)
      body = await response.text()
      try {
        data = JSON.parse(body)
      } catch {
        throw new Error("The official market-price service returned an invalid response.")
      }
      if (!response.ok) throw new Error(data.error || "The official price service is unavailable.")
      records = cleanStateRecords(Array.isArray(data.records) ? data.records : [], state)
      locationLabel = state + " (state-wide)"
    }
    const record = records.find(item => Number(String(item.modal_price || "").replace(/,/g, "")) > 0)
    if (!record) return "AGMARKNET has no reported " + commodity + " price for " + locationLabel + " right now."
    const modal = Number(String(record.modal_price).replace(/,/g, "")).toLocaleString("en-IN")
    return "Latest reported " + commodity + " modal price: ₹" + modal + " per quintal at " + record.market + ", " + record.district + ", " + record.state + " (" + (record.arrival_date || "report date unavailable") + ")."
  } catch (error) {
    return "I couldn't get the official " + commodity + " price right now. " + error.message
  }
}

function PriceForecast({ location, onPrices }) {
  const [commodity, setCommodity] = useState("Tomato")
  const [state, setState] = useState(location?.state || "Karnataka")
  const [district, setDistrict] = useState(location?.district || "")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const run = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const params = new URLSearchParams({ commodity, state, district, days: "7" })
      const response = await fetch("/api/price-forecast?" + params.toString())
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Forecast is not ready.")
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <section className="panel">
      <div className="official-filters">
        <label>
          Crop / commodity
          <input value={commodity} onChange={e => setCommodity(e.target.value)} placeholder="Tomato" />
        </label>
        <label>
          State
          <input value={state} onChange={e => setState(e.target.value)} placeholder="Karnataka" />
        </label>
        <label>
          District
          <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Optional" />
        </label>
        <button onClick={run} disabled={loading || !commodity || !state}>
          {loading ? "Preparing…" : "Predict price"}
        </button>
      </div>
      {error && (
        <div className="official-error">
          <b>Forecast not ready yet.</b>
          <p>{error}</p>
          <span>Farmezy is collecting the official historical mandi dataset automatically in the background.</span>
        </div>
      )}
      {result && (
        <div className="forecast-result">
          <h3>{result.commodity} · {result.state}</h3>
          <p>Last observed: <b>₹{Number(result.lastObserved.price).toLocaleString("en-IN")}/quintal</b> on {result.lastObserved.date}</p>
          <p><small>{result.observations} daily observations · {result.trainingRows.toLocaleString("en-IN")} training rows · {result.model}</small></p>
          <div className="forecast-cards">
            {result.predictions.map(item => (
              <article key={item.day}>
                <small>Day {item.day}</small>
                <b>₹{item.price.toLocaleString("en-IN")}</b>
                <span>Range ₹{item.lower.toLocaleString("en-IN")}–₹{item.upper.toLocaleString("en-IN")}</span>
              </article>
            ))}
          </div>
        </div>
      )}
      <button className="link" onClick={onPrices}>Check official observed prices →</button>
    </section>
  )
}

export default App
