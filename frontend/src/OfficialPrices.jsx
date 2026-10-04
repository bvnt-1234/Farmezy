import { useCallback, useEffect, useState } from "react"

const states = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
]

export default function OfficialPrices({ location, preview = false, onViewAll }) {
  const [filters, setFilters] = useState(() => ({ commodity: preview ? "Tomato" : "", state: location?.state || "", district: location?.district || "", market: "" }))
  const [applied, setApplied] = useState(() => ({ commodity: preview ? "Tomato" : "", state: location?.state || "", district: location?.district || "", market: "" }))
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(null)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stateFallback, setStateFallback] = useState(false)
  const [cropImages, setCropImages] = useState({})

  const fetchPage = useCallback(async (nextOffset, append) => {
    setLoading(true)
    setError("")
    if (!append) setStateFallback(false)
    try {
      const params = new URLSearchParams({ limit: "100", offset: String(nextOffset) })
      Object.entries(applied).forEach(([key, value]) => { if (value.trim()) params.set(key, value.trim()) })
      let response = await fetch("/api/mandi-prices?" + params.toString())
      let payload = await readPriceResponse(response)
      if (!response.ok) throw new Error(payload.error || "The Government market-price service is unavailable.")
      let rows = Array.isArray(payload.records) ? payload.records : []
      if (!rows.length && applied.state && applied.district) {
        const stateParams = new URLSearchParams({ limit: "100", offset: String(nextOffset), state: applied.state })
        if (applied.commodity.trim()) stateParams.set("commodity", applied.commodity.trim())
        if (applied.market.trim()) stateParams.set("market", applied.market.trim())
        const stateResponse = await fetch("/api/mandi-prices?" + stateParams.toString())
        const statePayload = await readPriceResponse(stateResponse)
        if (stateResponse.ok && Array.isArray(statePayload.records) && statePayload.records.length) {
          response = stateResponse
          payload = statePayload
          rows = statePayload.records
          setStateFallback(true)
        }
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
    if (!applied.commodity || !applied.state) {
      setRecords([])
      setTotal(null)
      setError("")
      return
    }
    fetchPage(0, false)
  }, [fetchPage, applied.commodity, applied.state])
  const cropCards = [...new Map(records.filter(r => r.commodity).map(r => [r.commodity, r])).values()].slice(0, 4)
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

  return <div className="official-prices">
    <div className="official-heading">
      <div><div className="eyebrow">{preview?"OFFICIAL PRICES NEAR YOU":"GOVERNMENT MARKET DATA"}</div><h1>{preview?"Prices near "+(location?.district||location?.location||"you"):"Official mandi prices."}</h1><p>Daily wholesale prices reported by AGMARKNET for {location?.district?(location.district+", "+location.state):"markets across India"}.</p></div>
      <span className="official-badge"><i/> GOVERNMENT OF INDIA</span>
    </div>
    {!preview && <form className="official-filters" onSubmit={submit}>
      <label>Crop / commodity<input value={filters.commodity} onChange={e=>setFilters({...filters,commodity:e.target.value})} placeholder="All commodities, e.g. Tomato"/></label>
      <label>State / UT<select value={filters.state} onChange={e=>setFilters({...filters,state:e.target.value})}><option value="">All India</option>{states.map(s=><option key={s}>{s}</option>)}</select></label>
      <label>District<input value={filters.district} onChange={e=>setFilters({...filters,district:e.target.value})} placeholder="All districts"/></label>
      <label>Mandi<input value={filters.market} onChange={e=>setFilters({...filters,market:e.target.value})} placeholder="All mandis"/></label>
      <button type="submit" disabled={loading}>{loading?"Loading…":"Apply filters"}</button>
    </form>}
    {!applied.commodity || !applied.state ? <div className="official-empty"><b>Choose a crop and state to load official prices.</b><p>Farmezy sends the selected commodity and state to the CEDA market-data service. No sample prices are used.</p></div> : null}\n    <div className="official-result-bar"><div><b>{preview?"Latest reported crop prices":(total===null?"":total.toLocaleString("en-IN")+" reported records")}</b><span>{applied.state || "All India"}{applied.district?" · "+applied.district:""}{applied.market?" · "+applied.market:""}{applied.commodity?" · "+applied.commodity:""}</span></div>{!preview&&<button onClick={()=>fetchPage(0,false)} disabled={loading}>↻ Refresh</button>}</div>
    {stateFallback && <p className="official-fallback">No daily records were returned for {applied.district}. Showing official prices from across {applied.state} instead.</p>}
    {error && <div className="official-error"><b>Prices could not be loaded.</b><p>{error}</p><span>Start the API server and set your data.gov.in key in <code>backend/.env</code>. This page never substitutes sample prices.</span></div>}
    {!error && records.length>0 && <section className="crop-price-cards">{cropCards.map(r => {
      const image = cropImages[r.commodity]
      return <article className="crop-price-card" key={r.commodity}><div className="crop-photo"><img src={image?.url || cropPhoto(r.commodity)} alt={image?.alt || r.commodity} onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=genericCropImage}}/><span>{cropSymbol(r.commodity)}</span></div><div className="crop-card-copy"><small>{r.market || "Reported mandi"}</small><b>{r.commodity}</b><span>Modal <strong>{money(r.modal_price)}</strong> / quintal</span><small>{r.district}{r.state?", "+r.state:""}</small>{image && <a className="image-credit" href={image.link} target="_blank" rel="noreferrer">Image: {image.photographer}</a>}</div></article>
    })}{preview&&onViewAll&&<button className="crop-card-more" onClick={onViewAll}>View all mandi prices →</button>}</section>}
    {!preview && !error && <div className="official-table-wrap"><table className="official-table"><thead><tr><th>Date</th><th>Commodity / variety</th><th>State</th><th>District</th><th>Mandi</th><th>Min ₹/quintal</th><th>Modal ₹/quintal</th><th>Max ₹/quintal</th></tr></thead><tbody>
      {records.map((r,i)=><tr key={[r.state,r.district,r.market,r.commodity,r.arrival_date,i].join("-")}><td>{r.arrival_date || "—"}</td><td><b>{r.commodity || "—"}</b><small>{r.variety || r.grade || ""}</small></td><td>{r.state || "—"}</td><td>{r.district || "—"}</td><td>{r.market || "—"}</td><td>{money(r.min_price)}</td><td className="modal-price">{money(r.modal_price)}</td><td>{money(r.max_price)}</td></tr>)}
    </tbody></table>
    {!records.length && !loading && !error && <div className="official-empty">No reported mandi records match these filters.</div>}</div>}
    {!preview && records.length>0 && (total===null || offset<total) && <button className="official-more" onClick={()=>fetchPage(offset,true)} disabled={loading}>{loading?"Loading…":"Load next 100 official records"}</button>}
    <p className="official-source">Source: <a href="https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi" target="_blank" rel="noreferrer">Ministry of Agriculture & Farmers Welfare · AGMARKNET on data.gov.in ↗</a> · Reported daily; prices are ₹ per quintal.</p>
  </div>
}

