import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ConfirmAddress.css";

// ─── Helpers ──────────────────────────────────────────────────────
const getTodayFormatted = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    const a = data.address || {};
    const line1 = [a.road, a.neighbourhood, a.suburb].filter(Boolean).join(", ");
    const city = a.city || a.town || a.village || a.county || "";
    const state = a.state || "";
    const pincode = a.postcode || "";
    return {
      line1: line1 || "Current Location",
      city, state, pincode,
      full: [line1, city, state, pincode].filter(Boolean).join(", "),
      short: ([line1, city].filter(Boolean).join(", ").slice(0, 42) || "Your location") + "…",
      lat, lng,
    };
  } catch {
    return {
      line1: "Current Location", city: "", state: "", pincode: "",
      full: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
      short: "Your current location",
      lat, lng,
    };
  }
};

// Haversine distance in km
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const DEFAULT_ADDRESSES = [
  {
    id: "home", label: "Home", tag: "Default", type: "home",
    line1: "PV2M+H46, No.8, Residency Area", city: "Nagpur",
    state: "Maharashtra", pincode: "440001",
    short: "PV2M+H46, Residency Area, Nagpur…",
    full: "PV2M+H46, No.8, Residency Area, 200 Road, Nagpur, MH 440001",
    lat: 21.1458, lng: 79.0882,
  },
  {
    id: "office", label: "Office", tag: null, type: "office",
    line1: "Sapphire House, 402 A, B, C", city: "Nagpur",
    state: "Maharashtra", pincode: "440010",
    short: "Sapphire House, 402 A, Nagpur…",
    full: "Sapphire House, 402 A, B, C, Sapo Sangeeta Rd, Nagpur, MH 440010",
    lat: 21.1500, lng: 79.0950,
  },
];

// ─── Icons ────────────────────────────────────────────────────────
const I = {
  Home:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  Office: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  Heart:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Back:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>,
  Loc:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
  Plus:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  Close:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  Pin:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Warn:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 16 4 11"/></svg>,
};

const iconMap = { home: I.Home, office: I.Office, fav: I.Heart };

// ─── Map Background ───────────────────────────────────────────────
function MapBg() {
  return (
    <svg className="ca-map-svg" viewBox="0 0 500 280" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="280" fill="#e8f0e8"/>
      <rect x="0" y="90" width="500" height="22" fill="#d2e8d2"/>
      <rect x="0" y="155" width="500" height="22" fill="#d2e8d2"/>
      <rect x="70" y="0" width="22" height="280" fill="#d2e8d2"/>
      <rect x="210" y="0" width="22" height="280" fill="#d2e8d2"/>
      <rect x="360" y="0" width="22" height="280" fill="#d2e8d2"/>
      <rect x="10" y="15" width="48" height="66" rx="3" fill="#c4dcc4"/>
      <rect x="102" y="10" width="90" height="72" rx="3" fill="#c4dcc4"/>
      <rect x="245" y="18" width="100" height="62" rx="3" fill="#c4dcc4"/>
      <rect x="392" y="12" width="96" height="68" rx="3" fill="#c4dcc4"/>
      <rect x="10" y="185" width="48" height="62" rx="3" fill="#c4dcc4"/>
      <rect x="102" y="182" width="90" height="66" rx="3" fill="#c4dcc4"/>
      <rect x="245" y="185" width="100" height="60" rx="3" fill="#c4dcc4"/>
      <rect x="392" y="184" width="96" height="64" rx="3" fill="#c4dcc4"/>
      <circle cx="250" cy="136" r="38" fill="rgba(26,115,232,0.08)" stroke="#1a73e8" strokeWidth="1.5" strokeDasharray="5 3"/>
      <circle cx="250" cy="136" r="10" fill="rgba(26,115,232,0.2)"/>
    </svg>
  );
}

