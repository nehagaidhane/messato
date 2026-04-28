import { useState, useEffect } from "react";
import { Menu as MenuIcon, X } from "lucide-react";
import { T } from "../../constants/theme";
import api from "../../api/axios";
import Sidebar   from "../../components/Slidebar";
import Topbar    from "../../components/Topbar";
import DashboardPage from "./dashboard";
import OrdersPage    from "./OrderPages";
import MenuPage      from "./MenuPages";
import ProfilePage   from "./ProfilePages";
import SettingsPage  from "./SettingPages";

// ── Global styles injected once ─────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body, #root { height: 100%; }
  body { background: #0F1117; font-family: 'DM Sans', sans-serif; color: #F0F2FF; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #1A1D27; }
  ::-webkit-scrollbar-thumb { background: #2A2F4A; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #4F6EF7; }
  input, select, textarea, button { font-family: 'DM Sans', sans-serif; }

  /* ── Responsive breakpoints ── */
  @media (max-width: 1024px) {
    .vd-sidebar-desktop { display: none !important; }
    .vd-mobile-overlay  { display: flex !important; }
    .vd-topbar-mobile-btn { display: flex !important; }
  }
  @media (min-width: 1025px) {
    .vd-mobile-overlay    { display: none !important; }
    .vd-topbar-mobile-btn { display: none !important; }
  }
`;

export default function VendorDashboard() {
  const [active,    setActive]    = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);   // mobile drawer open?
  const [isMobile,  setIsMobile]  = useState(false);

  // Detect screen size
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile nav on page change
  const navigate = (page) => { setActive(page); setMobileNav(false); };

  const handleLogout = async () => {
    try {
      await api.post("/auth/vendor/logout");
    } catch (err) {
      console.warn("Vendor logout API failed, clearing local auth anyway", err?.message);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("userEmail");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const PAGE = {
    home:     <DashboardPage onNavigate={navigate} />,
    orders:   <OrdersPage />,
    menu:     <MenuPage />,
    profile:  <ProfilePage />,
    settings: <SettingsPage />,
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden", position: "relative" }}>

        {/* ── Desktop Sidebar ──────────────────────────── */}
        <div className="vd-sidebar-desktop" style={{ display: "flex" }}>
          <Sidebar
            active={active}
            setActive={navigate}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLogout={handleLogout}
          />
        </div>

        {/* ── Mobile Sidebar Overlay ───────────────────── */}
        {mobileNav && (
          <div
            className="vd-mobile-overlay"
            style={{
              position: "fixed", inset: 0, zIndex: 300,
              display: "flex",
            }}
          >
            {/* Backdrop */}
            <div
              onClick={() => setMobileNav(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)" }}
            />
            {/* Drawer */}
            <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
              <Sidebar
                active={active}
                setActive={navigate}
                collapsed={false}
                setCollapsed={() => {}}
                onLogout={handleLogout}
              />
            </div>
            {/* Close button */}
            <button
              onClick={() => setMobileNav(false)}
              style={{
                position: "absolute", top: 16, right: 16,
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 10, padding: 8, cursor: "pointer", color: T.textSecondary,
                display: "flex", zIndex: 2,
              }}
            ><X size={18} /></button>
          </div>
        )}

        {/* ── Main Content ─────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Topbar */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Mobile hamburger */}
            <button
              className="vd-topbar-mobile-btn"
              onClick={() => setMobileNav(true)}
              style={{
                display: "none",       // overridden by CSS media query
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 16,
                marginTop: "auto",
                marginBottom: "auto",
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                color: T.textSecondary,
                flexShrink: 0,
                height: 36,
                width: 36,
                alignSelf: "center",
              }}
            >
              <MenuIcon size={18} />
            </button>

            <div style={{ flex: 1 }}>
              <Topbar active={active} />
            </div>
          </div>

          {/* Page */}
          <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px" : "28px 32px" }}>
            {PAGE[active]}
          </main>
        </div>
      </div>
    </>
  );
}
