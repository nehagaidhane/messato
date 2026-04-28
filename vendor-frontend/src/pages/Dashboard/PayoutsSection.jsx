// ═══════════════════════════════════════════════════════════════════════════════
//  PAYOUTS SECTION  — drop this in place of the old PayoutsSection in ProfilePage.jsx
//  Matches the 4-screen flow shown in the design:
//    Screen 1 → Summary cards + "View Statements" button
//    Screen 2 → Payout history (All / Monthly / Yearly tabs) with download
//    Screen 3 → Commission Statements  (percentage type)
//    Screen 4 → Commission Statements  (fixed type)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import {
  Wallet, TrendingUp, RefreshCw, Banknote, ChevronLeft,
  Download, Eye, AlertCircle, CheckCircle2, Clock,
  Calendar, FileText, Percent, Hash, ArrowUpRight,
  IndianRupee, Users, Package
} from "lucide-react";

// ── Same hook and theme used in the rest of ProfilePage ──────────────────────
import { usePayouts } from "../../hooks/Usevendorprofile";
import { T } from "../../constants/theme";

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDate(d, opts = { day: "numeric", month: "short", year: "numeric" }) {
  return d ? new Date(d).toLocaleDateString("en-IN", opts) : "—";
}
function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `3px solid ${T.border}`,
        borderTopColor: T.accent,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── reusable card ────────────────────────────────────────────────────────────
function SCard({ children, style = {} }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 16, ...style,
    }}>
      {children}
    </div>
  );
}

