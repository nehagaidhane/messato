import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

/* ─── Axios instance (already has baseURL + auth token) ─── */
import api from "../../api/axios";   

/* ─── Icons ─── */
import { IoStorefrontOutline } from "react-icons/io5";
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import { FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { TbMapPin2 } from "react-icons/tb";
import { RiLeafLine } from "react-icons/ri";

/* ─────────────────────────────────────────────
   Geolocation hook
───────────────────────────────────────────── */
function useGeolocation() {
  const [coords,   setCoords]   = useState(null);
  const [geoError, setGeoError] = useState(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return "Geolocation is not supported by your browser.";
    }
    return null;
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        setGeoError(
          err.code === 1
            ? "Location permission denied. Please allow location access."
            : "Unable to detect your location."
        ),
      { timeout: 10_000 }
    );
  }, []);

  return { coords, geoError };
}

/* ─────────────────────────────────────────────
   Star renderer
───────────────────────────────────────────── */
const Stars = ({ rating }) => {
  // ✅ Ensure valid rating
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  const full  = Math.floor(safeRating);
  const half  = safeRating % 1 >= 0.5;
  const empty = Math.max(0, 5 - full - (half ? 1 : 0));
  return (
    <span className="ud-stars">
      {Array(full).fill(0).map((_, i) => <BsStarFill key={`f${i}`} />)}
      {half && <BsStarHalf />}
      {Array(empty).fill(0).map((_, i) => <BsStar key={`e${i}`} />)}
    </span>
  );
};

/* ─────────────────────────────────────────────
   Vendor card
───────────────────────────────────────────── */
const VendorCard = ({ vendor, index }) => {
  const navigate = useNavigate();

  /* Derive open/closed from operating_days string e.g. "Mon-Sat" */
  const isOpen = useMemo(() => {
    if (!vendor.operatingDays) return true;
    const days  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = days[new Date().getDay()];
    return vendor.operatingDays.toLowerCase().includes(today.toLowerCase());
  }, [vendor.operatingDays]);

  /* Derive veg status from food_type JSON array */
  const isVeg = useMemo(() => {
    const ft = Array.isArray(vendor.foodType)
      ? vendor.foodType
      : typeof vendor.foodType === "string"
      ? JSON.parse(vendor.foodType || "[]")
      : [];
    return ft.some((f) => f.toLowerCase() === "veg");
  }, [vendor.foodType]);

  const imgSrc =
    vendor.image ||
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80";

  return (
    <div
      className="ud-card"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={() => navigate(`/vendor/${vendor.id}`)}
    >
      <div className="ud-card-img-wrap">
        <img src={imgSrc} alt={vendor.name} className="ud-card-img" loading="lazy" />
        <div className="ud-card-img-overlay" />

        <div className="ud-card-badges">
          {vendor.vendorId && (
            <span className="ud-badge ud-badge-verified">
              <MdVerified /> Verified
            </span>
          )}
          {isVeg && (
            <span className="ud-badge ud-badge-sub">
              <RiLeafLine /> Pure Veg
            </span>
          )}
        </div>

        <span className={`ud-open-pill ${isOpen ? "open" : "closed"}`}>
          <span className="ud-open-dot" />
          {isOpen ? "Open" : "Closed"}
        </span>

        <div className="ud-card-foot">
          <h3 className="ud-card-name">{vendor.name}</h3>
          <p className="ud-card-tagline">
            {vendor.tagline || vendor.cuisineType || "Home-style tiffin"}
          </p>
        </div>
      </div>

      <div className="ud-card-info">
        <div className="ud-info-pill ud-pill-rating">
          <Stars rating={vendor.rating} />
          <span className="ud-rating-num">{(vendor.rating ?? 0).toFixed(1)}</span>
          <span className="ud-rating-count">({vendor.ratingCount})</span>
        </div>

        <div className="ud-info-pill">
          <TbMapPin2 className="ud-pill-icon" />
          <span>
  {vendor.distance !== undefined
    ? `${vendor.distance.toFixed(1)} km`
    : "N/A"}
</span>
        </div>

        {vendor.cuisineType && (
          <div className="ud-info-pill">
            <span>{vendor.cuisineType}</span>
          </div>
        )}

        <div className="ud-info-pill ud-pill-price">
          <span>{vendor.town || vendor.city || "Nearby"}</span>
        </div>

        <button
          className="ud-select-btn"
          onClick={(e) => { e.stopPropagation(); navigate(`/vendor/${vendor.id}`); }}
        >
          Select <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Skeleton loader
───────────────────────────────────────────── */
const SkeletonList = () =>
  Array(3).fill(0).map((_, i) => (
    <div key={i} className="ud-skeleton" style={{ animationDelay: `${i * 0.1}s` }}>
      <div className="ud-skel-img" />
      <div className="ud-skel-body">
        <div className="ud-skel-line ud-skel-wide" />
        <div className="ud-skel-line ud-skel-mid" />
        <div className="ud-skel-line ud-skel-short" />
      </div>
    </div>
  ));

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("popular");
  const [vendors,   setVendors]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [apiError,  setApiError]  = useState(null);

  const { coords, geoError } = useGeolocation();

  const loadVendors = useCallback(async () => {
    if (!coords) return;
    setLoading(true);
    setApiError(null);
    try {
      /*
        Your axios instance baseURL = "http://localhost:5000/api/auth"
        We override baseURL here to hit /api/vendors/nearby instead.
        The auth interceptor still runs, so the Bearer token is attached.
      */
      const { data } = await api.get("/vendors/nearby", {
        baseURL: "http://localhost:5000/api",
        params: {
          lat: coords.lat,
          lng: coords.lng,
          tab: activeTab,
        },
      });
      setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
      setApiError(
        err.response?.data?.error || err.message || "Failed to load vendors."
      );
    } finally {
      setLoading(false);
    }
  }, [coords, activeTab]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const showSkeleton = loading || (!coords && !geoError);

  return (
    <div className="ud-root">

      {/* ── Tab bar ── */}
      <div className="ud-tabs-wrap">
        <div className="ud-tabs">
          {[
            { key: "popular",     label: "Most Popular" },
            { key: "recommended", label: "Recommended for You" },
          ].map((tab) => (
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

      {/* ── Feed ── */}
      <div className="ud-feed">

        {/* Geolocation error */}
        {geoError && !loading && (
          <div className="ud-empty">
            <FiAlertCircle className="ud-empty-icon" />
            <p>{geoError}</p>
            <span>Enable location to see nearby vendors</span>
          </div>
        )}

        {/* API error with retry */}
        {apiError && !loading && (
          <div className="ud-empty">
            <FiAlertCircle className="ud-empty-icon" />
            <p>Something went wrong</p>
            <span>{apiError}</span>
            <button className="ud-select-btn" style={{ marginTop: 12 }} onClick={loadVendors}>
              Retry <FiArrowRight />
            </button>
          </div>
        )}

        {/* Skeletons while waiting for location or API */}
        {showSkeleton && !geoError && !apiError && <SkeletonList />}

        {/* No vendors found */}
        {!showSkeleton && !geoError && !apiError && vendors.length === 0 && (
          <div className="ud-empty">
            <IoStorefrontOutline className="ud-empty-icon" />
            <p>No vendors found nearby</p>
            <span>Try changing your location or filter</span>
          </div>
        )}

        {/* Vendor cards */}
        {!showSkeleton && !geoError && !apiError &&
          vendors.map((v, i) => <VendorCard key={v.id} vendor={v} index={i} />)}
      </div>
    </div>
  );
};

export default UserDashboard;
