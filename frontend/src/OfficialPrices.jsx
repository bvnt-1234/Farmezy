import { useCallback, useEffect, useState } from "react"

const states = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir",
  "Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal"
]

export default function OfficialPrices({ location, preview = false, onViewAll }) {
  const defaultState = location?.state || "Karnataka"
  const defaultDistrict = location?.district || ""

  const [filters, setFilters] = useState(() => ({
    commodity: "",
    state: defaultState,
    district: defaultDistrict,
    market: ""
  }))
  const [applied, setApplied] = useState(() => ({
    commodity: "",
    state: defaultState,
    district: defaultDistrict,
    market: ""
  }))

  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(null)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stateFallback, setStateFallback] = useState(false)
  const [sessionFallback, setSessionFallback] = useState(false)
  const [sessionDate, setSessionDate] = useState("")
  const [isLive, setIsLive] = useState(true)
  const [sourceInfo, setSourceInfo] = useState("")
  const [cropImages, setCropImages] = useState({})

  // Update filters if location changes on profile
  useEffect(() => {
    if (location?.state && (!applied.state || applied.state === "Karnataka")) {
      setFilters(prev => ({ ...prev, state: location.state, district: location.district || prev.district }))
      setApplied(prev => ({ ...prev, state: location.state, district: location.district || prev.district }))
    }
  }, [location?.state, location?.district])

  const fetchPage = useCallback(async (nextOffset, append) => {
    setLoading(true)
    setError("")
    if (!append) {
      setStateFallback(false)
      setSessionFallback(false)
    }
    try {
      const params = new URLSearchParams({ limit: "150", offset: String(nextOffset) })
      if (applied.state) params.set("state", applied.state.trim())
      if (applied.district) params.set("district", applied.district.trim())
      if (applied.commodity) params.set("commodity", applied.commodity.trim())
      if (applied.market) params.set("market", applied.market.trim())

      let response = await fetch("/api/mandi-prices?" + params.toString())
      let payload = await readPriceResponse(response)
      let rows = Array.isArray(payload.records) ? payload.records : []

      if (payload.district_fallback) {
        setStateFallback(true)
      }
      if (payload.session_fallback) {
        setSessionFallback(true)
        setSessionDate(payload.session_date || "")
      }
      setIsLive(payload.live !== false)
      setSourceInfo(payload.source || "")

      if (!response.ok) {
        throw new Error(payload.error || "The Government market-price service is unavailable.")
      }

      setRecords(current => append ? [...current, ...rows] : rows)
      setTotal(Number(payload.total ?? payload.total_count ?? rows.length))
      setOffset(nextOffset + rows.length)
    } catch (err) {
      setError(err.message || "Could not load official mandi prices.")
      if (!append) { setRecords([]); setTotal(null) }
    } finally {
      setLoading(false)
    }
  }, [applied])

  useEffect(() => {
    if (!applied.state) {
      setRecords([])
      setTotal(null)
      setError("")
      return
    }
    fetchPage(0, false)
  }, [fetchPage, applied.commodity, applied.state, applied.district, applied.market])

  // Distinct crop cards to showcase vegetables with photos & modal rates
  const cropCards = [...new Map(records.filter(r => r.commodity).map(r => [r.commodity, r])).values()].slice(0, 8)
  const cropNames = cropCards.map(record => record.commodity).join(",")

  useEffect(() => {
    if (!cropNames) return
    let cancelled = false
    fetch("/api/crop-images?crops=" + encodeURIComponent(cropNames))
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (!cancelled && payload?.images) setCropImages(payload.images)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [cropNames])

  function submit(e) {
    e.preventDefault()
    setApplied({ ...filters })
    setOffset(0)
  }

  function filterByCrop(cropName) {
    setFilters(prev => ({ ...prev, commodity: cropName }))
    setApplied(prev => ({ ...prev, commodity: cropName }))
    setOffset(0)
  }

  function clearCropFilter() {
    setFilters(prev => ({ ...prev, commodity: "" }))
    setApplied(prev => ({ ...prev, commodity: "" }))
    setOffset(0)
  }

  return (
    <div className="official-prices">
      <div className="official-heading">
        <div>
          <div className="eyebrow">{preview ? "OFFICIAL PRICES NEAR YOU" : "GOVERNMENT MARKET DATA"}</div>
          <h1>{preview ? "Prices near " + (location?.district || location?.location || "you") : "Official mandi prices."}</h1>
          <p>
            {isLive ? "Daily wholesale prices reported by AGMARKNET today for all vegetables and crops across " : "Wholesale market prices from latest APMC trading session for "}
            <b>{applied.district ? applied.district + ", " : ""}{applied.state}</b>.
          </p>
        </div>
        <span className="official-badge" style={!isLive ? { borderColor: "#fde047", color: "#854d0e", background: "#fefce8" } : {}}>
          <i style={{ background: isLive ? "#22c55e" : "#eab308" }} />
          {isLive ? "GOVERNMENT OF INDIA · LIVE" : "AGMARKNET · RECENT SESSION"}
        </span>
      </div>

      {!preview && (
        <form className="official-filters" onSubmit={submit}>
          <label>
            Crop / vegetable (optional)
            <input
              value={filters.commodity}
              onChange={e => setFilters({ ...filters, commodity: e.target.value })}
              placeholder="All vegetables (e.g. Ginger, Tomato)"
            />
          </label>
          <label>
            State / UT
            <select value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })}>
              <option value="">All India</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>
            District
            <input
              value={filters.district}
              onChange={e => setFilters({ ...filters, district: e.target.value })}
              placeholder="All districts (e.g. Bengaluru)"
            />
          </label>
          <label>
            Mandi
            <input
              value={filters.market}
              onChange={e => setFilters({ ...filters, market: e.target.value })}
              placeholder="All mandis"
            />
          </label>
          <button type="submit" disabled={loading}>{loading ? "Loading…" : "Apply filters"}</button>
        </form>
      )}

      {!applied.state ? (
        <div className="official-empty">
          <b>Choose a state to load official prices.</b>
          <p>Farmezy loads daily mandi reports directly from the Government of India feed.</p>
        </div>
      ) : null}

      <div className="official-result-bar">
        <div>
          <b>
            {preview
              ? "Latest reported vegetable prices"
              : (total === null ? "" : total.toLocaleString("en-IN") + " reported records")}
          </b>
          <span>
            {applied.state || "All India"}
            {applied.district ? " · " + applied.district : ""}
            {applied.market ? " · " + applied.market : ""}
            {applied.commodity ? (
              <>
                {" · "}
                <b>{applied.commodity}</b>{" "}
                <button
                  type="button"
                  onClick={clearCropFilter}
                  style={{ border: 0, background: "none", color: "#377b4a", cursor: "pointer", textDecoration: "underline", fontSize: 10, padding: 0 }}
                >
                  (show all vegetables)
                </button>
              </>
            ) : " · All vegetables & crops"}
          </span>
        </div>
        {!preview && (
          <button onClick={() => fetchPage(0, false)} disabled={loading}>
            ↻ Refresh
          </button>
        )}
      </div>

      {stateFallback && (
        <p className="official-fallback">
          ⓘ Showing official prices from across {applied.state}. (No specific records reported today for {applied.district} mandi).
        </p>
      )}

      {sessionFallback && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", margin: "14px 0", fontSize: "13px", color: "#166534" }}>
          <b>🕒 Latest Confirmed APMC Session Rates ({sessionDate || "Current"})</b>
          <p style={{ margin: "4px 0 0 0", color: "#15803d" }}>
            Mandis in {applied.state} publish daily morning auction sheets by 11:30 AM. Currently displaying confirmed wholesale APMC rates.
          </p>
        </div>
      )}

      {error && (
        <div className="official-error">
          <b>Prices could not be loaded.</b>
          <p>{error}</p>
          <span>Start the API server or check network connection. This page connects to the official Government AGMARKNET feed.</span>
        </div>
      )}

      {!error && records.length > 0 && (
        <section className="crop-price-cards">
          {cropCards.map(r => {
            const image = cropImages[r.commodity]
            return (
              <article
                className="crop-price-card"
                key={r.commodity}
                onClick={() => !preview && filterByCrop(r.commodity)}
                style={{ cursor: preview ? "default" : "pointer" }}
                title={preview ? "" : "Click to view all records for " + r.commodity}
              >
                <div className="crop-photo">
                  <img
                    src={image?.url || cropPhoto(r.commodity)}
                    alt={image?.alt || r.commodity}
                    onError={event => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = cropPhoto(r.commodity)
                    }}
                  />
                  <span>{cropSymbol(r.commodity)}</span>
                </div>
                <div className="crop-card-copy">
                  <small>{r.market || "Reported mandi"}</small>
                  <b>{r.commodity}</b>
                  <span>Modal <strong>{money(r.modal_price)}</strong> / quintal</span>
                  <small>{r.district ? r.district + ", " : ""}{r.state}{r.arrival_date ? " · " + r.arrival_date : ""}</small>
                  {image && (
                    <a className="image-credit" href={image.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                      Image: {image.photographer}
                    </a>
                  )}
                </div>
              </article>
            )
          })}
          {preview && onViewAll && (
            <button className="crop-card-more" onClick={onViewAll}>
              View all vegetable prices →
            </button>
          )}
        </section>
      )}

      {!preview && !error && (
        <div className="official-table-wrap">
          <table className="official-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Commodity / Vegetable</th>
                <th>State</th>
                <th>District</th>
                <th>Mandi</th>
                <th>Min ₹/quintal</th>
                <th>Modal ₹/quintal</th>
                <th>Max ₹/quintal</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={[r.state, r.district, r.market, r.commodity, r.arrival_date, i].join("-")}>
                  <td>{r.arrival_date || "—"}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span>{cropSymbol(r.commodity)}</span>
                      <b>{r.commodity || "—"}</b>
                    </span>
                    <small>{r.variety || r.grade || ""}</small>
                  </td>
                  <td>{r.state || "—"}</td>
                  <td>{r.district || "—"}</td>
                  <td>{r.market || "—"}</td>
                  <td>{money(r.min_price)}</td>
                  <td className="modal-price">{money(r.modal_price)}</td>
                  <td>{money(r.max_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!records.length && !loading && !error && (
            <div className="official-empty">No reported mandi records match these filters.</div>
          )}
        </div>
      )}

      {!preview && records.length > 0 && (total === null || offset < total) && (
        <button className="official-more" onClick={() => fetchPage(offset, true)} disabled={loading}>
          {loading ? "Loading…" : "Load more official records"}
        </button>
      )}

      <p className="official-source">
        Source:{" "}
        <a href="https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi" target="_blank" rel="noreferrer">
          Ministry of Agriculture & Farmers Welfare · AGMARKNET on data.gov.in ↗
        </a>{" "}
        · Reported daily; wholesale rates are ₹ per quintal.
      </p>
    </div>
  )
}

