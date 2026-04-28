import { useState, useEffect } from "react";
import { Search, Clock, ChefHat, Check, Bike, CheckCircle2, XCircle } from "lucide-react";
import { T, STATUS_CONFIG } from "../../constants/theme";
import { Badge, PayBadge } from "../../components/UI";
import api from "../../api/axios";

const STATUS_ICONS = {
  pending:          Clock,
  accepted:         Check,
  preparing:        ChefHat,
  out_for_delivery: Bike,
  delivered:        CheckCircle2,
  rejected:         XCircle,
};

const STEPS = ["pending", "accepted", "preparing", "out_for_delivery", "delivered"];
const STEP_LABELS = ["Pending", "Accepted", "Preparing", "On Way", "Done"];

export default function OrdersPage() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(null); // tracks which order ID is being updated
  const [statusTab,  setStatusTab]  = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vendor-orders/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, next) => {
    setUpdating(id);
    try {
      await api.put(`/vendor-orders/orders/${id}`, { status: next });
      // Optimistically update UI, then refresh from server
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
      fetchOrders(); // sync with real DB state
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter(o => {
    const ms = statusTab  === "all" || o.status === statusTab;
    const mt = typeFilter === "all" || o.type   === typeFilter;
    const mq = [o.customer_name, o.item_name, String(o.id)]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    return ms && mt && mq;
  });

  const counts = Object.fromEntries(
    ["all", ...STEPS, "rejected"].map(s => [
      s, s === "all" ? orders.length : orders.filter(o => o.status === s).length,
    ])
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ──────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
          Orders
          {loading && (
            <span style={{ fontSize: 13, fontWeight: 400, color: T.textMuted, marginLeft: 10 }}>
              Loading…
            </span>
          )}
        </div>

        {/* Type filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", "daily", "weekly", "monthly"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              background: typeFilter === t ? T.accent : T.card,
              color:      typeFilter === t ? "#fff"    : T.textSecondary,
              border: `1px solid ${typeFilter === t ? T.accent : T.border}`,
              borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", textTransform: "capitalize",
              fontFamily: "'DM Sans', sans-serif",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ── Search ──────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer, item, order ID…"
          style={{
            width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
            padding: "10px 14px 10px 38px", color: T.textPrimary, fontSize: 13, outline: "none",
            boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
          }}
        />
      </div>

      {/* ── Status tabs ─────────────────────────────── */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {Object.entries(counts).map(([s, c]) => (
          <button key={s} onClick={() => setStatusTab(s)} style={{
            background: statusTab === s ? T.accent : T.card,
            color:      statusTab === s ? "#fff"    : T.textSecondary,
            border: `1px solid ${statusTab === s ? T.accent : T.border}`,
            borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif",
          }}>
            {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s} ({c})
          </button>
        ))}
      </div>

      {/* ── Order Cards ─────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: T.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 15, color: T.textSecondary }}>No orders match your filters</div>
          </div>
        )}

        {filtered.map(o => {
          const cfg        = STATUS_CONFIG[o.status];
          const StatusIcon = STATUS_ICONS[o.status] || Clock;
          const currentIdx = STEPS.indexOf(o.status);
          const isUpdating = updating === o.id;

          return (
            <div key={o.id} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20,
              opacity: isUpdating ? 0.6 : 1, transition: "opacity 0.2s",
            }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ fontSize: 34, lineHeight: 1, flexShrink: 0 }}>🍱</div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
                        ({o.quantity ?? 1}) {o.item_name || "Order"}
                      </div>
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
                        {o.customer_name || "Customer"}
                        {o.phone ? ` (${o.phone})` : ""} ·{" "}
                        <span style={{ color: T.textSecondary }}>#{o.id}</span>
                        {o.created_at && (
                          <span style={{ marginLeft: 6 }}>
                            · {new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <PayBadge payment={o.payment_status} />
                      <Badge status={o.status} />
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginTop: 14, flexWrap: "wrap", gap: 10,
                  }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: T.accent }}>
                        ₹{Number(o.total_amount).toLocaleString("en-IN")}
                      </span>
                      {o.price && o.quantity && (
                        <span style={{ fontSize: 12, color: T.textMuted }}>
                          @₹{o.price}/unit
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {o.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(o.id, "accepted")}
                            disabled={isUpdating}
                            style={actionBtn(T.green)}
                          >
                            <Check size={13} /> Accept
                          </button>
                          <button
                            onClick={() => updateStatus(o.id, "rejected")}
                            disabled={isUpdating}
                            style={actionBtn(T.red)}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                      {cfg?.next && o.status !== "pending" && (
                        <button
                          onClick={() => updateStatus(o.id, cfg.next)}
                          disabled={isUpdating}
                          style={actionBtn(T.accent)}
                        >
                          <StatusIcon size={13} />
                          {isUpdating ? "Updating…" : `Mark ${STATUS_CONFIG[cfg.next]?.label || cfg.next}`}
                        </button>
                      )}
                      {(o.status === "delivered" || o.status === "rejected") && (
                        <span style={{ fontSize: 12, color: T.textMuted, padding: "8px 4px" }}>
                          {o.status === "delivered" ? "✅ Completed" : "❌ Rejected"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {!["rejected", "delivered"].includes(o.status) && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        {STEPS.map((s, i) => (
                          <div key={s} style={{
                            flex: 1, height: 4, borderRadius: 2,
                            background: i <= currentIdx ? T.accent : T.border,
                            transition: "background 0.3s",
                          }} />
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                        {STEP_LABELS.map((l, i) => (
                          <span key={l} style={{
                            fontSize: 10, color: i <= currentIdx ? T.accent : T.textMuted,
                          }}>{l}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Inline helper for action button styles
const actionBtn = (bg) => ({
  background: bg, color: "#fff", border: "none", borderRadius: 8,
  padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 5,
  fontFamily: "'DM Sans', sans-serif",
  opacity: 1, transition: "opacity 0.2s",
});
