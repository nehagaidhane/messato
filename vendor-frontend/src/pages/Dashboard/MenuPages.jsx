import { useState, useEffect, useRef } from "react";
import {
  Plus, Edit2, Trash2, Eye, X, AlertCircle,
  Upload, ImageIcon, Calendar, Package, RefreshCw,
  ChevronDown, ChevronUp, Info, CheckCircle, Clock
} from "lucide-react";
import "./MenuPage.css";
import api from "../../api/axios";
import { T } from "../../constants/theme";

// ── Constants ────────────────────────────────────────────────
const CATEGORIES = [
  { key: "roti",   label: "Roti / Bread",    emoji: "🫓", placeholder: "e.g. Chapati × 3, Paratha × 1" },
  { key: "sabji",  label: "Sabji / Curry",   emoji: "🥘", placeholder: "e.g. Aloo Matar, Bhindi Masala" },
  { key: "dal",    label: "Dal",             emoji: "🍲", placeholder: "e.g. Dal Tadka, Chana Dal" },
  { key: "rice",   label: "Rice / Khichdi",  emoji: "🍚", placeholder: "e.g. Steamed Rice, Jeera Rice" },
  { key: "extras", label: "Extras",          emoji: "🥗", placeholder: "e.g. Salad, Papad, Pickle, Raita" },
  { key: "sweet",  label: "Sweet / Dessert", emoji: "🍮", placeholder: "e.g. Gulab Jamun, Kheer (optional)" },
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL    = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Plans shown to customers — vendor just needs to know the structure
const SUBSCRIPTION_PLANS = [
  {
    key: "weekly",
    name: "Weekly Tiffin",
    emoji: "📅",
    duration: "7 days",
    popular: false,
    desc: "Fresh meals delivered every day for a week. Perfect for working professionals.",
    features: [
      "Choose Lunch / Dinner / Both",
      "Daily fresh menu",
      "Skip up to 2 days/week",
      "Cancel 24 hrs before delivery",
    ],
    refundRules: [
      { label: "Cancel 24h+ before", refund: "100%", color: "var(--green)" },
      { label: "Cancel 6–24h before", refund: "50%", color: "var(--orange)" },
      { label: "Cancel <6h before",  refund: "0%",   color: "var(--red)" },
    ],
  },
  {
    key: "monthly",
    name: "Monthly Tiffin",
    emoji: "🗓️",
    duration: "30 days",
    popular: true,
    desc: "Best value plan. Full month of home-cooked tiffin with flexible skip options.",
    features: [
      "Choose Lunch / Dinner / Both",
      "Customisable menu weekly",
      "Skip up to 4 days/month",
      "Pause plan for up to 5 days",
      "Prorated refund on cancellation",
    ],
    refundRules: [
      { label: "Cancel before plan starts", refund: "100%", color: "var(--green)" },
      { label: "Cancel within 3 days",      refund: "Prorated",  color: "var(--green)" },
      { label: "Skip a day (24h notice)",   refund: "Credit",    color: "var(--blue)" },
      { label: "Skip <6h notice",           refund: "0%",        color: "var(--red)" },
    ],
  },
];

// Cancellation & refund policy for display
const REFUND_TIMELINE = [
  {
    time: "24+ hrs before delivery",
    desc: "Full credit/refund to wallet for that meal. Counts as a skip day.",
    color: "var(--green)",
  },
  {
    time: "6–24 hrs before delivery",
    desc: "50% wallet credit. Tiffin may already be prepared.",
    color: "var(--orange)",
  },
  {
    time: "< 6 hrs / same day",
    desc: "No refund. Vendor has already prepared the tiffin.",
    color: "var(--red)",
  },
  {
    time: "Full plan cancellation",
    desc: "Prorated refund for remaining days minus meals already delivered.",
    color: "var(--blue)",
  },
];

const EMPTY_FORM = {
  name: "", type: "daily", slot: "lunch", price: "",
  menu_date: new Date().toISOString().split("T")[0],
  roti: "", sabji: "", dal: "", rice: "", extras: "", sweet: "",
  // for weekly: which days are active
  schedule_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  // for monthly: meals per day price
  monthly_price_lunch: "", monthly_price_dinner: "", monthly_price_both: "",
  image: null, imagePreview: null,
  available: true,
  // Subscription plan details (for weekly/monthly type)
  plan_description: "",
  skip_limit: "",
  pause_limit: "",
};

export default function MenuPage() {
  const [menus,          setMenus]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [deleting,       setDeleting]       = useState(null);
  const [tab,            setTab]            = useState("daily");
  const [showForm,       setShowForm]       = useState(false);
  const [editId,         setEditId]         = useState(null);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [formError,      setFormError]      = useState("");
  const [showPolicy,     setShowPolicy]     = useState(false);
  const [showPlanInfo,   setShowPlanInfo]   = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { fetchMenus(); }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vendor-menu/menus");
      setMenus(res.data);
    } catch (err) {
      console.error("Fetch menus error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = menus.filter(m => m.type === tab);

  const tabCounts = {
    daily:   menus.filter(m => m.type === "daily").length,
    weekly:  menus.filter(m => m.type === "weekly").length,
    monthly: menus.filter(m => m.type === "monthly").length,
  };

  const openAdd = () => {
    const today = new Date().toISOString().split("T")[0];
    setForm({ ...EMPTY_FORM, type: tab, menu_date: today });
    setEditId(null);
    setShowForm(true);
    setFormError("");
  };

  const openEdit = (m) => {
    let scheduleDays = DAYS_OF_WEEK;
    try {
      if (m.schedule_days) scheduleDays = JSON.parse(m.schedule_days);
    } catch (err) {
      console.error("Failed to parse schedule_days for menu ID", m.id, err);
    }

    setForm({
      name: m.name || "",
      type: m.type || "daily",
      slot: m.slot || m.meal_type || "lunch",
      price: m.price || "",
      menu_date: m.menu_date
        ? m.menu_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      roti:   m.roti   || "",
      sabji:  m.sabji  || "",
      dal:    m.dal    || "",
      rice:   m.rice   || "",
      extras: m.extras || "",
      sweet:  m.sweet  || "",
      schedule_days:        scheduleDays,
      monthly_price_lunch:  m.monthly_price_lunch  || "",
      monthly_price_dinner: m.monthly_price_dinner || "",
      monthly_price_both:   m.monthly_price_both   || "",
      plan_description:     m.plan_description     || "",
      skip_limit:           m.skip_limit           || "",
      pause_limit:          m.pause_limit          || "",
      available: m.available ?? true,
      image: null,
      imagePreview: m.image_url || m.image || null,
    });
    setEditId(m.id);
    setShowForm(true);
    setFormError("");
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setFormError(""); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormError("Image must be under 5MB"); return; }
    setForm(p => ({ ...p, image: file, imagePreview: URL.createObjectURL(file) }));
    setFormError("");
  };

  const toggleDay = (day) => {
    setForm(p => ({
      ...p,
      schedule_days: p.schedule_days.includes(day)
        ? p.schedule_days.filter(d => d !== day)
        : [...p.schedule_days, day],
    }));
  };

  const save = async () => {
    // Validation
    if (!form.name.trim())               return setFormError("Meal name is required");
    if (!form.price || +form.price <= 0) return setFormError("Enter a valid price");
    if (!form.roti.trim())               return setFormError("Roti/Bread details are required");
    if (!form.sabji.trim())              return setFormError("Sabji/Curry details are required");
    if (!form.dal.trim())                return setFormError("Dal details are required");
    if (!form.menu_date)                 return setFormError("Please select a date for this menu");
    if (form.type !== "daily" && form.schedule_days.length === 0)
      return setFormError("Select at least one delivery day");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",      form.name);
      fd.append("type",      form.type);
      fd.append("slot",      form.slot);
      fd.append("price",     form.price);
      fd.append("menu_date", form.menu_date);
      fd.append("roti",      form.roti);
      fd.append("sabji",     form.sabji);
      fd.append("dal",       form.dal);
      fd.append("rice",      form.rice);
      fd.append("extras",    form.extras);
      fd.append("sweet",     form.sweet);
      // Subscription extras
      fd.append("schedule_days",        JSON.stringify(form.schedule_days));
      fd.append("monthly_price_lunch",  form.monthly_price_lunch  || "");
      fd.append("monthly_price_dinner", form.monthly_price_dinner || "");
      fd.append("monthly_price_both",   form.monthly_price_both   || "");
      fd.append("plan_description",     form.plan_description     || "");
      fd.append("skip_limit",           form.skip_limit           || "");
      fd.append("pause_limit",          form.pause_limit          || "");
      if (form.image) fd.append("image", form.image);

      const url = editId
        ? `/vendor-menu/menus/${editId}`
        : "/vendor-menu/menus";
      const method = editId ? "put" : "post";

      await api[method](url, fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchMenus();
      closeForm();
    } catch (err) {
      console.error("Save menu error:", err);
      setFormError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this meal?")) return;
    setDeleting(id);
    try {
      await api.delete(`/vendor-menu/menus/${id}`);
      setMenus(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(null);
    }
  };

  const toggle = async (id, current) => {
    setMenus(prev => prev.map(m => m.id === id ? { ...m, available: !current } : m));
    try {
      await api.patch(`/vendor-menu/menus/${id}/toggle`, { available: !current });
    } catch (err) {
      console.error("Toggle error:", err);
      setMenus(prev => prev.map(m => m.id === id ? { ...m, available: current } : m));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const isSubscription = form.type === "weekly" || form.type === "monthly";
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.key === tab);

  return (
    <div className="menu-page">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="menu-header">
        <div className="menu-title">
          🍱 Menu Management
          {loading && <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)", marginLeft: 8 }}>Loading…</span>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn-primary"
            style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", boxShadow: "none" }}
            onClick={() => setShowPolicy(v => !v)}
          >
            <Info size={14} /> Refund Policy
          </button>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add New Meal
          </button>
        </div>
      </div>

      {/* ── Cutoff Banner ───────────────────────────────── */}
      <div className="info-banner">
        <AlertCircle size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong className="label">Order Cutoff:</strong>{" "}
          Lunch by <strong className="highlight">9 PM previous day</strong> ·{" "}
          Dinner by <strong className="highlight">2 PM same day</strong> ·{" "}
          Weekly &amp; Monthly run on <strong className="highlight">subscription basis</strong> with automatic daily delivery.
        </div>
      </div>

      {/* ── Refund Policy Collapsible ────────────────────── */}
      {showPolicy && (
        <div className="policy-card" style={{ animation: "slideDown 0.25s ease" }}>
          <div className="policy-card-title">
            <RefreshCw size={15} color="var(--blue)" /> Cancellation &amp; Refund Policy
          </div>

          <div className="refund-timeline">
            {REFUND_TIMELINE.map((step, i) => (
              <div
                key={i}
                className="refund-step"
                style={{ "--step-color": step.color }}
              >
                <div className="step-time">{step.time}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>

          <div className="policy-grid" style={{ marginTop: 18 }}>
            <div className="policy-item">
              <div className="policy-label">Skip Day Logic</div>
              <div className="policy-value">
                <span className="pill pill-green">Free</span> if cancelled 24h+ before ·
                <span className="pill pill-orange" style={{ marginLeft: 4 }}>50% credit</span> if 6–24h
              </div>
            </div>
            <div className="policy-item">
              <div className="policy-label">Wallet Credits</div>
              <div className="policy-value">Credits applied to next billing cycle or withdrawable after 7 days.</div>
            </div>
            <div className="policy-item">
              <div className="policy-label">Plan Pause (Monthly only)</div>
              <div className="policy-value">
                <span className="pill pill-blue">Up to 5 days</span> free pause per month. Days shifted to end.
              </div>
            </div>
            <div className="policy-item">
              <div className="policy-label">Full Cancellation</div>
              <div className="policy-value">Prorated refund for remaining undelivered days minus cancellation fee (₹49).</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="tabs-container">
        {[
          { key: "daily",   label: "Daily Tiffin",   emoji: "☀️" },
          { key: "weekly",  label: "Weekly Plan",    emoji: "📅" },
          { key: "monthly", label: "Monthly Plan",   emoji: "🗓️" },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.emoji} {t.label}
            <span className="tab-count">{tabCounts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* ── Subscription Info (weekly / monthly) ──────── */}
      {(tab === "weekly" || tab === "monthly") && currentPlan && (
        <div className="subscription-notice">
          <span className="notice-icon">{currentPlan.emoji}</span>
          <div>
            <div className="notice-title">{currentPlan.name} — Subscription Plan</div>
            <div className="notice-body">
              {currentPlan.desc}
              <br />
              {currentPlan.features.map((f, i) => (
                <span key={i}><span className="notice-tag">✓</span>{f}{i < currentPlan.features.length - 1 ? " · " : ""}</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowPlanInfo(v => !v)}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0, marginTop: 2 }}
          >
            {showPlanInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      )}

      {/* ── Plan Details (expanded) ──────────────────── */}
      {showPlanInfo && currentPlan && (
        <div className="policy-card" style={{ animation: "slideDown 0.2s ease" }}>
          <div className="policy-card-title">
            <Package size={14} color="var(--accent)" /> {currentPlan.name} — Refund Rules
          </div>
          <div className="policy-grid">
            {currentPlan.refundRules.map((r, i) => (
              <div key={i} className="policy-item">
                <div className="policy-label">{r.label}</div>
                <div className="policy-value">
                  <span className="pill" style={{ background: r.color + "22", color: r.color }}>
                    {r.refund}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add / Edit Form ──────────────────────────── */}
      {showForm && (
        <div className="form-panel">
          {/* Form Header */}
          <div className="form-header">
            <div className="form-title">
              {editId ? "✏️ Edit Meal" : "🍱 Add New Meal"}
              {isSubscription && (
                <span style={{
                  fontSize: 11, background: "var(--blue-dim)", color: "var(--blue)",
                  borderRadius: 5, padding: "2px 9px", marginLeft: 10, fontFamily: "var(--font-body)", fontWeight: 600
                }}>
                  Subscription Plan
                </span>
              )}
            </div>
            <button className="btn-icon" onClick={closeForm}><X size={16} /></button>
          </div>

          {formError && (
            <div className="form-error">
              <AlertCircle size={14} /> {formError}
            </div>
          )}

          <div className="form-grid">
            {/* Image Upload */}
            <div className="col-full">
              <label className="field-label">TIFFIN PHOTO</label>
              <div
                className={`image-upload-zone ${form.imagePreview ? "has-image" : ""}`}
                onClick={() => fileRef.current?.click()}
              >
                {form.imagePreview ? (
                  <>
                    <img src={form.imagePreview} alt="preview" />
                    <div className="image-overlay">
                      <div className="image-overlay-text"><Upload size={14} /> Change Photo</div>
                    </div>
                  </>
                ) : (
                  <div className="image-placeholder">
                    <div className="icon-wrap">🍽️</div>
                    <div className="upload-label">Click to upload tiffin photo</div>
                    <div className="upload-hint">JPG, PNG — max 5 MB</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              {form.imagePreview && (
                <button className="btn-remove-image" onClick={() => setForm(p => ({ ...p, image: null, imagePreview: null }))}>
                  × Remove photo
                </button>
              )}
            </div>

            {/* Meal Name */}
            <div className="col-full">
              <label className="field-label">MEAL NAME <span className="required">*</span></label>
              <input
                className="field-input"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder={
                  form.type === "weekly"  ? "e.g. Weekly Veg Thali Plan" :
                  form.type === "monthly" ? "e.g. Monthly Economy Tiffin" :
                  "e.g. Special Veg Thali (Lunch)"
                }
              />
            </div>

            {/* Type */}
            <div>
              <label className="field-label">TYPE</label>
              <select className="field-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="daily">Daily Tiffin</option>
                <option value="weekly">Weekly Subscription</option>
                <option value="monthly">Monthly Subscription</option>
              </select>
            </div>

            {/* Slot */}
            <div>
              <label className="field-label">SLOT</label>
              <select className="field-input" value={form.slot} onChange={e => setForm(p => ({ ...p, slot: e.target.value }))}>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="both">Both (Lunch + Dinner)</option>
              </select>
            </div>

            {/* Date (for daily) or Start Date (for sub) */}
            <div>
              <label className="field-label">
                <Calendar size={10} style={{ marginRight: 4 }} />
                {form.type === "daily" ? "MENU DATE" : "PLAN START DATE"} <span className="required">*</span>
              </label>
              <input
                type="date"
                className="field-input"
                value={form.menu_date}
                onChange={e => setForm(p => ({ ...p, menu_date: e.target.value }))}
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Price */}
            <div>
              <label className="field-label">
                {form.type === "daily"   ? "PRICE PER MEAL (₹)" :
                 form.type === "weekly"  ? "WEEKLY PRICE (₹)" :
                 "MONTHLY PRICE (₹)"} <span className="required">*</span>
              </label>
              <input
                type="number"
                className="field-input"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder={form.type === "daily" ? "105" : form.type === "weekly" ? "700" : "2500"}
              />
            </div>

            {/* Monthly: Separate lunch / dinner / both pricing */}
            {form.type === "monthly" && (
              <>
                <div>
                  <label className="field-label">LUNCH-ONLY PRICE / MONTH (₹) <span className="optional">(optional)</span></label>
                  <input
                    type="number"
                    className="field-input"
                    value={form.monthly_price_lunch}
                    onChange={e => setForm(p => ({ ...p, monthly_price_lunch: e.target.value }))}
                    placeholder="e.g. 1800"
                  />
                </div>
                <div>
                  <label className="field-label">DINNER-ONLY PRICE / MONTH (₹) <span className="optional">(optional)</span></label>
                  <input
                    type="number"
                    className="field-input"
                    value={form.monthly_price_dinner}
                    onChange={e => setForm(p => ({ ...p, monthly_price_dinner: e.target.value }))}
                    placeholder="e.g. 2000"
                  />
                </div>
                <div>
                  <label className="field-label">BOTH (LUNCH+DINNER) / MONTH (₹) <span className="optional">(optional)</span></label>
                  <input
                    type="number"
                    className="field-input"
                    value={form.monthly_price_both}
                    onChange={e => setForm(p => ({ ...p, monthly_price_both: e.target.value }))}
                    placeholder="e.g. 3200"
                  />
                </div>
              </>
            )}

            {/* Plan description (subscription) */}
            {isSubscription && (
              <div className="col-full">
                <label className="field-label">PLAN DESCRIPTION <span className="optional">(optional)</span></label>
                <input
                  className="field-input"
                  value={form.plan_description}
                  onChange={e => setForm(p => ({ ...p, plan_description: e.target.value }))}
                  placeholder="e.g. Wholesome home-style meals with seasonal vegetables, dal, and roti."
                />
              </div>
            )}

            {/* Skip / Pause limits (subscription) */}
            {isSubscription && (
              <>
                <div>
                  <label className="field-label">SKIP LIMIT (days allowed) <span className="optional">(optional)</span></label>
                  <input
                    type="number"
                    className="field-input"
                    value={form.skip_limit}
                    onChange={e => setForm(p => ({ ...p, skip_limit: e.target.value }))}
                    placeholder={form.type === "weekly" ? "2" : "4"}
                  />
                </div>
                {form.type === "monthly" && (
                  <div>
                    <label className="field-label">PAUSE LIMIT (days allowed) <span className="optional">(optional)</span></label>
                    <input
                      type="number"
                      className="field-input"
                      value={form.pause_limit}
                      onChange={e => setForm(p => ({ ...p, pause_limit: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Weekly / Monthly: Day Schedule ─────────── */}
          {isSubscription && (
            <div style={{ marginTop: 24 }}>
              <div className="schedule-section-title">
                <Calendar size={14} color="var(--accent)" />
                Delivery Days
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
                  (click to toggle)
                </span>
              </div>
              <div className="week-grid">
                {DAYS_OF_WEEK.map((day) => {
                  const active = form.schedule_days.includes(day);
                  return (
                    <div
                      key={day}
                      className={`week-day-card ${active ? "active" : ""}`}
                      onClick={() => toggleDay(day)}
                    >
                      <div className="week-day-name">{day}</div>
                      {active && <div className="week-day-slot">✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Thali Breakdown ─────────────────────────── */}
          <div style={{ marginTop: 26 }}>
            <div className="thali-section-title">
              🍽️ What's in the Thali?
              <span className="hint">(* mandatory)</span>
            </div>
            <div className="thali-grid">
              {CATEGORIES.map(cat => {
                const mandatory = ["roti", "sabji", "dal"].includes(cat.key);
                return (
                  <div
                    key={cat.key}
                    className={`thali-item-card ${form[cat.key] ? "filled" : ""}`}
                  >
                    <label className="thali-item-label">
                      <span className="thali-item-emoji">{cat.emoji}</span>
                      {cat.label.toUpperCase()}
                      {mandatory
                        ? <span style={{ color: "var(--red)", fontWeight: 700 }}>*</span>
                        : <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                      }
                    </label>
                    <input
                      className="field-input"
                      style={{ background: "var(--card)" }}
                      value={form[cat.key]}
                      onChange={e => setForm(p => ({ ...p, [cat.key]: e.target.value }))}
                      placeholder={cat.placeholder}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Form Actions ─────────────────────────────── */}
          <div className="form-actions">
            <button className="btn-save" onClick={save} disabled={saving}>
              {saving ? <><RefreshCw size={13} className="spinning" /> Saving…</> : (editId ? "✓ Update Meal" : "✓ Save Meal")}
            </button>
            <button className="btn-cancel" onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Cards ────────────────────────────────────────── */}
      {loading ? (
        <div className="cards-grid">
          {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">No {tab} meals yet</div>
          <div className="empty-subtitle">Click "Add New Meal" to get started</div>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(m => {
            let scheduleDays = [];
            try {
              scheduleDays = JSON.parse(m.schedule_days || "[]");
            } catch (err) {
              console.warn("Invalid schedule_days value for menu", m.id, err);
              scheduleDays = [];
            }

            return (
              <div key={m.id} className={`menu-card ${m.available ? "" : "unavailable"}`}>
                {/* Image */}
                <div className="card-image-wrap">
                  {(m.image_url || m.image) ? (
                    <img src={m.image_url || m.image} alt={m.name} />
                  ) : (
                    <div className="card-img-placeholder">🍱</div>
                  )}
                  {m.menu_date && (
                    <span className="date-badge">
                      📅 {formatDate(m.menu_date)}
                    </span>
                  )}
                  <span className="slot-badge">{m.slot || m.meal_type}</span>
                  {!m.available && (
                    <div className="unavailable-overlay">
                      <span className="unavailable-tag">Stocked Out</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="card-body">
                  <div className="card-top">
                    <div className="card-name">{m.name}</div>
                    <div className="card-price">₹{m.price}</div>
                  </div>

                  {/* Schedule days (sub) */}
                  {scheduleDays.length > 0 && (
                    <div className="card-schedule">
                      {scheduleDays.map(d => <span key={d} className="day-pill">{d}</span>)}
                    </div>
                  )}

                  {/* Monthly pricing */}
                  {m.type === "monthly" && (m.monthly_price_lunch || m.monthly_price_dinner || m.monthly_price_both) && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {m.monthly_price_lunch  && <span style={{ fontSize: 11, background: "var(--green-dim)", color: "var(--green)", borderRadius: 4, padding: "2px 8px" }}>Lunch ₹{m.monthly_price_lunch}/mo</span>}
                      {m.monthly_price_dinner && <span style={{ fontSize: 11, background: "var(--orange-dim)", color: "var(--orange)", borderRadius: 4, padding: "2px 8px" }}>Dinner ₹{m.monthly_price_dinner}/mo</span>}
                      {m.monthly_price_both   && <span style={{ fontSize: 11, background: "var(--blue-dim)", color: "var(--blue)", borderRadius: 4, padding: "2px 8px" }}>Both ₹{m.monthly_price_both}/mo</span>}
                    </div>
                  )}

                  {/* Thali items */}
                  <div className="card-items">
                    {CATEGORIES.filter(cat => m[cat.key]).map(cat => (
                      <div key={cat.key} className="card-item-row">
                        <span className="card-item-emoji">{cat.emoji}</span>
                        <span className="card-item-text">
                          <strong>{cat.label}:</strong> {m[cat.key]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Skip / Pause info */}
                  {(m.skip_limit || m.pause_limit) && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, display: "flex", gap: 10 }}>
                      {m.skip_limit  && <span>⏭ Skip: {m.skip_limit} days</span>}
                      {m.pause_limit && <span>⏸ Pause: {m.pause_limit} days</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="card-actions">
                    <button className="card-action-btn edit" onClick={() => openEdit(m)}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      className="card-action-btn delete"
                      onClick={() => remove(m.id)}
                      disabled={deleting === m.id}
                    >
                      <Trash2 size={12} /> {deleting === m.id ? "…" : "Delete"}
                    </button>
                    <button
                      className={`card-action-btn ${m.available ? "toggle-active" : "toggle-inactive"}`}
                      onClick={() => toggle(m.id, m.available)}
                    >
                      {m.available
                        ? <><Eye size={12} /> Active</>
                        : <><X size={12} /> Out</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