function cropSymbol(name) {
  const n = String(name || "").toLowerCase()
  if (n.includes("ginger")) return "🫚"
  if (n.includes("lady") || n.includes("ladies") || n.includes("okra") || n.includes("bhindi")) return "🫛"
  if (n.includes("garlic")) return "🧄"
  if (n.includes("tomato")) return "🍅"
  if (n.includes("onion")) return "🧅"
  if (n.includes("potato")) return "🥔"
  if (n.includes("chilli") || n.includes("chili") || n.includes("mirchi")) return "🌶️"
  if (n.includes("capsicum")) return "🫑"
  if (n.includes("carrot")) return "🥕"
  if (n.includes("cucumber") || n.includes("kheera")) return "🥒"
  if (n.includes("cabbage")) return "🥬"
  if (n.includes("spinach") || n.includes("palak")) return "🥬"
  if (n.includes("cauliflower") || n.includes("kohl") || n.includes("gobi")) return "🥦"
  if (n.includes("broccoli")) return "🥦"
  if (n.includes("drumstick") || n.includes("moringa")) return "🌿"
  if (n.includes("coriander") || n.includes("mint") || n.includes("methi")) return "🌿"
  if (n.includes("brinjal") || n.includes("eggplant") || n.includes("baingan")) return "🍆"
  if (n.includes("pea")) return "🫛"
  if (n.includes("corn") || n.includes("maize")) return "🌽"
  if (n.includes("banana")) return "🍌"
  if (n.includes("apple")) return "🍎"
  if (n.includes("mango")) return "🥭"
  if (n.includes("lemon") || n.includes("lime") || n.includes("nimbu")) return "🍋"
  if (n.includes("grape")) return "🍇"
  if (n.includes("pumpkin")) return "🎃"
  if (n.includes("watermelon")) return "🍉"
  if (n.includes("papaya")) return "🍈"
  if (n.includes("coconut")) return "🥥"
  if (n.includes("rice") || n.includes("paddy") || n.includes("wheat") || n.includes("ragi") || n.includes("jowar")) return "🌾"
  if (n.includes("bean")) return "🫘"
  if (n.includes("beetroot")) return "🟣"
  if (n.includes("radish") || n.includes("mooli")) return "🥕"
  return "🌱"
}

