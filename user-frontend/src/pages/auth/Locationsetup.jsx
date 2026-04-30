/* eslint-disable react-hooks/set-state-in-effect */
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./LocationSetup.css";
import api from "../../api/axios";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom blue pin icon
const pinIcon = L.divIcon({
  className: "",
  html: `<div class="lc-custom-pin">
    <div class="lc-custom-pin-inner"></div>
    <div class="lc-custom-pin-tail"></div>
    <div class="lc-custom-pin-shadow"></div>
  </div>`,
  iconSize:   [32, 42],
  iconAnchor: [16, 42],
});

/* ── Reverse geocode via Nominatim ────────────────────────── */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const a = data.address || {};
    const town     = a.suburb || a.neighbourhood || a.town || a.village || a.city_district || a.city || "";
    const city     = a.city || a.town || a.county || "";
    const postcode = a.postcode || "";
    const state    = a.state || "";
    return {
      displayLabel: [town, city, postcode].filter(Boolean).join(", "),
      town, city, postcode, state,
      fullAddress: data.display_name || "",
    };
  } catch {
    return { displayLabel: "", town: "", city: "", postcode: "", state: "", fullAddress: "" };
  }
}

/* ── Map click / drag handler ─────────────────────────────── */
function MapEventHandler({ onMove }) {
  useMapEvents({
    click(e) { onMove(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

/* ══════════════════════════════════════════════════════════
   SCREEN 1 — Map + Access Location
══════════════════════════════════════════════════════════ */
function MapScreen({ onConfirm }) {
  const [coords,   setCoords]   = useState(null);
  const [geoInfo,  setGeoInfo]  = useState(null);
  const [zipInput, setZipInput] = useState("");
  const [locating, setLocating] = useState(false);
  const [error,    setError]    = useState("");
  const mapRef = useRef(null);

  const doGeocode = useCallback(async (lat, lng) => {
    const info = await reverseGeocode(lat, lng);
    setGeoInfo(info);
    if (info.postcode) setZipInput(info.postcode);
  }, []);

  const fetchLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        if (mapRef.current) mapRef.current.setView([lat, lng], 16);
        await doGeocode(lat, lng);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setError("Location permission denied. Please allow access and try again.");
        else if (err.code === 2) setError("Location unavailable. Check your GPS settings.");
        else setError("Location request timed out. Please try again.");
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  }, [doGeocode]);

  useEffect(() => { fetchLocation(); }, [fetchLocation]);

  const handleMapMove = async (lat, lng) => {
    setCoords({ lat, lng });
    await doGeocode(lat, lng);
  };

  const handleContinue = () => {
    if (!coords) { setError("Please allow location access first."); return; }
    onConfirm({ coords, geoInfo, zip: zipInput });
  };

  const defaultCenter = coords
    ? [coords.lat, coords.lng]
    : [19.076, 72.877]; // Mumbai fallback

  return (
    <div className="lc-screen lc-map-screen">

      {/* ── Desktop Sidebar ── */}
      <div className="lc-sidebar">
        <div className="lc-brand">
          <div className="lc-brand-icon">🍱</div>
          <span className="lc-brand-name">Messato</span>
        </div>

        <div className="lc-sidebar-body">
          <h2 className="lc-sidebar-title">Set Your<br />Location</h2>
          <p className="lc-sidebar-desc">
            We use your location to show<br />
            <strong>nearby mess &amp; home kitchens</strong><br />
            within 1–2 km of you.
          </p>
          <div className="lc-divider" />

          <div className="lc-field-wrap">
            <label className="lc-field-label">ZIP / Postal Code</label>
            <input
              className="lc-field-input"
              type="text"
              placeholder="Auto-detected or type here"
              value={zipInput}
              onChange={e => setZipInput(e.target.value)}
              maxLength={10}
            />
            {geoInfo?.displayLabel && (
              <span className="lc-field-hint">📍 {geoInfo.displayLabel}</span>
            )}
          </div>

          {error && <div className="lc-error-box">{error}</div>}

          <p className="lc-map-tip">
            Click anywhere on the map to adjust your pin, or tap the button below to auto-detect.
          </p>
        </div>

        <div className="lc-sidebar-footer">
          <div className="lc-steps">
            <div className="lc-step active"><span>1</span> Set Location</div>
            <div className="lc-step-line" />
            <div className="lc-step"><span>2</span> Choose Town</div>
          </div>
          <button className="lc-btn-primary lc-btn-mt" onClick={fetchLocation} disabled={locating}>
            {locating
              ? <><span className="lc-spinner" /> Detecting…</>
              : <>📍 ACCESS LOCATION</>}
          </button>
          {coords && (
            <button className="lc-btn-ghost" onClick={handleContinue}>
              Confirm &amp; Continue →
            </button>
          )}
        </div>
      </div>

      {/* ── Map area ── */}
      <div className="lc-map-area">
        <MapContainer
          center={defaultCenter}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
          ref={mapRef}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEventHandler onMove={handleMapMove} />
          {coords && (
            <Marker position={[coords.lat, coords.lng]} icon={pinIcon} />
          )}
        </MapContainer>

        {locating && (
          <div className="lc-map-overlay">
            <div className="lc-pulse-ring" />
            <span>Finding your location…</span>
          </div>
        )}

        {coords && geoInfo?.displayLabel && (
          <div className="lc-map-location-card">
            <div className="lc-map-location-label">YOUR LOCATION</div>
            <div className="lc-map-location-val">{geoInfo.displayLabel}</div>
          </div>
        )}
      </div>

      {/* ── Mobile bottom sheet ── */}
      <div className="lc-bottom-sheet">
        <div className="lc-sheet-handle" />

        <div className="lc-mobile-brand">
          <div className="lc-brand-icon">🍱</div>
          <span className="lc-brand-name">Messato</span>
        </div>

        <div className="lc-field-wrap">
          <label className="lc-field-label">ZIP Code</label>
          <input
            className="lc-field-input"
            type="text"
            placeholder="Enter zip code"
            value={zipInput}
            onChange={e => setZipInput(e.target.value)}
            maxLength={10}
          />
          {geoInfo?.displayLabel && (
            <span className="lc-field-hint">📍 {geoInfo.displayLabel}</span>
          )}
        </div>

        {error && <div className="lc-error-box">{error}</div>}

        <button className="lc-btn-primary" onClick={fetchLocation} disabled={locating}>
          {locating
            ? <><span className="lc-spinner" /> Detecting…</>
            : <>ACCESS LOCATION <span>📍</span></>}
        </button>

        {coords && (
          <button className="lc-btn-ghost" onClick={handleContinue}>
            Confirm &amp; Continue →
          </button>
        )}

        <p className="lc-tagline">
          " Find Nearby Mess &amp; Home Kitchen<br />
          <strong>Within 1 – 2 km</strong> "
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SCREEN 2 — Select Delivery Town
══════════════════════════════════════════════════════════ */
const POPULAR_TOWNS = [
  "Andheri East","Andheri West","Bandra East","Bandra West",
  "Borivali","Chembur","Dadar","Ghatkopar","Goregaon",
  "Jogeshwari","Kandivali","Kurla","Malad","Mulund",
  "Powai","Santacruz","Thane","Vikhroli","Vile Parle","Worli",
];

function TownScreen({ locationData, onBack, onDone }) {
  const [townOpen, setTownOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [search,   setSearch]   = useState("");
  const [saving]   = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (locationData?.geoInfo?.town) {
      const detected = locationData.geoInfo.town;
      const match = POPULAR_TOWNS.find(t =>
        t.toLowerCase().includes(detected.toLowerCase()) ||
        detected.toLowerCase().includes(t.toLowerCase())
      );
      setSelected(match || detected);
    }
  }, [locationData]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setTownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredTowns = POPULAR_TOWNS.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (town) => { setSelected(town); setTownOpen(false); setSearch(""); };

  const handleContinue = () => {
    if (!selected) { alert("Please choose your delivery town."); return; }
    onDone({ ...locationData, town: selected });
  };

  const detectedLabel =
    locationData?.geoInfo?.displayLabel ||
    `${locationData?.coords?.lat?.toFixed(4)}, ${locationData?.coords?.lng?.toFixed(4)}`;

  return (
    <div className="lc-screen lc-town-screen">

      {/* ── Desktop Sidebar ── */}
      <div className="lc-sidebar">
        <div className="lc-brand">
          <div className="lc-brand-icon">🍱</div>
          <span className="lc-brand-name">Messato</span>
        </div>

        <div className="lc-sidebar-body">
          <h2 className="lc-sidebar-title">Select Your<br />Delivery Town</h2>
          <p className="lc-sidebar-desc">
            Find Nearby Mess &amp; Home Kitchen<br />
            <strong>within 1 – 2 km</strong> of your town.
          </p>
          <div className="lc-divider" />

          {/* Detected location */}
          <div className="lc-detected-card">
            <span className="lc-detected-icon">📍</span>
            <span className="lc-detected-text">{detectedLabel}</span>
            <div className="lc-detected-actions">
              <button className="lc-icon-btn" title="Edit" onClick={onBack}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a6fff" strokeWidth="2.2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>

          <label className="lc-field-label">Choose Your Town</label>
          <div className="lc-dropdown-wrap" ref={dropRef}>
            <button className="lc-dropdown-btn" onClick={() => setTownOpen(v => !v)}>
              <span className={selected ? "lc-dd-selected" : "lc-dd-placeholder"}>
                {selected || "Choose Town"}
              </span>
              <span className={`lc-dd-arrow ${townOpen ? "open" : ""}`}>▾</span>
            </button>

            {townOpen && (
              <div className="lc-dd-menu">
                <input
                  className="lc-dd-search"
                  type="text"
                  placeholder="Search town…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
                <div className="lc-dd-list">
                  {filteredTowns.length > 0 ? filteredTowns.map(town => (
                    <button
                      key={town}
                      className={`lc-dd-item ${selected === town ? "active" : ""}`}
                      onClick={() => handleSelect(town)}
                    >
                      <span className="lc-dd-pin">📍</span>
                      {town}
                      {selected === town && <span className="lc-dd-check">✓</span>}
                    </button>
                  )) : (
                    <p className="lc-dd-empty">No towns match "{search}"</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lc-sidebar-footer">
          <div className="lc-steps">
            <div className="lc-step done"><span>✓</span> Set Location</div>
            <div className="lc-step-line active" />
            <div className="lc-step active"><span>2</span> Choose Town</div>
          </div>
          <button className="lc-back-btn lc-btn-mt" onClick={onBack}>‹ Back</button>
          <button className="lc-btn-primary" onClick={handleContinue} disabled={!selected || saving}>
            {saving ? <><span className="lc-spinner" /> Saving…</> : "CONTINUE"}
          </button>
        </div>
      </div>

      {/* Map (read-only, shows pin) */}
      <div className="lc-map-area lc-map-area--readonly">
        {locationData?.coords && (
          <MapContainer
            center={[locationData.coords.lat, locationData.coords.lng]}
            zoom={15}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[locationData.coords.lat, locationData.coords.lng]}
              icon={pinIcon}
            />
          </MapContainer>
        )}
        <div className="lc-map-location-card">
          <div className="lc-map-location-label">DETECTED LOCATION</div>
          <div className="lc-map-location-val">{detectedLabel}</div>
        </div>
      </div>

      {/* ── Mobile full-page ── */}
      <div className="lc-town-mobile">
        <div className="lc-town-mobile-header">
          <button className="lc-back-btn" onClick={onBack}>‹ Back</button>
        </div>

        <div className="lc-town-mobile-title-wrap">
          <h2 className="lc-town-mobile-title">Select Your Delivery Town</h2>
          <p className="lc-town-mobile-sub">
            Find Nearby Mess &amp; Home Kitchen<br />within 1 – 2 km
          </p>
        </div>

        <div className="lc-detected-card">
          <span className="lc-detected-icon">📍</span>
          <span className="lc-detected-text">{detectedLabel}</span>
          <div className="lc-detected-actions">
            <button className="lc-icon-btn" title="Edit location" onClick={onBack}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a6fff" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>

        <label className="lc-field-label">Choose Your Town</label>
        <div className="lc-dropdown-wrap" ref={dropRef}>
          <button className="lc-dropdown-btn" onClick={() => setTownOpen(v => !v)}>
            <span className={selected ? "lc-dd-selected" : "lc-dd-placeholder"}>
              {selected || "Choose Town"}
            </span>
            <span className={`lc-dd-arrow ${townOpen ? "open" : ""}`}>▾</span>
          </button>

          {townOpen && (
            <div className="lc-dd-menu">
              <input
                className="lc-dd-search"
                type="text"
                placeholder="Search town…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              <div className="lc-dd-list">
                {filteredTowns.length > 0 ? filteredTowns.map(town => (
                  <button
                    key={town}
                    className={`lc-dd-item ${selected === town ? "active" : ""}`}
                    onClick={() => handleSelect(town)}
                  >
                    <span className="lc-dd-pin">📍</span>
                    {town}
                    {selected === town && <span className="lc-dd-check">✓</span>}
                  </button>
                )) : (
                  <p className="lc-dd-empty">No towns match "{search}"</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lc-town-spacer" />

        <div className="lc-town-mobile-footer">
          <button className="lc-btn-primary" onClick={handleContinue} disabled={!selected || saving}>
            {saving ? <><span className="lc-spinner" /> Saving…</> : "CONTINUE"}
          </button>
        </div>
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT — orchestrates flow
══════════════════════════════════════════════════════════ */
export default function LocationSetup({ onComplete }) {
  const [step,          setStep]          = useState(null);
  const [locationData,  setLocationData]  = useState(null);
  const [autoFetching,  setAutoFetching]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("userLocation");
    if (saved) {
      setAutoFetching(true);
      const parsed = JSON.parse(saved);
      if (!navigator.geolocation) {
        onComplete?.(parsed);
        navigate("/dashboard");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const info = await reverseGeocode(lat, lng);
          const updated = { ...parsed, coords: { lat, lng }, geoInfo: info, savedAt: Date.now() };
          localStorage.setItem("userLocation", JSON.stringify(updated));
          setAutoFetching(false);
          onComplete?.(updated);
          navigate("/dashboard");
        },
        () => {
          setAutoFetching(false);
          onComplete?.(parsed);
          navigate("/dashboard");
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      setStep("map");
    }
  }, [navigate, onComplete]);

  const handleMapConfirm = (data) => {
    setLocationData(data);
    setStep("town");
  };

  const handleTownDone = async (data) => {
    try {
      // ── Save to localStorage ──
      localStorage.setItem("userLocation", JSON.stringify({
        coords:  data.coords,
        geoInfo: data.geoInfo,
        zip:     data.zip,
        town:    data.town,
        savedAt: Date.now(),
      }));

      // ── Save to backend (users table) ──
      await api.post("/user/save-location", {
        latitude:  data.coords.lat,
        longitude: data.coords.lng,
        address:   data.geoInfo?.fullAddress || "",
        city:      data.geoInfo?.city        || "",
        state:     data.geoInfo?.state       || "",
        zip:       data.zip                  || "",
        town:      data.town                 || "",
      });

      onComplete?.(data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Location save failed:", error);
      // Still navigate even if backend fails
      onComplete?.(data);
      navigate("/dashboard");
    }
  };

  if (autoFetching) {
    return (
      <div className="lc-auto-fetch">
        <div className="lc-auto-fetch-inner">
          <div className="lc-pulse-ring lc-pulse-lg" />
          <p className="lc-auto-label">Updating your location…</p>
        </div>
      </div>
    );
  }

  if (step === "map")  return <MapScreen onConfirm={handleMapConfirm} />;
  if (step === "town") return <TownScreen locationData={locationData} onBack={() => setStep("map")} onDone={handleTownDone} />;

  return null;
}
