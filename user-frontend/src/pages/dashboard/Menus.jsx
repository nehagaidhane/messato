import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiArrowLeft, FiSearch, FiClock, FiStar } from "react-icons/fi";
import "./Menus.css";

const MOCK_VENDOR = {
  "1": {
    name: "Mom's Mess",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
    deliveryTime: "20–30 min",
    rating: 4.8,
    cuisine: "Home Style • North Indian",
  },
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const getDisplayDate = () => {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const Menus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [searchQuery, setSearchQuery] = useState("");

  const isSubscribed = false;
  const vendor = MOCK_VENDOR[id];

  if (!vendor) return <h2>No Vendor Found</h2>;

  const handleMealClick = (mealType) => {
    if (filterType === "daily") {
      navigate(`/tiffin/${id}/${mealType}?date=${selectedDate}`);
    }
    if (filterType === "weekly") {
      if (!isSubscribed) { alert("Subscribe to access weekly plan"); return; }
      navigate(`/tiffin/${id}/${mealType}?plan=weekly`);
    }
    if (filterType === "monthly") {
      if (!isSubscribed) { alert("Subscribe to access monthly plan"); return; }
      navigate(`/tiffin/${id}/${mealType}?plan=monthly`);
    }
  };

  const filterLabels = {
    daily: { icon: "📅", label: "Daily" },
    weekly: { icon: "📆", label: "Weekly" },
    monthly: { icon: "🗓", label: "Monthly" },
  };

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
        <img src={vendor.image} alt={vendor.name} />
        <div className="banner-gradient" />
        <div className="menu-overlay">
          <span className="badge">✓ Verified</span>
          <h2>{vendor.name}</h2>
          <p className="cuisine-tag">{vendor.cuisine}</p>
          <div className="meta-row">
            <span><FiClock size={13} /> {vendor.deliveryTime}</span>
            <span><FiStar size={13} /> {vendor.rating}</span>
          </div>
        </div>
        <button className="sub-btn" onClick={() => navigate(`/subscription/${id}`)}>
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
              <span className="date-display">{new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</span>
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
            <button className="unlock-btn" onClick={() => navigate(`/subscription/${id}`)}>Unlock</button>
          </div>
        )}
        {filterType === "monthly" && (
          <div className="plan-notice">
            <span>🗓</span>
            <div>
              <strong>Monthly Plan</strong>
              <p>Subscribe for the best value tiffin deal</p>
            </div>
            <button className="unlock-btn" onClick={() => navigate(`/subscription/${id}`)}>Unlock</button>
          </div>
        )}
      </div>

      {/* Section Title */}
      <div className="section-header">
        <h4 className="menu-title">
          {filterType === "daily" ? `Menu for ${getDisplayDate()}` : `${filterLabels[filterType].label} Menu`}
        </h4>
        <span className="meal-count">2 options</span>
      </div>

      {/* Meal Cards */}
      <div className="meal-grid">
        <div className="meal-card" onClick={() => handleMealClick("lunch")}>
          <div className="meal-img-wrap">
            <img src={vendor.image} alt="lunch" />
            <div className="meal-img-overlay" />
          </div>
          <div className="meal-content">
            <div className="meal-top">
              <span className="meal-time-badge lunch">🌞 Lunch</span>
              <span className="meal-time-range">12:00 – 3:00 PM</span>
            </div>
            <h3>Afternoon Tiffin</h3>
            <p>Sabji • Chapati • Papad • Halwa</p>
            <div className="meal-footer">
              <span className="meal-price">₹40</span>
              <button className="order-chip" onClick={(e) => { e.stopPropagation(); handleMealClick("lunch"); }}>
                Order →
              </button>
            </div>
          </div>
        </div>

        <div className="meal-card" onClick={() => handleMealClick("dinner")}>
          <div className="meal-img-wrap">
            <img src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800" alt="dinner" />
            <div className="meal-img-overlay" />
          </div>
          <div className="meal-content">
            <div className="meal-top">
              <span className="meal-time-badge dinner">🌙 Dinner</span>
              <span className="meal-time-range">7:00 – 9:00 PM</span>
            </div>
            <h3>Evening Tiffin</h3>
            <p>Paneer • Chapati • Rice • Salad</p>
            <div className="meal-footer">
              <span className="meal-price">₹50</span>
              <button className="order-chip" onClick={(e) => { e.stopPropagation(); handleMealClick("dinner"); }}>
                Order →
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Menus;
