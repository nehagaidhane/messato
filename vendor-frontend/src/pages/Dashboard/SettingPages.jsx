// SettingsPage.jsx
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../constants/ThemeContext";
import { Toggle } from "../../components/UI";
import axios from "../../api/axios";

const NOTIF_OPTIONS = [
  { key: "orders_enabled",        label: "New Order Alerts",    desc: "Get notified when new orders arrive"  },
  { key: "subscriptions_enabled", label: "Subscription Alerts", desc: "New subscriber notifications"         },
  { key: "payments_enabled",      label: "Payment Alerts",      desc: "Payment received confirmations"       },
  { key: "marketing_enabled",     label: "Marketing Updates",   desc: "Promotions and platform updates"      },
];

const THEME_OPTIONS = ["dark", "light", "system"];

const ABOUT_LINKS = [
  { label: "Privacy Policy",            path: "/vendor/dashboard/privacy"         },
  { label: "Terms & Conditions of Use", path: "/vendor/dashboard/terms"           },
  { label: "Help & FAQ's",              path: "/vendor/dashboard/faq"             },
  { label: "Contact Support",           path: "/vendor/dashboard/customersupport" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { T, mode, saveTheme } = useTheme(); // ← live theme from context

  const [notifs,  setNotifs]  = useState({
    orders_enabled: true, subscriptions_enabled: true,
    payments_enabled: true, marketing_enabled: false,
  });
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Load settings on mount ───────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get("/vendor/settings");
        setNotifs({
          orders_enabled:        data.orders_enabled,
          subscriptions_enabled: data.subscriptions_enabled,
          payments_enabled:      data.payments_enabled,
          marketing_enabled:     data.marketing_enabled,
        });
        // Sync theme from DB on first load
        if (data.theme_preference) {
          saveTheme(data.theme_preference);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [saveTheme]);

  // ── Toggle notification ──────────────────────────────
  const toggleNotif = async (key) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    try {
      await axios.put("/vendor/settings/notifications", updated);
    } catch (err) {
      console.error("Failed to save notification:", err);
      setNotifs(notifs); // rollback
    }
  };

  // ── Save theme ───────────────────────────────────────
  const handleThemeChange = async (newMode) => {
    saveTheme(newMode); // instantly updates T everywhere in app
    setSaving(true);
    try {
      await axios.put("/vendor/settings/theme", { theme_preference: newMode });
    } catch (err) {
      console.error("Failed to save theme:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ color: T.textMuted, padding: 40, textAlign: "center", fontSize: 14 }}>
      Loading settings...
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
        Settings
      </div>

      {/* ── Notifications ─────────────────────────────── */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>Notifications</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>Control how and when you receive alerts</div>
        </div>
        {NOTIF_OPTIONS.map((n, i) => (
          <div key={n.key} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 24px",
            borderBottom: i < NOTIF_OPTIONS.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{n.label}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{n.desc}</div>
            </div>
            <Toggle val={notifs[n.key]} onToggle={() => toggleNotif(n.key)} />
          </div>
        ))}
      </div>

      {/* ── Appearance ────────────────────────────────── */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
          Appearance
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
          Currently using {mode} mode {saving && "· saving..."}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {THEME_OPTIONS.map((m) => (
            <button key={m} onClick={() => handleThemeChange(m)} style={{
              flex: 1,
              background: mode === m ? T.accent : T.surface,
              color:      mode === m ? "#fff"     : T.textSecondary,
              border:     `1px solid ${mode === m ? T.accent : T.border}`,
              borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              textTransform: "capitalize",
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* ── About ─────────────────────────────────────── */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>About</div>
        </div>
        {ABOUT_LINKS.map((item, i) => (
          <button key={item.label} onClick={() => navigate(item.path)} style={{
            width: "100%", background: "transparent", border: "none",
            borderBottom: i < ABOUT_LINKS.length - 1 ? `1px solid ${T.border}` : "none",
            padding: "15px 24px", color: T.textSecondary, fontSize: 14,
            cursor: "pointer", display: "flex", justifyContent: "space-between",
            alignItems: "center", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
          }}>
            {item.label} <ChevronRight size={15} color={T.textMuted} />
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: T.textMuted, paddingBottom: 8 }}>
        Messato Vendor App v2.1.0 · © 2026 Messato Technologies
      </div>
    </div>
  );
}