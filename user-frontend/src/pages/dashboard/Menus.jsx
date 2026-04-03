import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import "./Menus.css";

const MOCK_VENDOR = {
  "1": {
    name: "Mom's Mess",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
    deliveryTime: "20–30 min",
  },
};

const Menus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState("");

  // 🔥 Later from backend
  const isSubscribed = false;

  const vendor = MOCK_VENDOR[id];

  if (!vendor) return <h2>No Vendor Found</h2>;

  const handleMealClick = (mealType) => {
    if (filterType === "daily") {
      if (!selectedDate) {
        alert("Please select a date");
        return;
      }
      navigate(`/tiffin/${id}/${mealType}?date=${selectedDate}`);
    }

    if (filterType === "weekly") {
      if (!isSubscribed) {
        alert("Subscribe to access weekly plan");
        return;
      }
      navigate(`/tiffin/${id}/${mealType}?plan=weekly`);
    }

    if (filterType === "monthly") {
      if (!isSubscribed) {
        alert("Subscribe to access monthly plan");
        return;
      }
      navigate(`/tiffin/${id}/${mealType}?plan=monthly`);
    }
  };

  return (
    <div className="menu-page">

      {/* Header */}
      <div className="menu-header">
        <button onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h3>Mess Menu</h3>
      </div>

      {/* Banner */}
      <div className="menu-banner">
        <img src={vendor.image} alt={vendor.name} />
        <div className="menu-overlay">
          <span className="badge">Verified</span>
          <h2>{vendor.name}</h2>
          <p>{vendor.deliveryTime}</p>
        </div>
        <button className="sub-btn">Subscription</button>
      </div>

      {/* Search + Filters */}
      <div className="menu-search-bar">
        <input placeholder="Search Tiffin" />

        <button
          className={filterType === "daily" ? "active" : ""}
          onClick={() => setFilterType("daily")}
        >📅</button>

        <button
          className={filterType === "weekly" ? "active" : ""}
          onClick={() => setFilterType("weekly")}
        >📆</button>

        <button
          className={filterType === "monthly" ? "active" : ""}
          onClick={() => setFilterType("monthly")}
        >🗓</button>
      </div>

      {/* Filter UI */}
      {filterType === "daily" && (
        <div className="filter-box">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      )}

      {filterType === "weekly" && (
        <div className="filter-box">
          <p>Weekly Plan (Subscription Required)</p>
        </div>
      )}

      {filterType === "monthly" && (
        <div className="filter-box">
          <p>Monthly Plan (Subscription Required)</p>
        </div>
      )}

      {/* Menu */}
      <h4 className="menu-title">Today Menu</h4>

      <div className="meal-card" onClick={() => handleMealClick("lunch")}>
        <img src={vendor.image} alt="lunch" />
        <div className="meal-overlay">
          <p>Delivery: 12:00 – 3:00 PM</p>
          <h3>Lunch</h3>
        </div>
      </div>

      <div className="meal-card" onClick={() => handleMealClick("dinner")}>
        <img src={vendor.image} alt="dinner" />
        <div className="meal-overlay">
          <p>Delivery: 7:00 – 9:00 PM</p>
          <h3>Dinner</h3>
        </div>
      </div>

    </div>
  );
};

export default Menus;


