import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { IndianRupee, ShoppingCart, Users, Star } from "lucide-react";
import api from "../../api/axios";
import { T } from "../../constants/theme";
import { StatCard, Badge, SectionHeader } from "../../components/UI";

export default function DashboardPage({ onNavigate }) {
  const [period, setPeriod] = useState("weekly");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/dashboard");
      setDashboard(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Chart data: use API data if available, else empty fallback ──
  const revenueData = {
    daily:   dashboard?.revenueDaily   || [],
    weekly:  dashboard?.revenueWeekly  || [],
    monthly: dashboard?.revenueMonthly || [],
  };
  const data = revenueData[period];
  const totalRevenue = data.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalOrders  = data.reduce((s, d) => s + (d.orders  || 0), 0);

  // ── Thali breakdown: use API data if available ──
  const thaliBreakdown = dashboard?.thaliBreakdown || [];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div style={{ fontSize: 15, color: T.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
          Loading dashboard…
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Welcome ───────────────────────────────── */}
      <div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>Good morning 👋</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
          {dashboard?.messName || "Your Mess"}
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
      }}>
        <StatCard
          icon={IndianRupee}
          label="Today's Revenue"
          value={`₹${dashboard?.totalRevenue ?? 0}`}
          sub="+12% vs yesterday"
          trend={12}
          color={T.accent}
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={dashboard?.totalOrders ?? 0}
          sub="6 pending"
          trend={8}
          color={T.green}
        />
        <StatCard
          icon={Users}
          label="Subscribers"
          value={dashboard?.subscribers ?? 0}
          sub="3 new today"
          trend={3}
          color={T.yellow}
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={dashboard?.avgRating ?? 0}
          sub="389 reviews"
          trend={2}
          color={T.orange}
        />
      </div>

      {/* ── Revenue Chart ─────────────────────────── */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 24, flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
              Revenue Overview
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 2 }}>
              ₹{totalRevenue.toLocaleString("en-IN")} · {totalOrders} orders
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["daily", "weekly", "monthly"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                background: period === p ? T.accent : T.surface,
                color: period === p ? "#fff" : T.textSecondary,
                border: `1px solid ${period === p ? T.accent : T.border}`,
                borderRadius: 8, padding: "6px 13px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", textTransform: "capitalize",
                fontFamily: "'DM Sans', sans-serif",
              }}>{p}</button>
            ))}
          </div>
        </div>

        {data.length === 0 ? (
          <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: T.textMuted, fontSize: 13 }}>No revenue data available for this period.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="day" stroke={T.textMuted} tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke={T.textMuted} tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, fontFamily: "'DM Sans', sans-serif" }}
                labelStyle={{ color: T.textPrimary }}
                itemStyle={{ color: T.accent }}
                formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke={T.accent} strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Pie + Bar ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>

        {/* Pie — Sales by Thali */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}>
          <SectionHeader title="Sales by Thali" />
          {thaliBreakdown.length === 0 ? (
            <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: T.textMuted, fontSize: 13 }}>No breakdown data yet.</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <PieChart width={150} height={150}>
                <Pie
                  data={thaliBreakdown}
                  cx={70} cy={70}
                  innerRadius={40} outerRadius={68}
                  paddingAngle={3} dataKey="value"
                >
                  {thaliBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 120 }}>
                {thaliBreakdown.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: T.textSecondary, flex: 1 }}>{t.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{t.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar — Orders This Week */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}>
          <SectionHeader title="Orders This Week" />
          {(revenueData.weekly.length === 0) ? (
            <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: T.textMuted, fontSize: 13 }}>No weekly order data yet.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={revenueData.weekly} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="day" stroke={T.textMuted} tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10 }}
                  labelStyle={{ color: T.textPrimary }}
                />
                <Bar dataKey="orders" fill={T.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Orders ─────────────────────────── */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}>
        <SectionHeader title="Recent Orders" action={() => onNavigate("orders")} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dashboard?.recentOrders?.length === 0 && (
            <div style={{ textAlign: "center", color: T.textMuted, fontSize: 13, padding: "24px 0" }}>
              No recent orders yet.
            </div>
          )}
          {dashboard?.recentOrders?.map(o => (
            <div key={o.id} style={{
              display: "flex", alignItems: "center", padding: "12px 16px",
              background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`,
              flexWrap: "wrap", gap: 12,
            }}>
              <div style={{ fontSize: 22 }}>🍱</div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                  Order #{o.id}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                  {o.customer_name || "Customer"} · {o.created_at ? new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>
                ₹{o.total_amount}
              </div>
              <Badge status={o.status} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
