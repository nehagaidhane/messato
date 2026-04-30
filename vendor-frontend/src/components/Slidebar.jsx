import {
  LayoutDashboard, ShoppingCart, User, UtensilsCrossed,
  Settings, Menu, LogOut,
} from "lucide-react";
import { T } from "../constants/theme";

const ICON_MAP = {
  LayoutDashboard, ShoppingCart, User, UtensilsCrossed, Settings,
};

const NAV_ITEMS = [
  { id: "home",     label: "Dashboard", iconKey: "LayoutDashboard" },
  { id: "orders",   label: "Orders",    iconKey: "ShoppingCart",   badge: 3 },
  { id: "menu",     label: "Menu",      iconKey: "UtensilsCrossed" },
  { id: "profile",  label: "Profile",   iconKey: "User" },
  { id: "settings", label: "Settings",  iconKey: "Settings" },
];

export default function Sidebar({ active, setActive, collapsed, setCollapsed, onLogout }) {
  return (
    <aside style={{
      width: collapsed ? 72 : 240,
      flexShrink: 0,
      background: T.surface,
      borderRight: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      transition: "width 0.3s ease",
      overflow: "hidden",
      zIndex: 100,
    }}>
      {/* ── Logo ─────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? "18px 16px" : "18px 22px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 12, minHeight: 68,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: T.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>🍱</div>
        {!collapsed && (
          <div>
            <div style={{
              fontSize: 17, fontWeight: 800, color: T.textPrimary,
              fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em",
            }}>Messato</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>Vendor Panel</div>
          </div>
        )}
      </div>

      {/* ── Nav Items ────────────────────────────────── */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const Icon = ICON_MAP[item.iconKey];
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: "100%",
                background: isActive ? `${T.accent}20` : "transparent",
                color: isActive ? T.accent : T.textSecondary,
                border: "none",
                borderRadius: 10,
                padding: collapsed ? "12px" : "11px 14px",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 11,
                position: "relative",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "all 0.18s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  width: 3, height: 22, background: T.accent, borderRadius: "0 3px 3px 0",
                }} />
              )}

              <Icon size={18} style={{ flexShrink: 0 }} />

              {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}

              {/* Badge — full label */}
              {item.badge && !collapsed && (
                <span style={{
                  background: T.red, color: "#fff",
                  borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700,
                }}>{item.badge}</span>
              )}

              {/* Badge — dot when collapsed */}
              {item.badge && collapsed && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  width: 8, height: 8, background: T.red, borderRadius: "50%",
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom Controls ──────────────────────────── */}
      <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Logout */}
        <button
          onClick={onLogout}
          title={collapsed ? "Log Out" : undefined}
          style={{
            width: "100%", background: "transparent",
            border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "10px",
            color: T.red, cursor: "pointer",
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10, fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <LogOut size={15} />
          {!collapsed && <span>Log Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Expand" : "Collapse"}
          style={{
            width: "100%", background: "transparent",
            border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "10px",
            color: T.textMuted, cursor: "pointer",
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10, fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Menu size={15} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