// ─── stat card (summary row) ──────────────────────────────────────────────────
function MiniStat({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: "16px 18px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: `${color}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne',sans-serif" }}>
          {value}
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 500, marginTop: 1 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── status badge ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    paid:      { bg: `${T.green}18`,   color: T.green,   label: "Paid"      },
    pending:   { bg: `${"#EAB308"}18`, color: "#EAB308", label: "Pending"   },
    processed: { bg: `${T.accent}18`,  color: T.accent,  label: "Processed" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}40`,
      borderRadius: 6, padding: "3px 10px",
      fontSize: 11, fontWeight: 700,
    }}>{s.label}</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCREEN 1  — Summary / Overview
// ═══════════════════════════════════════════════════════════════════════════════
function PayoutSummary({ data, onViewStatements, onViewCommissions }) {
  const { thisMonth, thisWeek, allTime } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page title */}
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne',sans-serif" }}>
          Payouts
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
          Track your earnings &amp; payout history
        </div>
      </div>

      {/* Top stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
        <MiniStat icon={Wallet}     label="Available Balance"
          value={money(data.pendingBalance)} color={T.green}
          sub={data.lastPaidDate ? `Last paid ${fmtDate(data.lastPaidDate, { month: "short", day: "numeric" })}` : "No payouts yet"} />
        <MiniStat icon={TrendingUp} label="This Month (net)"
          value={money(thisMonth?.net_payable)} color={T.accent}
          sub={`Gross ${money(thisMonth?.gross_earning)}`} />
        <MiniStat icon={Calendar}   label="This Week (net)"
          value={money(thisWeek?.net_payable)} color="#EAB308"
          sub={`Commission ${money(thisWeek?.total_commission)}`} />
        <MiniStat icon={IndianRupee} label="All-Time Earned"
          value={money(allTime?.net_payable)} color="#a78bfa"
          sub={`Total orders revenue ${money(allTime?.gross_earning)}`} />
      </div>

      {/* Next scheduled payout */}
      {data.nextPayoutAmount > 0 && (
        <SCard style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={16} color={T.accent} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Next Scheduled Payout</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Processed &amp; awaiting transfer</div>
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.accent, fontFamily: "'Syne',sans-serif" }}>
            {money(data.nextPayoutAmount)}
          </div>
        </SCard>
      )}

      {/* Commission rate */}
      {data.commissionRate && (
        <SCard style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#a78bfa20", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {data.commissionRate.type === "percentage" ? <Percent size={15} color="#a78bfa" /> : <Hash size={15} color="#a78bfa" />}
          </div>
          <div>
            <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>Commission Rate</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
              {data.commissionRate.type === "percentage"
                ? `${data.commissionRate.value}% of each order`
                : `₹${data.commissionRate.value} fixed per order`}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{
              background: "#a78bfa20", color: "#a78bfa",
              border: "1px solid #a78bfa40",
              borderRadius: 6, padding: "3px 10px",
              fontSize: 11, fontWeight: 700, textTransform: "capitalize",
            }}>{data.commissionRate.type}</span>
          </div>
        </SCard>
      )}

      {/* Bank details mini */}
      {data.bankDetails && (
        <SCard style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 12, textTransform: "uppercase" }}>
            Bank Account
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.green}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Banknote size={16} color={T.green} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{data.bankDetails.bank_name}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {data.bankDetails.account_holder_name} · {data.bankDetails.account_number?.replace(/.(?=.{4})/g, "●")}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                IFSC: {data.bankDetails.ifsc_code} · {data.bankDetails.branch_name}
              </div>
            </div>
          </div>
        </SCard>
      )}

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onViewStatements} style={{
          flex: 1, minWidth: 140,
          background: T.accent, color: "#fff",
          border: "none", borderRadius: 12, padding: "13px 20px",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontFamily: "'DM Sans',sans-serif",
        }}>
          <FileText size={15} /> View Statements
        </button>
        {data.commissionStatements?.length > 0 && (
          <button onClick={onViewCommissions} style={{
            flex: 1, minWidth: 140,
            background: T.card, color: T.textSecondary,
            border: `1px solid ${T.border}`, borderRadius: 12, padding: "13px 20px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "'DM Sans',sans-serif",
          }}>
            <Percent size={15} /> Commission Statements
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCREEN 2  — Payout Statements (All / Monthly / Yearly)
// ═══════════════════════════════════════════════════════════════════════════════
function PayoutStatements({ history, onBack }) {
  const [tab, setTab] = useState("all");

  // Group by month label for display
  const grouped = useMemo(() => {
    if (!history?.length) return {};
    const filtered = history.filter(p => {
      const d = new Date(p.created_at);
      const now = new Date();
      if (tab === "monthly") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (tab === "yearly") return d.getFullYear() === now.getFullYear();
      return true;
    });
    return filtered.reduce((acc, p) => {
      const key = fmtDate(p.created_at, { month: "long", year: "numeric" });
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});
  }, [history, tab]);

  const TABS = [
    { id: "all", label: "All" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          background: T.card, border: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <ChevronLeft size={18} color={T.textSecondary} />
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne',sans-serif" }}>
            View Statements
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>Payout settlement history</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, background: T.surface, borderRadius: 10, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px 0",
            background: tab === t.id ? T.accent : "transparent",
            color: tab === t.id ? "#fff" : T.textMuted,
            border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Grouped list */}
      {Object.keys(grouped).length === 0 ? (
        <SCard style={{ padding: 48, textAlign: "center" }}>
          <FileText size={36} color={T.textMuted} style={{ margin: "0 auto 12px" }} />
          <div style={{ color: T.textMuted }}>No statements found</div>
        </SCard>
      ) : (
        Object.entries(grouped).map(([month, payouts]) => (
          <div key={month}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
              {month}
            </div>
            <SCard>
              {payouts.map((p, i, arr) => (
                <div key={p.id} style={{
                  padding: "16px 20px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
                }}>
                  {/* Left: date + meta */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: p.status === "paid" ? `${T.green}18` : `${"#EAB308"}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {p.status === "paid"
                        ? <CheckCircle2 size={18} color={T.green} />
                        : <Clock size={18} color="#EAB308" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>
                        {fmtDate(p.start_date, { day: "numeric", month: "short" })} – {fmtDate(p.end_date, { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>
                        PAY-{p.id} · {p.total_orders} orders
                      </div>
                      {/* Detail breakdown */}
                      <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
                        {[
                          { label: "Total Rev", val: money(p.total_revenue) },
                          { label: "Commission", val: money(p.total_commission), negative: true },
                          { label: "Vendor Earn", val: money(p.total_vendor_earning) },
                        ].map(({ label, val, negative }) => (
                          <div key={label}>
                            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: negative ? "#EAB308" : T.textPrimary }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Right: payout amount + badge */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.green, fontFamily: "'Syne',sans-serif" }}>
                      {money(p.payout_amount)}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <Badge status={p.status} />
                    </div>
                  </div>
                </div>
              ))}
            </SCard>
          </div>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCREEN 3 + 4  — Commission Statements (percent OR fixed)
// ═══════════════════════════════════════════════════════════════════════════════
function CommissionStatements({ statements, commissionRate, onBack }) {
  const isPercent = commissionRate?.type === "percentage";

  // Group by month
  const grouped = useMemo(() => {
    if (!statements?.length) return {};
    return statements.reduce((acc, s) => {
      const key = fmtDate(s.created_at, { month: "long", year: "numeric" });
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});
  }, [statements]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          background: T.card, border: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <ChevronLeft size={18} color={T.textSecondary} />
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne',sans-serif" }}>
            Commission Statements
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>
            {isPercent ? `${commissionRate?.value}% per order deducted` : `₹${commissionRate?.value} fixed per order deducted`}
          </div>
        </div>
        {/* Commission type badge */}
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            background: isPercent ? "#a78bfa20" : `${T.accent}20`,
            color: isPercent ? "#a78bfa" : T.accent,
            border: `1px solid ${isPercent ? "#a78bfa" : T.accent}40`,
            borderRadius: 20, padding: "4px 12px",
            fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            {isPercent ? <Percent size={11} /> : <Hash size={11} />}
            {isPercent ? "%" : "Fixed"}
          </span>
        </div>
      </div>

      {/* Legend */}
      <SCard style={{ padding: "12px 18px", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { dot: T.textPrimary, label: "Order Amount" },
          { dot: "#EAB308",     label: `Commission (${isPercent ? `${commissionRate?.value}%` : `₹${commissionRate?.value} fixed`})` },
          { dot: T.green,       label: "Your Share" },
        ].map(({ dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </SCard>

      {/* Grouped statements */}
      {Object.keys(grouped).length === 0 ? (
        <SCard style={{ padding: 48, textAlign: "center" }}>
          <AlertCircle size={36} color={T.textMuted} style={{ margin: "0 auto 12px" }} />
          <div style={{ color: T.textMuted }}>No commission statements yet</div>
        </SCard>
      ) : (
        Object.entries(grouped).map(([month, stmts]) => {
          const monthTotal = stmts.reduce((a, s) => a + Number(s.vendor_share || 0), 0);
          const monthComm  = stmts.reduce((a, s) => a + Number(s.commission_amount || 0), 0);
          return (
            <div key={month}>
              {/* Month header with totals */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  {month}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted }}>
                  Net: <span style={{ color: T.green, fontWeight: 700 }}>{money(monthTotal)}</span>
                  &nbsp;· Comm: <span style={{ color: "#EAB308", fontWeight: 700 }}>{money(monthComm)}</span>
                </div>
              </div>

              <SCard>
                {stmts.map((s, i, arr) => (
                  <div key={s.id} style={{
                    padding: "14px 18px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
                  }}>
                    {/* Left: user + order info */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: `${T.accent}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 800, color: T.accent,
                      }}>
                        {(s.user_name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                          {s.user_name || "Customer"}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                          ORD-{s.order_id} · {fmtDate(s.created_at, { day: "numeric", month: "short" })}
                        </div>
                        {/* Inline breakdown */}
                        <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, color: T.textPrimary, fontWeight: 600 }}>
                            Order: {money(s.order_amount)}
                          </span>
                          <span style={{ fontSize: 11, color: "#EAB308", fontWeight: 600 }}>
                            Commission Rate: {isPercent
                              ? `${commissionRate?.value}% = -${money(s.commission_amount)}`
                              : `-₹${commissionRate?.value} (Fixed)`}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Right: your share */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Your Share</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.green, fontFamily: "'Syne',sans-serif" }}>
                        {money(s.vendor_share)}
                      </div>
                    </div>
                  </div>
                ))}
              </SCard>
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROOT EXPORT  — replaces old PayoutsSection
// ═══════════════════════════════════════════════════════════════════════════════
export default function PayoutsSection() {
  const { data, loading } = usePayouts();
  // "summary" | "statements" | "commissions"
  const [screen, setScreen] = useState("summary");

  if (loading) return <Spinner />;
  if (!data) return (
    <div style={{ color: T.textMuted, padding: 40, textAlign: "center" }}>
      <AlertCircle size={32} style={{ marginBottom: 12 }} />
      <div>Could not load payout data.</div>
    </div>
  );

  if (screen === "statements") {
    return (
      <PayoutStatements
        history={data.payoutHistory || []}
        onBack={() => setScreen("summary")}
      />
    );
  }

  if (screen === "commissions") {
    return (
      <CommissionStatements
        statements={data.commissionStatements || []}
        commissionRate={data.commissionRate}
        onBack={() => setScreen("summary")}
      />
    );
  }

  return (
    <PayoutSummary
      data={data}
      onViewStatements={() => setScreen("statements")}
      onViewCommissions={() => setScreen("commissions")}
    />
  );
}