// ─── Address Modal (Add & Edit) ───────────────────────────────────
function AddressModal({ onClose, onSave, editData, existingAddresses }) {
  const isEdit = !!editData;
  const [form, setForm] = useState(
    editData
      ? { ...editData }
      : { label: "home", line1: "", city: "", state: "", pincode: "", lat: null, lng: null }
  );
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [dupeWarning, setDupeWarning] = useState(null);
  const [forceSave, setForceSave] = useState(false);

  const SUGGESTIONS = [
    "MG Road, Nagpur, Maharashtra",
    "Civil Lines, Nagpur, MH 440001",
    "Dharampeth, Nagpur, MH 440010",
    "Sadar, Nagpur, MH 440001",
    "Sitabuldi, Nagpur, MH 440012",
  ].filter(s => s.toLowerCase().includes(searchQ.toLowerCase()) && searchQ.length > 1);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported by your browser."); return; }
    setLocating(true); setLocError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const geo = await reverseGeocode(coords.latitude, coords.longitude);
        setForm(f => ({ ...f, line1: geo.line1, city: geo.city, state: geo.state, pincode: geo.pincode, lat: geo.lat, lng: geo.lng }));
        setLocating(false);
      },
      err => {
        setLocError(err.code === 1 ? "Location permission denied. Allow it in browser settings." : "Could not fetch location. Try again.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }, []);

  const findDuplicate = () => {
    if (!form.lat || !form.lng) return null;
    return existingAddresses.find(a =>
      a.id !== (editData?.id) && a.lat && a.lng && haversine(form.lat, form.lng, a.lat, a.lng) < 0.15
    );
  };

  const handleSave = () => {
    if (!form.line1.trim() || !form.city.trim()) return;
    const dupe = findDuplicate();
    if (dupe && !forceSave) { setDupeWarning(dupe); return; }
    onSave({
      ...form,
      short: `${form.line1}, ${form.city}…`.slice(0, 48),
      full: [form.line1, form.city, form.state, form.pincode].filter(Boolean).join(", "),
    });
  };

  return (
    <div className="ca-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ca-modal">

        <div className="ca-modal-header">
          <span className="ca-modal-title">{isEdit ? "Edit address" : "Add new address"}</span>
          <button className="ca-icon-btn" onClick={onClose}><I.Close /></button>
        </div>

        <div className="ca-modal-map">
          <MapBg />
          <div className="ca-mini-pin">
            <div className="ca-pin-body"><div className="ca-pin-dot"/></div>
            <div className="ca-pin-shadow"/>
          </div>
          <button className="ca-locate-fab" onClick={detectLocation}><I.Loc /></button>
        </div>

        <div className="ca-modal-body">

          {/* Duplicate warning */}
          {dupeWarning && !forceSave && (
            <div className="ca-dupe-warn">
              <span className="ca-dupe-icon"><I.Warn /></span>
              <div className="ca-dupe-text">
                <strong>Similar to your "{dupeWarning.label}" address</strong>
                <span>This location is very close to an existing address. Save anyway?</span>
              </div>
              <div className="ca-dupe-btns">
                <button className="ca-dupe-keep" onClick={() => { setForceSave(true); setDupeWarning(null); }}>Save anyway</button>
                <button className="ca-dupe-cancel" onClick={() => setDupeWarning(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="ca-search-wrap">
            <span className="ca-search-icon"><I.Search /></span>
            <input className="ca-search-input" placeholder="Search area, street, landmark…"
              value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          {SUGGESTIONS.length > 0 && (
            <ul className="ca-suggestions">
              {SUGGESTIONS.map(s => (
                <li key={s} className="ca-suggestion-item"
                  onClick={() => { setForm(f => ({ ...f, line1: s })); setSearchQ(""); }}>
                  <span className="ca-sug-icon"><I.Pin /></span><span>{s}</span>
                </li>
              ))}
            </ul>
          )}

          {/* GPS button */}
          <button className="ca-use-loc-btn" onClick={detectLocation} disabled={locating}>
            <I.Loc />{locating ? "Detecting location…" : "Use my current location (GPS)"}
          </button>
          {locError && <p className="ca-loc-error">{locError}</p>}

          {/* Label picker */}
          <div className="ca-label-row">
            {[{ id: "home", label: "Home" }, { id: "office", label: "Office" }, { id: "fav", label: "Other" }].map(({ id, label }) => {
              const Icon = iconMap[id];
              return (
                <button key={id} className={`ca-label-chip ${form.label === id ? "active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, label: id }))}>
                  <Icon /><span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Fields */}
          <div className="ca-field-group">
            <div className="ca-field">
              <label className="ca-field-label">Flat / House No. & Street *</label>
              <input className="ca-field-input" placeholder="e.g. No.8, 2nd Floor, Residency Area"
                value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} />
            </div>
            <div className="ca-field-row">
              <div className="ca-field">
                <label className="ca-field-label">City *</label>
                <input className="ca-field-input" placeholder="City" value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="ca-field">
                <label className="ca-field-label">State</label>
                <input className="ca-field-input" placeholder="State" value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
              </div>
            </div>
            <div className="ca-field" style={{ maxWidth: "160px" }}>
              <label className="ca-field-label">Pincode</label>
              <input className="ca-field-input" placeholder="000000" maxLength={6}
                value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} />
            </div>
          </div>

          <button className="ca-save-btn" onClick={handleSave}>
            {isEdit ? "Update address" : "Save address"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ConfirmAddress() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const orderData = routerLocation.state || {};

  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);
  const [selectedId, setSelectedId] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [editAddr, setEditAddr] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const today = getTodayFormatted();
  const selected = addresses.find(a => a.id === selectedId);

  // Silent auto-detect on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async ({ coords }) => {
        const geo = await reverseGeocode(coords.latitude, coords.longitude);
        setAddresses(prev =>
          prev.map(a => a.id === "home" ? { ...a, full: geo.full, short: geo.short, lat: geo.lat, lng: geo.lng } : a)
        );
      },
      () => {},
      { timeout: 8000 }
    );
  }, []);

  const handleDetectForSelected = () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported."); return; }
    setLocating(true); setLocError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const geo = await reverseGeocode(coords.latitude, coords.longitude);
        setAddresses(prev =>
          prev.map(a => a.id === selectedId ? { ...a, full: geo.full, short: geo.short, lat: geo.lat, lng: geo.lng, line1: geo.line1, city: geo.city, state: geo.state, pincode: geo.pincode } : a)
        );
        setLocating(false);
      },
      err => {
        setLocError(err.code === 1 ? "Permission denied. Allow location access." : "Could not fetch location.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSave = (form) => {
    if (editAddr) {
      setAddresses(prev => prev.map(a => a.id === editAddr.id ? { ...a, ...form, id: editAddr.id } : a));
    } else {
      const newAddr = {
        id: `addr_${Date.now()}`,
        label: form.label === "fav" ? "Other" : form.label.charAt(0).toUpperCase() + form.label.slice(1),
        tag: null, type: form.label, ...form,
      };
      setAddresses(prev => [...prev, newAddr]);
      setSelectedId(newAddr.id);
    }
    setShowModal(false); setEditAddr(null);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedId === id) {
      const remaining = addresses.filter(a => a.id !== id);
      setSelectedId(remaining[0]?.id || null);
    }
  };

const handleConfirm = async () => {
  if (!selected || confirming || confirmed) return;

  console.log("orderData at confirm:", orderData);

  if (!orderData.vendorId || !orderData.menuId) {
    alert("Order data missing. Please go back and try again.");
    return;
  }

  setConfirming(true);

  try {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      alert("Please login again");
      navigate("/");
      return;
    }

    // ── Pull user info from wherever you store it after login ──────────
    // Option A: you stored the full user object in localStorage on login
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    // Option B: decode from JWT (no extra storage needed)
    // const storedUser = JSON.parse(atob(token.split(".")[1]));

    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vendorId:            orderData.vendorId,
        menuId:              orderData.menuId,
        quantity:            orderData.quantity || 1,
        totalPrice:          orderData.totalPrice || orderData.total,
        specialInstructions: orderData.specialInstructions || "",
        deliveryAddress:     selected.full,
      }),
    });

    const data = await res.json();
    console.log("Order response:", data);

    if (!res.ok) throw new Error(data.error || "Order failed");

    setConfirmed(true);

    setTimeout(() => {
      navigate("/payment", {
        state: {
          // ── Order identifiers ──────────────────────────────────────
          orderId:       data.orderId,          // from backend response
          vendorId:      orderData.vendorId,
          menuId:        orderData.menuId,

          // ── Amount ────────────────────────────────────────────────
          totalAmount:   orderData.totalPrice || orderData.total,

          // ── Customer info (from localStorage or JWT decode) ───────
          customerName:  storedUser.name  || storedUser.full_name || "",
          customerEmail: storedUser.email || "",
          customerPhone: storedUser.phone || storedUser.mobile   || "",

          // ── Delivery info ─────────────────────────────────────────
          deliveryAddress: selected,
          deliveryDate:    today,

          // ── Pass-through for display on payment page ──────────────
          name:  orderData.name,
          image: orderData.image,
        },
      });
    }, 700);

  } catch (err) {
    console.error("Confirm error:", err);
    alert("Failed to place order: " + err.message);
    setConfirming(false);
  }
};

  return (
    <div className="ca-root">

      {/* ── Map ── */}
      <div className="ca-map-col">
        <div className="ca-map-wrap">
          <MapBg />
          <div className="ca-map-pin">
            <div className="ca-pin-body"><div className="ca-pin-dot"/></div>
            <div className="ca-pin-shadow"/>
          </div>
          <button className={`ca-locate-btn ${locating ? "pulsing" : ""}`}
            onClick={handleDetectForSelected} title="Update selected address with current location">
            <I.Loc />
          </button>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="ca-panel">

        <div className="ca-topbar">
          <button className="ca-back-btn" onClick={() => navigate(-1)}><I.Back /></button>
          <div className="ca-topbar-center">
            <span className="ca-topbar-title">Confirm delivery address</span>
            <span className="ca-topbar-date">📅 {today}</span>
          </div>
        </div>

        <div className="ca-sheet">
          <div className="ca-sheet-handle"/>

          {/* Delivering-to banner */}
          <div className="ca-section">
            <div className="ca-current-banner">
              <div className="ca-current-icon"><I.Loc /></div>
              <div className="ca-current-text">
                <span className="ca-current-label">
                  {locating ? "Detecting location…" : "Delivering to"}
                </span>
                <span className="ca-current-addr">
                  {locating ? "Please wait…" : selected?.full || "Select an address below"}
                </span>
                {locError && <span className="ca-loc-error-inline">{locError}</span>}
              </div>
              <button className="ca-change-btn" onClick={handleDetectForSelected}>
                {locating ? "…" : "Detect"}
              </button>
            </div>
          </div>

          {/* Address list */}
          <div className="ca-section">
            <p className="ca-section-label">Saved addresses</p>
            <ul className="ca-addr-list">
              {addresses.map(addr => {
                const Icon = iconMap[addr.type] || I.Heart;
                const isSel = addr.id === selectedId;
                return (
                  <li key={addr.id} className={`ca-addr-item ${isSel ? "selected" : ""}`}
                    onClick={() => setSelectedId(addr.id)}>
                    <div className={`ca-addr-icon ${addr.type}`}><Icon /></div>
                    <div className="ca-addr-text">
                      <span className="ca-addr-name">
                        {addr.label}
                        {addr.tag && <span className="ca-addr-tag">{addr.tag}</span>}
                      </span>
                      <span className="ca-addr-short">{addr.short || addr.full}</span>
                    </div>
                    <div className="ca-addr-actions">
                      <button className="ca-edit-btn" title="Edit address"
                        onClick={e => { e.stopPropagation(); setEditAddr(addr); setShowModal(true); }}>
                        <I.Edit />
                      </button>
                      <button className="ca-edit-btn ca-del-btn" title="Delete"
                        onClick={e => handleDelete(addr.id, e)}>
                        <I.Trash />
                      </button>
                      <div className={`ca-radio ${isSel ? "active" : ""}`}/>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button className="ca-add-new" onClick={() => { setEditAddr(null); setShowModal(true); }}>
              <span className="ca-add-icon"><I.Plus /></span>
              <span>Add new address</span>
            </button>
          </div>

          {/* Order strip — shown when coming from TiffinDetails / CartDrawer */}
          {orderData?.name && (
            <div className="ca-section">
              <div className="ca-order-strip">
                <span className="ca-order-label">Ordering</span>
                <span className="ca-order-name">{orderData.name}</span>
                {orderData.total && <span className="ca-order-total">₹{orderData.total}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Confirm footer */}
        <div className="ca-footer">
          <div className="ca-footer-addr">
            <span className="ca-footer-to">Delivering to</span>
            <span className="ca-footer-short">{selected?.short || "—"}</span>
          </div>
          <button
            className={`ca-confirm-btn ${confirming ? "loading" : ""} ${confirmed ? "done" : ""}`}
            onClick={handleConfirm}
            disabled={confirming || confirmed || !selected}
          >
            {confirmed ? <><I.Check /> Confirmed!</> : confirming ? "Confirming…" : "Confirm & Pay →"}
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddressModal
          onClose={() => { setShowModal(false); setEditAddr(null); }}
          onSave={handleSave}
          editData={editAddr}
          existingAddresses={addresses}
        />
      )}
    </div>
  );
}
