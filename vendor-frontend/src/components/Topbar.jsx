import { useState, useRef, useEffect } from "react";
import {
  Bell, Calendar, ChevronDown, CheckCircle2,
  ShoppingCart, IndianRupee, Users, X,
  LayoutDashboard, UtensilsCrossed, User, Settings,
} from "lucide-react";
import { T } from "../constants/theme";

const ICON_MAP = {
  LayoutDashboard, ShoppingCart, User, UtensilsCrossed, Settings,
};

const NAV_LABELS = {
  home: "Dashboard", orders: "Orders", menu: "Menu", profile: "Profile", settings: "Settings",
};

const NOTIFICATIONS = [
  { id: 1, icon: ShoppingCart,  color: "#4F6EF7", title: "New order received",           desc: "Aman Singh · Daily Thali (Lunch) × 10",  time: "2 min ago",  read: false },
  { id: 2, icon: IndianRupee,   color: "#22C55E", title: "Payment received",              desc: "₹650 from Vikram Shah · Weekly Plan",     time: "15 min ago", read: false },
  { id: 3, icon: Users,         color: "#EAB308", title: "New subscriber",                desc: "Pooja Verma subscribed to Monthly Plan",  time: "1 hr ago",   read: false },
  { id: 4, icon: ShoppingCart,  color: "#F97316", title: "Order #ORD-003 needs attention","desc": "Rahul Kumar's order is still Preparing", time: "2 hr ago",  read: true  },
  { id: 5, icon: CheckCircle2,  color: "#22C55E", title: "Order delivered",               desc: "ORD-005 delivered to Vikram Shah",        time: "3 hr ago",   read: true  },
];

export default function Topbar({ active }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [notifs, setNotifs]       = useState(NOTIFICATIONS);
  const notifRef = useRef();
  const userRef  = useRef();

  const unread = notifs.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <header style={{
      background: T.surface,
      borderBottom: `1px solid ${T.border}`,
      height: 64,
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      zIndex: 90,
    }}>
      {/* Left — page breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${T.accent}20`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 16 }}>
            {{ home: "📊", orders: "🛒", menu: "🍱", profile: "👤", settings: "⚙️" }[active]}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
            {NAV_LABELS[active] || "Dashboard"}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted }}>Messato Vendor</div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Date */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: "6px 12px",
          fontSize: 12, color: T.textSecondary,
        }}>
          <Calendar size={13} color={T.textMuted} /> {today}
        </div>

        {/* ── Notifications ── */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: notifOpen ? `${T.accent}20` : T.card,
              border: `1px solid ${notifOpen ? T.accent : T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}
          >
            <Bell size={16} color={notifOpen ? T.accent : T.textSecondary} />
            {unread > 0 && (
              <div style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, background: T.red,
                borderRadius: "50%", border: `2px solid ${T.surface}`,
              }} />
            )}
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 360, background: T.card,
              border: `1px solid ${T.border}`, borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              overflow: "hidden", zIndex: 200,
            }}>
              {/* Header */}
              <div style={{
                padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
                    Notifications
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>
                    {unread} unread
                  </div>
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{
                    background: `${T.accent}20`, color: T.accent, border: "none",
                    borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>Mark all read</button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {notifs.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} style={{
                      display: "flex", gap: 12, padding: "14px 20px",
                      borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : "none",
                      background: n.read ? "transparent" : `${T.accent}08`,
                      alignItems: "flex-start",
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: `${n.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon size={16} color={n.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: T.textPrimary }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                          {n.desc}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{n.time}</div>
                      </div>
                      <button onClick={() => dismiss(n.id)} style={{
                        background: "transparent", border: "none", color: T.textMuted,
                        cursor: "pointer", padding: 2, display: "flex", flexShrink: 0,
                      }}><X size={13} /></button>
                    </div>
                  );
                })}
                {notifs.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 13 }}>
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── User Menu ── */}
        <div ref={userRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: userOpen ? `${T.accent}15` : T.card,
              border: `1px solid ${userOpen ? T.accent : T.border}`,
              borderRadius: 10, padding: "6px 12px 6px 8px",
              cursor: "pointer",
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%", background: T.accent,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>👨‍🍳</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>Ankit</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>Vendor</div>
            </div>
            <ChevronDown size={14} color={T.textMuted} style={{ transition: "transform 0.2s", transform: userOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {/* Dropdown */}
          {userOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 200, background: T.card,
              border: `1px solid ${T.border}`, borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 200,
            }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Ankit Sharma</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>ankit@messato.com</div>
              </div>
              {["Edit Profile", "Bank Details", "Help & Support"].map((item, i, arr) => (
                <button key={item} style={{
                  width: "100%", background: "transparent", border: "none",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                  padding: "12px 16px", color: T.textSecondary, fontSize: 13,
                  cursor: "pointer", textAlign: "left",
                }}>{item}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
