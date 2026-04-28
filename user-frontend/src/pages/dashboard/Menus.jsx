import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiSearch, FiClock, FiStar, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axios";
import "./Menus.css";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800";

const Menus = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [filterType, setFilterType]   = useState("daily");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [searchQuery, setSearchQuery] = useState("");

  // ── Vendor state ──────────────────────────────────────────
  const [vendor,   setVendor]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState(null);

  // ── Menu state ────────────────────────────────────────────
  const [menus,          setMenus]          = useState({ lunch: null, dinner: null });
  const [menuLoading,    setMenuLoading]    = useState(true);
  const [resolvedDate,   setResolvedDate]   = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  const isSubscribed = false;

  // ── Fetch vendor details ──────────────────────────────────
  useEffect(() => {
    if (!vendorId) return;
    const fetchVendor = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const { data } = await api.get(`/vendors/${vendorId}`, {
          baseURL: "http://localhost:5000/api",
        });
        setVendor(data.vendor || data);
      } catch (err) {
        console.error(err);
        setApiError(err.response?.data?.error || err.message || "Failed to load vendor.");
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [vendorId]);

  // ── Fetch menus (single clean call) ──────────────────────
  useEffect(() => {
    if (!vendorId) return;

    const fetchMenus = async () => {
      setMenuLoading(true);
      try {
        const { data } = await api.get("/menu/daily", {
          baseURL: "http://localhost:5000/api",
          params: { vendorId, date: selectedDate, days: 3 },
        });

        setMenus({
          lunch:  data.lunch  || null,
          dinner: data.dinner || null,
        });
        setResolvedDate(data.resolvedDate || null);
        setAvailableDates(data.availableDates || []);
      } catch (err) {
        console.error("Menu fetch error:", err);
        setMenus({ lunch: null, dinner: null });
        setResolvedDate(null);
        setAvailableDates([]);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenus();
  }, [vendorId, selectedDate]);

  // ── Order cutoff validation ───────────────────────────────
  const canOrder = (mealType) => {
    const now      = new Date();
    const selected = new Date(`${selectedDate}T00:00:00`);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = (selected - today) / (1000 * 60 * 60 * 24);

    if (mealType === "lunch") {
      if (diffDays < 1) {
        alert("Lunch must be ordered at least 1 day in advance.");
        return false;
      }
    }

    if (mealType === "dinner") {
      if (diffDays < 0) {
        alert("Cannot order for a past date.");
        return false;
      }
      if (diffDays === 0) {
        const cutoff = new Date();
        cutoff.setHours(14, 0, 0, 0);
        if (now >= cutoff) {
          alert("Dinner orders for today must be placed before 2:00 PM.");
          return false;
        }
      }
    }

    return true;
  };

  // ── Disabled state (for button UI) ───────────────────────
  const isOrderDisabled = (mealType) => {
    const now      = new Date();
    const selected = new Date(`${selectedDate}T00:00:00`);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = (selected - today) / (1000 * 60 * 60 * 24);

    if (mealType === "lunch") return diffDays < 1;
    if (mealType === "dinner") {
      if (diffDays < 0) return true;
      if (diffDays === 0) {
        const cutoff = new Date();
        cutoff.setHours(14, 0, 0, 0);
        return now >= cutoff;
      }
    }
    return false;
  };

  // ── Navigate to tiffin details ────────────────────────────
  const handleMealClick = (mealType) => {
    if (!canOrder(mealType)) return;

    if (filterType === "daily") {
      navigate(`/tiffin/${vendorId}/${mealType}?date=${selectedDate}`);
    } else if (filterType === "weekly") {
      if (!isSubscribed) { alert("Subscribe to access weekly plan"); return; }
      navigate(`/tiffin/${vendorId}/${mealType}?plan=weekly`);
    } else if (filterType === "monthly") {
      if (!isSubscribed) { alert("Subscribe to access monthly plan"); return; }
      navigate(`/tiffin/${vendorId}/${mealType}?plan=monthly`);
    }
  };

  const filterLabels = {
    daily:   { icon: "📅", label: "Daily"   },
    weekly:  { icon: "📆", label: "Weekly"  },
    monthly: { icon: "🗓",  label: "Monthly" },
  };

  // ── Parse menu item description ───────────────────────────
  const parseItems = (description) =>
    description
      ? description.split(/\n|,/).map((s) => s.trim()).filter(Boolean).join(" • ")
      : "";

  // ── Render: loading / error states ───────────────────────
  if (loading) {
    return (
      <div className="menu-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "#888" }}>Loading vendor…</p>
      </div>
    );
  }

  if (apiError || !vendor) {
    return (
      <div className="menu-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: "60vh" }}>
        <FiAlertCircle size={32} color="#e53e3e" />
        <p style={{ color: "#e53e3e", fontWeight: 600 }}>{apiError || "Vendor not found."}</p>
        <button className="back-btn" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  const vendorImage = vendor.image || FALLBACK_IMAGE;

  // ── Main render ───────────────────────────────────────────
  return (
    <div className="menu-page">

      {/* ── Header ── */}
      <div className="menu-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
        </button>
        <h3>Mess Menu</h3>
        <div className="header-spacer" />
      </div>

      {/* ── Banner ── */}
      <div className="menu-banner">
        <img src={menus.lunch?.image_url || menus.lunch?.image || vendorImage} alt={vendor.name} />
        <div className="banner-gradient" />
        <div className="menu-overlay">
          {vendor.vendorId && <span className="badge">✓ Verified</span>}
          <h2>{vendor.name}</h2>
          <p className="cuisine-tag">{vendor.cuisineType || vendor.cuisine || "Home-style tiffin"}</p>
          <div className="meta-row">
            <span><FiClock size={13} /> {vendor.deliveryTime || "30–45 min"}</span>
            <span><FiStar size={13} /> {vendor.rating ? Number(vendor.rating).toFixed(1) : "New"}</span>
          </div>
        </div>
        <button className="sub-btn" onClick={() => navigate(`/subscription/${vendorId}`)}>
          ✦ Subscribe
        </button>
      </div>

      {/* ── Search + Filter Pills ── */}
      <div className="controls-row">
        <div className="search-wrap">
          <FiSearch className="search-icon" />
          <input
            placeholder="Search tiffin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {Object.entries(filterLabels).map(([key, { icon, label }]) => (
            <button
              key={key}
              className={`pill ${filterType === key ? "active" : ""}`}
              onClick={() => setFilterType(key)}
            >
              <span className="pill-icon">{icon}</span>
              <span className="pill-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div className={`filter-panel ${filterType === "daily" ? "visible" : ""}`}>
        {filterType === "daily" && (
          <div className="date-selector">
            <div className="date-info">
              <span className="date-label">Selected Date</span>
              <span className="date-display">
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "short",
                })}
              </span>
            </div>
            <input
              type="date"
              value={selectedDate}
              min={getTodayDate()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>
        )}

        {filterType === "weekly" && (
          <div className="plan-notice">
            <span>📆</span>
            <div>
              <strong>Weekly Plan</strong>
              <p>Subscribe to unlock 7-day tiffin access</p>
            </div>
            <button className="unlock-btn" onClick={() => navigate(`/subscription/${vendorId}`)}>Unlock</button>
          </div>
        )}

        {filterType === "monthly" && (
          <div className="plan-notice">
            <span>🗓</span>
            <div>
              <strong>Monthly Plan</strong>
              <p>Subscribe for the best value tiffin deal</p>
            </div>
            <button className="unlock-btn" onClick={() => navigate(`/subscription/${vendorId}`)}>Unlock</button>
          </div>
        )}
      </div>

      {/* ── Section Title ── */}
      <div className="section-header">
        <h4 className="menu-title">
          {filterType === "daily"
            ? `Menu for ${new Date(`${resolvedDate || selectedDate}T00:00:00`).toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long",
              })}`
            : `${filterLabels[filterType].label} Menu`}
        </h4>
        <span className="meal-count">
          {menuLoading ? "…" : `${[menus.lunch, menus.dinner].filter(Boolean).length} options`}
        </span>
      </div>

      {/* ── Fallback date notice ── */}
      {filterType === "daily" && !menuLoading && resolvedDate && resolvedDate !== selectedDate && (
        <div className="plan-notice" style={{ marginBottom: 12 }}>
          <span>ℹ️</span>
          <div>
            <strong>No menu on selected date.</strong>
            <p>
              Showing nearest available menu for{" "}
              {new Date(`${resolvedDate}T00:00:00`).toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "short",
              })}
            </p>
          </div>
        </div>
      )}

      {/* ── Upcoming dates notice ── */}
      {filterType === "daily" && !menuLoading && availableDates.length > 1 && (
        <div className="plan-notice" style={{ marginBottom: 12 }}>
          <span>📅</span>
          <div>
            <strong>Upcoming Menu Dates</strong>
            <p>{availableDates.slice(0, 4).join(" • ")}</p>
          </div>
        </div>
      )}

      {/* ── Meal Cards ── */}
      {menuLoading ? (
        <p style={{ padding: "20px", color: "#888" }}>Loading menu…</p>
      ) : (
        <div className="meal-grid">

          {/* Lunch Card */}
          {menus.lunch && (
            <div className="meal-card" onClick={() => handleMealClick("lunch")}>
              <div className="meal-img-wrap">
                <img
                  src={menus.lunch.image_url || menus.lunch.image || vendorImage}
                  alt="lunch"
                  onError={(e) => { e.target.src = vendorImage; }}
                />
                <div className="meal-img-overlay" />
              </div>
              <div className="meal-content">
                <div className="meal-top">
                  <span className="meal-time-badge lunch">🌞 Lunch</span>
                  <span className="meal-time-range">{menus.lunch.time || "12:00 – 3:00 PM"}</span>
                </div>
                <h3>{menus.lunch.name}</h3>
                <p>{parseItems(menus.lunch.description)}</p>
                <div className="meal-footer">
                  <span className="meal-price">₹{Number(menus.lunch.price).toFixed(0)}</span>
                  <button
                    className="order-chip"
                    disabled={isOrderDisabled("lunch")}
                    style={{ opacity: isOrderDisabled("lunch") ? 0.4 : 1 }}
                    onClick={(e) => { e.stopPropagation(); handleMealClick("lunch"); }}
                  >
                    {isOrderDisabled("lunch") ? "Closed" : "Order →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dinner Card */}
          {menus.dinner && (
            <div className="meal-card" onClick={() => handleMealClick("dinner")}>
              <div className="meal-img-wrap">
                <img
                  src={menus.dinner.image_url || menus.dinner.image || "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800"}
                  alt="dinner"
                  onError={(e) => { e.target.src = vendorImage; }}
                />
                <div className="meal-img-overlay" />
              </div>
              <div className="meal-content">
                <div className="meal-top">
                  <span className="meal-time-badge dinner">🌙 Dinner</span>
                  <span className="meal-time-range">{menus.dinner.time || "7:00 – 9:00 PM"}</span>
                </div>
                <h3>{menus.dinner.name}</h3>
                <p>{parseItems(menus.dinner.description)}</p>
                <div className="meal-footer">
                  <span className="meal-price">₹{Number(menus.dinner.price).toFixed(0)}</span>
                  <button
                    className="order-chip"
                    disabled={isOrderDisabled("dinner")}
                    style={{ opacity: isOrderDisabled("dinner") ? 0.4 : 1 }}
                    onClick={(e) => { e.stopPropagation(); handleMealClick("dinner"); }}
                  >
                    {isOrderDisabled("dinner") ? "Closed" : "Order →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!menus.lunch && !menus.dinner && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#aaa" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🍱</p>
              <p style={{ fontWeight: 600, color: "#666" }}>No menu available</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>
                No meals scheduled for this date. Try a different date.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Menus;