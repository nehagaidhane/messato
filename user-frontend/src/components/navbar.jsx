import "./navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { CiLocationOn } from "react-icons/ci";
import { IoNotificationsOutline, IoSearchOutline } from "react-icons/io5";
import { HiOutlineHome, HiHome } from "react-icons/hi2";
import { BsCart3, BsCartFill } from "react-icons/bs";
import { RiUser3Line, RiUser3Fill } from "react-icons/ri";
import { useCart } from "./usecart";
import CartDrawer from "./cartDrawer";
import api from "../api/axios";

/* ─── helpers ─── */
const getRole = () => {
  try {
    const v = localStorage.getItem("vendor");
    if (v && JSON.parse(v)?.id) return "vendor";
    const u = localStorage.getItem("user");
    if (u && JSON.parse(u)?.id) return "user";
    return null;
  } catch { return null; }
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

/* ─── FIX: build a short display address from location data ─── */
const buildShortAddress = (raw) => {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (p?.address) return p.address;
  } catch { /* raw string fallback */ }
  return null;
};

/* ─── Root ─── */
const Navbar = () => {
  const { pathname } = useLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const role = useMemo(() => getRole(), [pathname]);
  if (role === "vendor") return null;
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();
  return <UserNavbar user={user} />;
};

/* ─── User Navbar ─── */
const UserNavbar = ({ user }) => {
  const navigate      = useNavigate();
  const { pathname }  = useLocation();
const token =
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

  const { cart, cartOpen, setCartOpen } = useCart();
  const cartCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);

  /* ── LOCATION STATE (fixed) ── */
  const [location, setLocation] = useState(() => {
    // Priority 1: USER_LOCATION key (set by this navbar)
    const saved = buildShortAddress(localStorage.getItem("USER_LOCATION"));
    if (saved) return saved;
    // Priority 2: user.location from auth
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (u?.location) return u.location;
    } catch { /* ignore */ }
    return null; // null = we'll attempt geolocation on mount
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotif,     setShowNotif]     = useState(false);
  const [showLocModal,  setShowLocModal]  = useState(false);
  const [locSearch,     setLocSearch]     = useState("");
  const [suggestions,   setSuggestions]  = useState([]);
  const [detecting,     setDetecting]    = useState(false);

  const notifRef = useRef(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);
  const firstName   = user?.name?.split(" ")[0] || "there";
  const greeting    = getGreeting();
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  const activeTab = pathname.includes("cart")
    ? "cart"
    : pathname.includes("profile") || pathname.includes("Profile")
    ? "profile"
    : "home";

  /* ── Auto-detect location on first load if none saved ── */
  useEffect(() => {
    if (location) return; // already have one
    if (!navigator.geolocation) { setLocation("Location unavailable"); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res  = await // ✅ CORRECT
fetch(`http://localhost:5000/api/user/reverse-geocode?lat=${coords.latitude}&lng=${coords.longitude}`)
          const data = await res.json();
          const addr = data.address;
          const area = addr?.suburb || addr?.neighbourhood || addr?.town || addr?.village || "";
          const city = addr?.city   || addr?.state_district || addr?.state || "";
          const address = [area, city].filter(Boolean).join(", ");
          applyLocation({ address: address || "Your location", lat: coords.latitude, lng: coords.longitude });
        } catch {
          setLocation("Location unavailable");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setLocation("Set location");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fetch notifications ── */
  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (alive) setNotifications(Array.isArray(data) ? data : []);
      } catch { if (alive) setNotifications([]); }
    })();
    return () => { alive = false; };
  }, [pathname, token]);

  /* ── Listen for location changes from other components ── */
  useEffect(() => {
    const h = (e) => { if (e.detail?.address) setLocation(e.detail.address); };
    window.addEventListener("locationChanged", h);
    return () => window.removeEventListener("locationChanged", h);
  }, []);

  /* ── Outside-click: close notification panel ── */
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Debounced location search ── */
  useEffect(() => {
    if (!locSearch.trim()) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(
          `http://localhost:5000/api/user/search-location?q=${encodeURIComponent(locSearch)}`
        );
        const data = await res.json();
        setSuggestions(
          data.map(d => ({ display_name: d.display_name, lat: d.lat, lng: d.lon }))
        );
      } catch { setSuggestions([]); }
    }, 400);
    return () => clearTimeout(t);
  }, [locSearch]);

  /* ── Manual detect inside modal ── */
  const detectLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res  = await fetch(
            `http://localhost:5000/api/user/reverse-geocode?lat=${coords.latitude}&lng=${coords.longitude}`
          );
          const data = await res.json();
          const addr = data.address;
          const area = addr?.suburb || addr?.neighbourhood || addr?.town || addr?.village || "";
          const city = addr?.city   || addr?.state_district || addr?.state || "";
          const address = [area, city].filter(Boolean).join(", ");
          applyLocation({ address: address || "Your location", lat: coords.latitude, lng: coords.longitude });
        } catch { alert("Could not fetch address."); }
        finally { setDetecting(false); }
      },
      () => { alert("Location permission denied"); setDetecting(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
const applyLocation = async ({ address, lat, lng }) => {
  setLocation(address);

  // ✅ Save in localStorage
  localStorage.setItem("USER_LOCATION", JSON.stringify({ address, lat, lng }));

  // ✅ ALSO SAVE IN DATABASE
  try {
    await api.post("/user/save-location", {
      latitude: lat,
      longitude: lng,
      address: address,
      city: "",
      state: "",
      zip: "",
      town: "",
    });
  } catch (err) {
    console.error("Navbar location save failed:", err);
  }

  window.dispatchEvent(new CustomEvent("locationChanged", { detail: { address, lat, lng } }));

  setShowLocModal(false);
  setLocSearch("");
  setSuggestions([]);
};

  const markAllRead = async () => {
    await Promise.all(
      notifications.filter(n => !n.is_read).map(n =>
        fetch(`http://localhost:5000/api/notifications/${n.id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  /* Short location label for display */
  const displayLoc = (() => {
    if (!location) return detecting ? "Detecting…" : "Set location";
    if (detecting)  return "Detecting…";
    const parts = location.split(",");
    return parts.length >= 2
      ? `${parts[0].trim()}, ${parts[1].trim()}`
      : location;
  })();

  return (
    <>
      {/* ═══════════════════════════════════════
          DESKTOP NAVBAR
      ═══════════════════════════════════════ */}
      <header className="dnav">
        <div className="dnav-inner">

          {/* Logo */}
          <div className="dnav-logo" onClick={() => navigate("/dashboard")}>
            Messato
          </div>

          <div className="dnav-sep" />

          {/* Location chip */}
          <button className="dnav-loc" onClick={() => setShowLocModal(true)}>
            <div className="dnav-loc-icon-wrap">
              <CiLocationOn className="dnav-loc-icon" />
            </div>
            <div className="dnav-loc-text">
              <span className="dnav-loc-label">Delivery to</span>
              <span className="dnav-loc-addr">{displayLoc} ▾</span>
            </div>
          </button>

          {/* Search */}
          <div className="dnav-search-wrap">
            <IoSearchOutline className="dnav-search-icon" />
            <input className="dnav-search" type="text" placeholder="Search tiffin, vendors…" />
          </div>

          {/* Right icons */}
          <div className="dnav-right">

            {/* Home */}
            <button
              className={`dnav-nav-btn ${activeTab === "home" ? "active" : ""}`}
              onClick={() => navigate("/dashboard")}
            >
              {activeTab === "home" ? <HiHome /> : <HiOutlineHome />}
              <span>Home</span>
            </button>

            {/* Cart */}
            <button
              className={`dnav-nav-btn ${activeTab === "cart" ? "active" : ""}`}
              onClick={() => setCartOpen(true)}
            >
              <div className="dnav-icon-wrap">
                {activeTab === "cart" ? <BsCartFill /> : <BsCart3 />}
                {cartCount > 0 && <span className="dnav-badge">{cartCount}</span>}
              </div>
              <span>Cart</span>
            </button>

            {/* Notifications */}
            <div className="dnav-notif-wrap" ref={notifRef}>
              <button
                className={`dnav-icon-btn ${unreadCount > 0 ? "has-notif" : ""}`}
                onClick={() => { setShowNotif(p => !p); if (!showNotif) markAllRead(); }}
              >
                <div className="dnav-icon-wrap">
                  <IoNotificationsOutline />
                  {unreadCount > 0 && <span className="dnav-badge">{unreadCount}</span>}
                </div>
              </button>
              {showNotif && (
                <div className="dnav-notif-dropdown">
                  <div className="dnav-notif-head">Notifications</div>
                  {notifications.length === 0
                    ? <p className="dnav-notif-empty">No notifications yet</p>
                    : notifications.map(n => (
                      <div key={n.id} className={`dnav-notif-item ${n.is_read ? "" : "unread"}`}>
                        {n.message}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Profile — navigates to /Profile page directly */}
            <button
              className={`dnav-avatar ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => navigate("/Profile")}
              title="Go to Profile"
            >
              {userInitial}
            </button>

          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          MOBILE HEADER
      ═══════════════════════════════════════ */}
      <header className="mnav-header">
        <div className="mnav-top">
          {/* Location */}
          <button className="mnav-loc-btn" onClick={() => setShowLocModal(true)}>
            <span className="mnav-loc-label">Location</span>
            <div className="mnav-loc-row">
              <CiLocationOn className="mnav-loc-icon" />
              <span className="mnav-loc-text">{displayLoc}</span>
              <span className="mnav-loc-caret">▾</span>
            </div>
          </button>

          {/* Bell */}
          <div className="mnav-notif-wrap" ref={notifRef}>
            <button
              className={`mnav-bell-btn ${unreadCount > 0 ? "has-notif" : ""}`}
              onClick={() => { setShowNotif(p => !p); if (!showNotif) markAllRead(); }}
            >
              <IoNotificationsOutline />
              {unreadCount > 0 && <span className="mnav-badge">{unreadCount}</span>}
            </button>
            {showNotif && (
              <div className="mnav-notif-dropdown">
                <div className="mnav-notif-header">Notifications</div>
                {notifications.length === 0
                  ? <p className="mnav-notif-empty">No notifications yet</p>
                  : notifications.map(n => (
                    <div key={n.id} className={`mnav-notif-item ${n.is_read ? "" : "unread"}`}>
                      {n.message}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Greeting */}
        {user && (
          <p className="mnav-greeting">
            Hey {firstName},&nbsp;
            <span className="mnav-greeting-accent">{greeting}!</span>
          </p>
        )}

        {/* Search */}
        <div className="mnav-search-wrap">
          <IoSearchOutline className="mnav-search-icon" />
          <input className="mnav-search" type="text" placeholder="Search tiffin, vendors…" />
        </div>
      </header>

      {/* ═══════════════════════════════════════
          MOBILE TAB BAR
      ═══════════════════════════════════════ */}
      <nav className="mnav-tabbar">
        <button
          className={`mnav-tab ${activeTab === "home" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          {activeTab === "home"
            ? <HiHome className="mnav-tab-icon" />
            : <HiOutlineHome className="mnav-tab-icon" />}
          <span className="mnav-tab-label">Home</span>
        </button>

        <button
          className={`mnav-tab ${activeTab === "cart" ? "active" : ""}`}
          onClick={() => setCartOpen(true)}
        >
          <div className="mnav-tab-icon-wrap">
            {activeTab === "cart"
              ? <BsCartFill className="mnav-tab-icon" />
              : <BsCart3 className="mnav-tab-icon" />}
            {cartCount > 0 && <span className="mnav-tab-badge">{cartCount}</span>}
          </div>
          <span className="mnav-tab-label">Cart</span>
        </button>

        <button
          className={`mnav-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => navigate("/Profile")}
        >
          {activeTab === "profile"
            ? <RiUser3Fill className="mnav-tab-icon" />
            : <RiUser3Line className="mnav-tab-icon" />}
          <span className="mnav-tab-label">Profile</span>
        </button>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ═══════════════════════════════════════
          LOCATION MODAL
      ═══════════════════════════════════════ */}
      {showLocModal && (
        <div
          className="mnav-loc-overlay"
          onClick={e => { if (e.target === e.currentTarget) setShowLocModal(false); }}
        >
          <div className="mnav-loc-modal">
            <div className="mnav-loc-modal-head">
              <h3>Change Location</h3>
              <button className="mnav-loc-modal-close" onClick={() => setShowLocModal(false)}>✕</button>
            </div>

            <button className="mnav-detect-btn" onClick={detectLocation} disabled={detecting}>
              <CiLocationOn />
              {detecting ? "Detecting…" : "Use my current location"}
            </button>

            <div className="mnav-or">— or search manually —</div>

            <div className="mnav-loc-search-wrap">
              <IoSearchOutline className="mnav-loc-search-icon" />
              <input
                className="mnav-loc-search"
                type="text"
                placeholder="Search area, locality…"
                value={locSearch}
                onChange={e => setLocSearch(e.target.value)}
                autoFocus
              />
            </div>

            {suggestions.length > 0 && (
              <ul className="mnav-suggestions">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="mnav-sug-item"
                    onClick={() =>
                      applyLocation({
                        address: s.display_name,
                        lat: Number(s.lat),
                        lng: Number(s.lng),
                      })
                    }
                  >
                    <CiLocationOn className="mnav-sug-icon" />
                    <div>
                      <p className="mnav-sug-main">{s.display_name.split(",")[0]}</p>
                      <p className="mnav-sug-sub">{s.display_name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
