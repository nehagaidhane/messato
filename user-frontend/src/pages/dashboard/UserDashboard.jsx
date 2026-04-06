import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

/* ─── Icons ─── */
import { IoStorefrontOutline } from "react-icons/io5";
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import { FiClock, FiArrowRight } from "react-icons/fi";
import { TbMapPin2 } from "react-icons/tb";
import { RiLeafLine } from "react-icons/ri";

/* ─── Mock vendor data ─── */
const MOCK_VENDORS = [
  {
    id: 1,
    name: "Mom's Mess",
    tagline: "Homestyle tiffins since 2015",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    rating: 4.5,
    ratingCount: 238,
    distance: 0.4,
    isVerified: true,
    isOpen: true,
    subscriptionAvailable: true,
    priceRange: "₹60–₹90",
    cuisine: ["North Indian", "Veg"],
    deliveryTime: "20–30 min",
    tags: ["popular"],
  },
  {
    id: 2,
    name: "Ghar Ka Khana",
    tagline: "Pure vegetarian home food",
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80",
    rating: 4.2,
    ratingCount: 184,
    distance: 0.6,
    isVerified: true,
    isOpen: true,
    subscriptionAvailable: true,
    priceRange: "₹50–₹80",
    cuisine: ["South Indian", "Veg"],
    deliveryTime: "25–35 min",
    tags: ["popular", "recommended"],
  },
  {
    id: 3,
    name: "Tiffin Express",
    tagline: "Fresh & fast daily tiffins",
    image: "https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=800&q=80",
    rating: 3.8,
    ratingCount: 97,
    distance: 0.7,
    isVerified: false,
    isOpen: false,
    subscriptionAvailable: false,
    priceRange: "₹45–₹70",
    cuisine: ["Multi-cuisine"],
    deliveryTime: "30–40 min",
    tags: ["recommended"],
  },
  {
    id: 4,
    name: "Desi Tadka",
    tagline: "Authentic Maharashtrian flavours",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80",
    rating: 4.7,
    ratingCount: 312,
    distance: 0.9,
    isVerified: true,
    isOpen: true,
    subscriptionAvailable: true,
    priceRange: "₹70–₹100",
    cuisine: ["Maharashtrian", "Veg"],
    deliveryTime: "15–25 min",
    tags: ["popular", "recommended"],
  },
  {
    id: 5,
    name: "Annapurna Tiffins",
    tagline: "Balanced nutrition every day",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    rating: 4.0,
    ratingCount: 143,
    distance: 0.8,
    isVerified: true,
    isOpen: true,
    subscriptionAvailable: true,
    priceRange: "₹55–₹85",
    cuisine: ["Gujarati", "Veg"],
    deliveryTime: "20–30 min",
    tags: ["recommended"],
  },
  {
    id: 6,
    name: "Spice Route",
    tagline: "Non-veg specials & combos",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
    rating: 3.5,
    ratingCount: 72,
    distance: 1.0,
    isVerified: false,
    isOpen: true,
    subscriptionAvailable: false,
    priceRange: "₹80–₹130",
    cuisine: ["Non-veg", "Multi"],
    deliveryTime: "35–45 min",
    tags: ["popular"],
  },
];

/* ─── Star renderer ─── */
const Stars = ({ rating }) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="ud-stars">
      {Array(full).fill(0).map((_, i) => <BsStarFill key={`f${i}`} />)}
      {half && <BsStarHalf />}
      {Array(empty).fill(0).map((_, i) => <BsStar key={`e${i}`} />)}
    </span>
  );
};

/* ─── Single vendor card ─── */
const VendorCard = ({ vendor, index }) => {
  const navigate = useNavigate();
  return (
    <div
      className="ud-card"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={() => navigate(`/vendor/${vendor.id}`)}
    >
      <div className="ud-card-img-wrap">
        <img src={vendor.image} alt={vendor.name} className="ud-card-img" loading="lazy" />
        <div className="ud-card-img-overlay" />

        <div className="ud-card-badges">
          {vendor.isVerified && (
            <span className="ud-badge ud-badge-verified">
              <MdVerified /> Verified
            </span>
          )}
          {vendor.subscriptionAvailable && (
            <span className="ud-badge ud-badge-sub">
              <RiLeafLine /> Subscription
            </span>
          )}
        </div>

        <span className={`ud-open-pill ${vendor.isOpen ? "open" : "closed"}`}>
          <span className="ud-open-dot" />
          {vendor.isOpen ? "Open" : "Closed"}
        </span>

        <div className="ud-card-foot">
          <h3 className="ud-card-name">{vendor.name}</h3>
          <p className="ud-card-tagline">{vendor.tagline}</p>
        </div>
      </div>

      <div className="ud-card-info">
        <div className="ud-info-pill ud-pill-rating">
          <Stars rating={vendor.rating} />
          <span className="ud-rating-num">{vendor.rating}</span>
          <span className="ud-rating-count">({vendor.ratingCount})</span>
        </div>

        <div className="ud-info-pill">
          <TbMapPin2 className="ud-pill-icon" />
          <span>{vendor.distance} km</span>
        </div>

        <div className="ud-info-pill">
          <FiClock className="ud-pill-icon" />
          <span>{vendor.deliveryTime}</span>
        </div>

        <div className="ud-info-pill ud-pill-price">
          <span>{vendor.priceRange}</span>
        </div>

        <button
          className="ud-select-btn"
          onClick={e => { e.stopPropagation(); navigate(`/vendor/${vendor.id}`); }}
        >
          Select <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

/* ─── Main page ─── */
const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("popular");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const vendors = useMemo(() =>
    MOCK_VENDORS.filter(v =>
      activeTab === "popular"
        ? v.tags.includes("popular")
        : v.tags.includes("recommended")
    ), [activeTab]);

  return (
    <div className="ud-root">

      {/* ── Tab bar — flush against navbar ── */}
      <div className="ud-tabs-wrap">
        <div className="ud-tabs">
          {[
            { key: "popular",     label: "Most Popular" },
            { key: "recommended", label: "Recommended for You" },
          ].map(tab => (
            <button
              key={tab.key}
              className={`ud-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && <span className="ud-tab-indicator" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vendor list ── */}
      <div className="ud-feed">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="ud-skeleton" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="ud-skel-img" />
              <div className="ud-skel-body">
                <div className="ud-skel-line ud-skel-wide" />
                <div className="ud-skel-line ud-skel-mid" />
                <div className="ud-skel-line ud-skel-short" />
              </div>
            </div>
          ))
        ) : vendors.length === 0 ? (
          <div className="ud-empty">
            <IoStorefrontOutline className="ud-empty-icon" />
            <p>No vendors found nearby</p>
            <span>Try changing your location or filter</span>
          </div>
        ) : (
          vendors.map((v, i) => <VendorCard key={v.id} vendor={v} index={i} />)
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
