import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
import { T, STATUS_CONFIG } from "../constants/theme";

// ─── STAT CARD ───────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, trend, color }) => {
  const Icon = icon;

  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        borderRadius: "0 16px 0 80px",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ background: `${color}20`, borderRadius: 10, padding: 10, display: "flex" }}>
          {Icon ? <Icon size={20} color={color} /> : null}
        </div>
        {trend !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: trend >= 0 ? T.green : T.red, fontSize: 12, fontWeight: 600 }}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>{value}</div>
        <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
};

// ─── STATUS BADGE ─────────────────────────────────────────────
export const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: T.textMuted };
  return (
    <span style={{
      background: `${cfg.color}20`, color: cfg.color,
      border: `1px solid ${cfg.color}40`,
      borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>{cfg.label}</span>
  );
};

// ─── PAYMENT BADGE ────────────────────────────────────────────
export const PayBadge = ({ payment }) => (
  <span style={{
    background: payment === "COD" ? `${T.orange}20` : `${T.green}20`,
    color: payment === "COD" ? T.orange : T.green,
    border: `1px solid ${payment === "COD" ? T.orange : T.green}40`,
    borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600,
  }}>{payment}</span>
);

// ─── TOGGLE ───────────────────────────────────────────────────
export const Toggle = ({ val, onToggle }) => (
  <div
    onClick={onToggle}
    style={{
      width: 48, height: 26, borderRadius: 13, cursor: "pointer", position: "relative",
      background: val ? T.accent : T.border, transition: "background 0.3s", flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute", top: 3, left: val ? 25 : 3, width: 20, height: 20,
      borderRadius: "50%", background: "#fff", transition: "left 0.3s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    }} />
  </div>
);

// ─── SECTION HEADER ───────────────────────────────────────────
export const SectionHeader = ({ title, action, actionLabel = "View all" }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>{title}</div>
    {action && (
      <button onClick={action} style={{
        background: "transparent", border: "none", color: T.accent,
        fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
      }}>
        {actionLabel} <ChevronRight size={14} />
      </button>
    )}
  </div>
);

// ─── EMPTY STATE ──────────────────────────────────────────────
export const EmptyState = ({ emoji = "📭", title, desc }) => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
    <div style={{ fontSize: 16, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>{title}</div>
    {desc && <div style={{ fontSize: 13 }}>{desc}</div>}
  </div>
);

// ─── COMING SOON ──────────────────────────────────────────────
export const ComingSoon = () => (
  <EmptyState emoji="🚧" title="Coming Soon" desc="This section is under development" />
);