function cropSymbol(name){const n=name.toLowerCase();if(n.includes("tomato"))return "🍅";if(n.includes("onion"))return "🧅";if(n.includes("potato"))return "🥔";if(n.includes("chilli")||n.includes("chili"))return "🌶️";if(n.includes("cabbage"))return "🥬";if(n.includes("brinjal")||n.includes("eggplant"))return "🍆";return "🥦"}
const genericCropImage="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=520&q=75"
function cropPhoto(name){const n=name.toLowerCase();if(n.includes("tomato"))return "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=520&q=75";if(n.includes("onion"))return "https://images.unsplash.com/photo-1683355739329-cea18ba93f02?auto=format&fit=crop&w=520&q=75";if(n.includes("potato"))return "https://images.unsplash.com/photo-1686544303805-54c175c60d8f?auto=format&fit=crop&w=520&q=75";if(n.includes("chilli")||n.includes("chili"))return "https://images.unsplash.com/photo-1565685110871-1324fc462c84?auto=format&fit=crop&w=520&q=75";return genericCropImage}
function money(value) {
  const amount = Number(String(value ?? "").replace(/,/g, ""))
  return Number.isFinite(amount) && amount > 0 ? "₹" + amount.toLocaleString("en-IN") : "—"
}





async function readPriceResponse(response) {
  const body = await response.text()
  if (!body.trim()) {
    throw new Error("The local price API did not respond. Run npm run api in the frontend folder, then refresh this page.")
  }
  try {
    return JSON.parse(body)
  } catch {
    throw new Error("The local price API returned an invalid response. Restart it with npm run api, then refresh this page.")
  }
}
