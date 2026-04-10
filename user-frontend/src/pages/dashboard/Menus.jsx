import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiSearch, FiClock, FiStar, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axios";
import "./Menus.css";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const getDisplayDate = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800";

const Menus = () => {
  // ✅ Fixed: was `id`, route param is `vendorId`
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [filterType, setFilterType]     = useState("daily");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [searchQuery, setSearchQuery]   = useState("");

  // ── Vendor state ──────────────────────────────────────────────────────────
  const [vendor,    setVendor]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [apiError,  setApiError]  = useState(null);

  // ── Menu state ────────────────────────────────────────────────────────────
  const [menus,       setMenus]       = useState({ lunch: null, dinner: null });
  const [menuLoading, setMenuLoading] = useState(true);

  const isSubscribed = false;

  // ── Fetch vendor details ──────────────────────────────────────────────────
  useEffect(() => {
    if (!vendorId) return;
    const fetchVendor = async () => {
      setLoading(true);
      setApiError(null);
      try {
 const { data } = await api.get(`/vendors/${vendorId}`, {
  baseURL: "http://localhost:5000/api",
});

        // backend should return vendor object directly or inside data.vendor
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

// ── Fetch menus for this vendor ───────────────────────────────────────────
useEffect(() => {
  if (!vendorId) return;
  const fetchMenus = async () => {
    setMenuLoading(true);
    try {
      console.log("Fetching menu for:", { vendorId, date: selectedDate }); // 👈 ADD THIS

      const { data } = await api.get("/menu", {
        baseURL: "http://localhost:5000/api",
        params: {
          vendorId,
          date: selectedDate,
        },
      });

      console.log("Menu API response:", data); // 👈 ADD THIS
      setMenus({ lunch: data.lunch || null, dinner: data.dinner || null });
    } catch (err) {
      console.error("Menu fetch error:", err);
    } finally {
      setMenuLoading(false);
    }
  };
  fetchMenus();
}, [vendorId, selectedDate]);
// ── Order cutoff validation ───────────────────────────────────────────────
const canOrder = (mealType) => {
  const now = new Date();
  const selected = new Date(selectedDate);

  // Normalize today to midnight for date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);

  const diffDays = (selected - today) / (1000 * 60 * 60 * 24); // 0 = today, 1 = tomorrow

  if (mealType === "lunch") {
    // Must order at least 1 day before → selected date must be tomorrow or later
    if (diffDays < 1) {
      alert("Lunch must be ordered at least 1 day in advance.");
      return false;
    }
  }

  if (mealType === "dinner") {
    // Can order if selected date is in the future (any day)
    // OR if selected date is today AND current time is before 2:00 PM
    if (diffDays < 0) {
      alert("Cannot order for a past date.");
      return false;
    }
    if (diffDays === 0) {
      const cutoff = new Date();
      cutoff.setHours(14, 0, 0, 0); // 2:00 PM today
      if (now >= cutoff) {
        alert("Dinner orders for today must be placed before 2:00 PM.");
        return false;
      }
    }
  }

  return true;
};
  // ── Navigate to tiffin details ────────────────────────────────────────────
const handleMealClick = (mealType) => {
  if (!canOrder(mealType)) return; // ← add this line at the top

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
// Add this helper
const isOrderDisabled = (mealType) => {
  const now = new Date();
  const selected = new Date(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
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
  const filterLabels = {
    daily:   { icon: "📅", label: "Daily"   },
    weekly:  { icon: "📆", label: "Weekly"  },
    monthly: { icon: "🗓",  label: "Monthly" },
  };

  // ── Parse menu item description ───────────────────────────────────────────
  const parseItems = (description) =>
    description
      ? description.split(/\n|,/).map((s) => s.trim()).filter(Boolean).join(" • ")
      : "";

  // ── Render states ─────────────────────────────────────────────────────────
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

  return (
    <div className="menu-page">

      {/* Header */}
      <div className="menu-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
        </button>
        <h3>Mess Menu</h3>
        <div className="header-spacer" />
      </div>

      {/* Banner */}
      <div className="menu-banner">
        <img src={menus.lunch?.image || vendorImage} alt="lunch" />
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

      {/* Search + Filters */}
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

      {/* Filter Panel */}
      <div className={`filter-panel ${filterType === "daily" ? "visible" : ""}`}>
        {filterType === "daily" && (
          <div className="date-selector">
            <div className="date-info">
              <span className="date-label">Selected Date</span>
              <span className="date-display">
                {new Date(selectedDate).toLocaleDateString("en-IN", {
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

      {/* Section Title */}
      <div className="section-header">
        <h4 className="menu-title">
          {filterType === "daily"
            ? `Menu for ${getDisplayDate()}`
            : `${filterLabels[filterType].label} Menu`}
        </h4>
        <span className="meal-count">
          {menuLoading ? "…" : `${[menus.lunch, menus.dinner].filter(Boolean).length} options`}
        </span>
      </div>

      {/* Meal Cards */}
      {menuLoading ? (
        <p style={{ padding: "20px", color: "#888" }}>Loading menu…</p>
      ) : (
        <div className="meal-grid">

          {/* Lunch */}
          {menus.lunch && (
            <div className="meal-card" onClick={() => handleMealClick("lunch")}>
              <div className="meal-img-wrap">
                <img src={vendorImage} alt="lunch" />
                <div className="meal-img-overlay" />
              </div>
              <div className="meal-content">
                <div className="meal-top">
                  <span className="meal-time-badge lunch">🌞 Lunch</span>
                  <span className="meal-time-range">
  {menus.lunch?.time || "12:00 – 3:00 PM"}
</span>
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

          {/* Dinner */}
          {menus.dinner && (
            <div className="meal-card" onClick={() => handleMealClick("dinner")}>
              <div className="meal-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800"
                  alt="dinner"
                />
                <div className="meal-img-overlay" />
              </div>
              <div className="meal-content">
                <div className="meal-top">
                  <span className="meal-time-badge dinner">🌙 Dinner</span>
                  <span className="meal-time-range">7:00 – 9:00 PM</span>
                </div>
                <h3>{menus.dinner.name}</h3>
                <p>{parseItems(menus.dinner.description)}</p>
                <div className="meal-footer">
                  <span className="meal-price">₹{Number(menus.dinner.price).toFixed(0)}</span>
                  <button
                    className="order-chip"
                    onClick={(e) => { e.stopPropagation(); handleMealClick("dinner"); }}
                  >
                    Order →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No menus at all */}
          {!menus.lunch && !menus.dinner && (
            <p style={{ padding: "20px", color: "#888" }}>No menu available for this vendor.</p>
          )}

        </div>
      )}
    </div>
  );
};

export default Menus;