const genericCropImage = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=520&q=75"

function cropPhoto(name) {
  const n = String(name || "").toLowerCase()
  if (n.includes("ginger")) return "/ginger.jpg"
  if (n.includes("bhindi") || n.includes("okra") || n.includes("lady") || n.includes("ladies")) return "/ladies_finger.jpg"
  if (n.includes("tomato")) return "/tomato.jpg"
  if (n.includes("onion")) return "/onion.jpg"
  if (n.includes("potato")) return "/potato.jpg"
  if (n.includes("carrot")) return "/carrot.jpg"
  if (n.includes("cabbage")) return "/cabbage.jpg"
  if (n.includes("ridgeguard") || n.includes("ridgegourd") || n.includes("tori")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Luffa_acutangula.jpg/640px-Luffa_acutangula.jpg"
  if (n.includes("knool") || n.includes("kohlrabi")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Kohlrabi.jpg/640px-Kohlrabi.jpg"
  if (n.includes("yam") || n.includes("suran") || n.includes("amphophalus")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Amorphophallus_paeoniifolius_corms_-_Kerala.jpg/640px-Amorphophallus_paeoniifolius_corms_-_Kerala.jpg"
  if (n.includes("bengal gram") || n.includes("chana")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bengal_Gram.jpg/640px-Bengal_Gram.jpg"
  if (n.includes("arecanut") || n.includes("supari")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Areca_nut_in_a_basket.jpg/640px-Areca_nut_in_a_basket.jpg"
  if (n.includes("gur") || n.includes("jaggery")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Jaggery_blocks.jpg/640px-Jaggery_blocks.jpg"
  if (n.includes("drumstick") || n.includes("moringa")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moringa_oleifera_pods.JPG/640px-Moringa_oleifera_pods.JPG"
  if (n.includes("garlic")) return "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=520&q=75"
  if (n.includes("chilli") || n.includes("chili") || n.includes("mirchi")) return "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=520&q=75"
  if (n.includes("cucumber") || n.includes("kheera")) return "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=520&q=75"
  if (n.includes("cauliflower") || n.includes("gobi")) return "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=520&q=75"
  if (n.includes("broccoli")) return "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=520&q=75"
  if (n.includes("brinjal") || n.includes("eggplant")) return "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=520&q=75"
  if (n.includes("bean")) return "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=520&q=75"
  if (n.includes("beetroot")) return "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=520&q=75"
  if (n.includes("capsicum")) return "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=520&q=75"
  if (n.includes("pea")) return "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=520&q=75"
  if (n.includes("radish") || n.includes("raddish")) return "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=520&q=75"
  if (n.includes("spinach")) return "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=520&q=75"
  if (n.includes("banana")) return "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=520&q=75"
  if (n.includes("apple")) return "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=520&q=75"
  if (n.includes("mango")) return "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=520&q=75"
  if (n.includes("lemon") || n.includes("lime")) return "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=520&q=75"
  if (n.includes("pumpkin")) return "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=520&q=75"
  if (n.includes("gourd")) return "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=520&q=75"
  if (n.includes("coriander") || n.includes("mint")) return "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=520&q=75"
  if (n.includes("rice") || n.includes("paddy") || n.includes("wheat") || n.includes("maize") || n.includes("corn") || n.includes("ragi")) return "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=520&q=75"
  return genericCropImage
}

function money(value) {
  const amount = Number(String(value ?? "").replace(/,/g, ""))
  return Number.isFinite(amount) && amount > 0 ? "₹" + amount.toLocaleString("en-IN") : "—"
}

async function readPriceResponse(response) {
  const body = await response.text()
  if (!body.trim()) {
    throw new Error("The local price API did not respond. Check backend server and refresh.")
  }
  try {
    return JSON.parse(body)
  } catch {
    throw new Error("The local price API returned an invalid response. Restart with npm run dev and refresh.")
  }
}
