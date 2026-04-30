// pages/vendor/ProfilePage.jsx
// ─────────────────────────────────────────────────────────
// Fully redesigned vendor profile with backend connection.
// Each section is its own component; sidebar uses a modern
// pill-style navigation with avatar and status badge.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, createElement } from "react";
import {
  User, MessageSquare, Users, CreditCard, FileText,
  MapPin, Star, Edit2, Check, TrendingUp, RefreshCw,
  IndianRupee, Coffee, ChevronRight, AlertCircle,
  Clock, CheckCircle2, XCircle, Calendar, Loader2,
  Building2, Phone, Mail, BadgeCheck, ShieldCheck,
  Download, Eye, Banknote, Wallet
} from "lucide-react";

// ── Hooks ──────────────────────────────────────────────────────────────────────
import {
  useProfile, useDocuments, useSubscribers,
  usePayouts, useComplaints, toggleHoliday
} from "../../hooks/Usevendorprofile";

// ── Theme ─ keep consistent with your existing T object ───────────────────────
import { T } from "../../constants/theme";

// ═══════════════════════════════════════════════════════════════════════════════
//  LOADING SPINNER
// ═══════════════════════════════════════════════════════════════════════════════
function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <Loader2 size={32} color={T.accent} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STAT CARD
// ═══════════════════════════════════════════════════════════════════════════════
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", right: -10, top: -10,
        width: 70, height: 70, borderRadius: "50%",
        background: `${color}18`,
      }} />
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${color}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}>
        {icon && createElement(icon, { size: 18, color })}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FIELD DISPLAY / INPUT
// ═══════════════════════════════════════════════════════════════════════════════
function Field({ label, value, editing, onChange, multiline }) {
  const inputStyle = {
    width: "100%", background: T.surface, border: `1.5px solid ${T.accent}55`,
    borderRadius: 10, padding: "10px 14px", color: T.textPrimary,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif", resize: "none",
  };
  const displayStyle = {
    fontSize: 14, color: T.textPrimary, padding: "10px 14px",
    background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`,
    minHeight: 40,
  };

  return (
    <div>
      <label style={{
        fontSize: 10, color: T.textMuted, display: "block",
        marginBottom: 6, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase"
      }}>{label}</label>
      {editing ? (
        multiline
          ? <textarea rows={2} value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle} />
          : <input value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle} />
      ) : (
        <div style={displayStyle}>{value || <span style={{ color: T.textMuted, fontStyle: "italic" }}>Not set</span>}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  OVERVIEW SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewSection() {
  const { profile, loading, update } = useProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await update(form);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
            Mess Profile
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
            Manage your mess details and information
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {saved && (
            <span style={{ fontSize: 12, color: T.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={14} /> Saved!
            </span>
          )}
          {editing && (
            <button onClick={() => { setEditing(false); setForm({ ...profile }); }} style={{
              background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
              Cancel
            </button>
          )}
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            style={{
              background: editing ? T.green : T.card,
              color: editing ? "#fff" : T.textSecondary,
              border: `1px solid ${editing ? T.green : T.border}`,
              borderRadius: 8, padding: "8px 18px", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'DM Sans', sans-serif", opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              : editing ? <><Check size={14} /> Save Changes</>
              : <><Edit2 size={14} /> Edit Profile</>}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {profile?.status && (
        <div style={{
          padding: "12px 18px", borderRadius: 12,
          background: profile.status === "approved" ? `${T.green}15`
            : profile.status === "rejected" ? `${T.red}15`
            : `${T.yellow}15`,
          border: `1px solid ${profile.status === "approved" ? T.green
            : profile.status === "rejected" ? T.red
            : T.yellow}40`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {profile.status === "approved" ? <ShieldCheck size={16} color={T.green} />
            : profile.status === "rejected" ? <XCircle size={16} color={T.red} />
            : <Clock size={16} color={T.yellow} />}
          <div>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: profile.status === "approved" ? T.green
                : profile.status === "rejected" ? T.red : T.yellow,
              textTransform: "capitalize"
            }}>
              {profile.status} Account
            </span>
            {profile.rejection_reason && (
              <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 8 }}>
                — {profile.rejection_reason}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Basic Info */}
      <SectionCard title="Basic Information" icon={User}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 }}>
          <Field label="Mess Name"   value={form.mess_name}   editing={editing} onChange={set("mess_name")} />
          <Field label="Owner Name"  value={form.owner_name}  editing={editing} onChange={set("owner_name")} />
          <Field label="Email"       value={form.email}       editing={false}   onChange={() => {}} />
          <Field label="Phone"       value={form.mobile}      editing={editing} onChange={set("mobile")} />
          <Field label="Experience (years)" value={form.experience} editing={editing} onChange={set("experience")} />
          <Field label="City"        value={form.city}        editing={editing} onChange={set("city")} />
          <Field label="State"       value={form.state}       editing={editing} onChange={set("state")} />
          <Field label="Zip"         value={form.zip}         editing={editing} onChange={set("zip")} />
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Address" value={form.address} editing={editing} onChange={set("address")} multiline />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Description" value={form.description} editing={editing} onChange={set("description")} multiline />
          </div>
        </div>
      </SectionCard>

      {/* Compliance */}
      <SectionCard title="FSSAI & Compliance" icon={BadgeCheck}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 }}>
          <Field label="FSSAI Number"   value={form.fssai_number}   editing={editing} onChange={set("fssai_number")} />
          <Field label="FSSAI Issue Date"    value={form.fssai_date}     editing={false} onChange={() => {}} />
          <Field label="FSSAI Valid Until"   value={form.fssai_validity} editing={false} onChange={() => {}} />
          <Field label="Cuisine Type"   value={form.cuisine_type}   editing={editing} onChange={set("cuisine_type")} />
          <Field label="Operating Days" value={form.operating_days} editing={editing} onChange={set("operating_days")} />
          <Field label="Uses Onion/Garlic" value={form.uses_onion_garlic ? "Yes" : "No"} editing={false} onChange={() => {}} />
        </div>
      </SectionCard>

      {/* Ratings */}
      <SectionCard title="Ratings & Performance" icon={Star}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", padding: "20px 32px", background: T.surface, borderRadius: 14, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#EAB308", fontFamily: "'Syne', sans-serif" }}>
              {profile?.avg_rating || "0.0"}
            </div>
            <div style={{ display: "flex", gap: 3, justifyContent: "center", margin: "8px 0" }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16}
                  color="#EAB308"
                  fill={i <= Math.round(profile?.avg_rating || 0) ? "#EAB308" : "none"}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted }}>
              {profile?.rating_count || 0} reviews
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.8 }}>
              <div>Active Since: <span style={{ color: T.textPrimary, fontWeight: 600 }}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
              </span></div>
              <div>Service Radius: <span style={{ color: T.textPrimary, fontWeight: 600 }}>
                {profile?.service_radius ? `${profile.service_radius} km` : "—"}
              </span></div>
              <div>Tags: <span style={{ color: T.textPrimary, fontWeight: 600 }}>
                {profile?.tags ? (Array.isArray(profile.tags) ? profile.tags.join(", ") : JSON.stringify(profile.tags)) : "—"}
              </span></div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DOCUMENTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function DocumentsSection() {
  const { docs, loading } = useDocuments();
  if (loading) return <Spinner />;

  const DOC_LABELS = {
    fssai: "FSSAI Certificate",
    gst: "GST Certificate",
    id_proof: "ID Proof",
    address_proof: "Address Proof",
    shop_image: "Shop Image",
    bank_passbook: "Bank Passbook",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>Documents</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>Your uploaded verification documents</div>
      </div>

      {docs.length === 0 ? (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: 48, textAlign: "center"
        }}>
          <FileText size={40} color={T.textMuted} style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 15, color: T.textMuted }}>No documents uploaded yet</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>
            Upload documents during onboarding or contact support
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {docs.map((doc, i) => (
            <div key={i} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${T.accent}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={20} color={T.accent} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
                    {DOC_LABELS[doc.doc_type] || doc.doc_type}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                    {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={doc.file_url} target="_blank" rel="noreferrer"
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: `${T.accent}18`, border: `1px solid ${T.accent}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.accent, textDecoration: "none",
                  }}>
                  <Eye size={15} />
                </a>
                <a href={doc.file_url} download
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: `${T.green}18`, border: `1px solid ${T.green}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.green, textDecoration: "none",
                  }}>
                  <Download size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMPLAINTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ComplaintsSection() {
  const { complaints, total, loading } = useComplaints();
  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>Complaints</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
            {total} total · {complaints.filter(c => c.status === "open").length} open
          </div>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: 48, textAlign: "center"
        }}>
          <CheckCircle2 size={40} color={T.green} style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 15, color: T.textMuted }}>No complaints — great job! 🎉</div>
        </div>
      ) : (
        complaints.map((c, i) => (
          <div key={i} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: 20,
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: c.status === "open" ? `${T.red}15` : `${T.green}15`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {c.status === "open"
                  ? <AlertCircle size={18} color={T.red} />
                  : <CheckCircle2 size={18} color={T.green} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{c.issue}</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
                  {c.user_name} · {new Date(c.created_at).toLocaleDateString("en-IN")} · #{c.id}
                </div>
              </div>
            </div>
            <StatusBadge status={c.status} />
          </div>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SUBSCRIBERS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function SubscribersSection() {
  const { subscribers, total, loading } = useSubscribers();
  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
          Subscribers
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{total} unique customers</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <StatCard icon={Users}    label="Total Subscribers"  value={total}           color={T.accent} />
        <StatCard icon={TrendingUp} label="Avg Spend"        value={total > 0 ? `₹${Math.round(subscribers.reduce((a,s)=>a+(s.total_spent||0),0)/total)}` : "₹0"} color={T.green} />
        <StatCard icon={Calendar} label="New This Month"     value={subscribers.filter(s => new Date(s.first_order) > new Date(Date.now()-30*86400000)).length} color="#EAB308" />
      </div>

      {subscribers.length === 0 ? (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 48, textAlign: "center" }}>
          <Users size={40} color={T.textMuted} style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 15, color: T.textMuted }}>No subscribers yet</div>
        </div>
      ) : (
        <SectionCard title="All Subscribers" icon={Users}>
          {subscribers.map((s, i, arr) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0",
              borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
              flexWrap: "wrap", gap: 10,
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: `${T.accent}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: T.accent,
                }}>
                  {(s.name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>
                    {s.email} · {s.total_orders} orders
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.accent }}>
                  ₹{(s.total_spent || 0).toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                  Since {new Date(s.first_order).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
          ))}
        </SectionCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAYOUTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function PayoutsSection() {
  const { data, loading } = usePayouts();
  if (loading) return <Spinner />;
  if (!data) return <div style={{ color: T.textMuted, padding: 40 }}>Could not load payout data.</div>;

  const lastPayout = data.payoutHistory?.[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>Payouts</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>Earnings and payment history</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard icon={Wallet}      label="Available Balance" value={`₹${Number(data.availableBalance).toLocaleString("en-IN")}`} color={T.green} />
        <StatCard icon={TrendingUp}  label="This Month"        value={`₹${Number(data.thisMonth).toLocaleString("en-IN")}`}       color={T.accent} />
        <StatCard icon={RefreshCw}   label="Last Payout"       value={lastPayout ? `₹${Number(lastPayout.amount).toLocaleString("en-IN")}` : "—"}
          sub={lastPayout ? new Date(lastPayout.created_at).toLocaleDateString("en-IN") : "No payouts yet"}
          color="#EAB308" />
      </div>

      {/* Bank Details */}
      {data.bankDetails && (
        <SectionCard title="Bank Account" icon={Banknote}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              ["Account Holder", data.bankDetails.account_holder_name],
              ["Bank Name",      data.bankDetails.bank_name],
              ["Account Number", data.bankDetails.account_number?.replace(/.(?=.{4})/g, "●")],
              ["IFSC Code",      data.bankDetails.ifsc_code],
              ["Branch",         data.bankDetails.branch_name],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 14, color: T.textPrimary, fontWeight: 600 }}>{val || "—"}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Payout History */}
      <SectionCard title="Payout History" icon={RefreshCw}>
        {!data.payoutHistory?.length ? (
          <div style={{ textAlign: "center", padding: 32, color: T.textMuted }}>
            No payouts yet
          </div>
        ) : data.payoutHistory.map((p, i, arr) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 0",
            borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <div>
              <div style={{ fontSize: 14, color: T.textPrimary, fontWeight: 600 }}>
                {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>PAY-{p.id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.green }}>
                ₹{Number(p.amount).toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 11, color: T.green, marginTop: 2 }}>
                ✓ {p.status || "Completed"}
              </div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SERVICE AREA SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ServiceAreaSection() {
  const { profile, loading } = useProfile();
  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>Service Area</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>Your delivery coverage zone</div>
      </div>
      <SectionCard title="Location Details" icon={MapPin}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
          {[
            ["Address", profile?.address],
            ["City", profile?.city],
            ["State", profile?.state],
            ["Zip", profile?.zip],
            ["Town", profile?.town],
            ["Service Radius", profile?.service_radius ? `${profile.service_radius} km` : null],
            ["Latitude", profile?.latitude],
            ["Longitude", profile?.longitude],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 14, color: val ? T.textPrimary : T.textMuted, fontWeight: val ? 500 : 400, fontStyle: val ? "normal" : "italic" }}>
                {val || "Not set"}
              </div>
            </div>
          ))}
        </div>

        {profile?.latitude && profile?.longitude && (
          <div style={{ marginTop: 20, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
            <iframe
              title="Location Map"
              width="100%"
              height="280"
              frameBorder="0"
              src={`https://maps.google.com/maps?q=${profile.latitude},${profile.longitude}&z=14&output=embed`}
              style={{ display: "block" }}
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function SectionCard({ title, icon: Icon, children }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 15, fontWeight: 700, color: T.textPrimary,
          marginBottom: 20, fontFamily: "'Syne', sans-serif",
          paddingBottom: 14, borderBottom: `1px solid ${T.border}`,
        }}>
          {Icon && <Icon size={16} color={T.accent} />}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    open:     { bg: `${T.red}18`,   color: T.red,   label: "Open"     },
    resolved: { bg: `${T.green}18`, color: T.green, label: "Resolved" },
    pending:  { bg: `${T.yellow}18`,color: "#EAB308",label:"Pending"  },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}40`,
      borderRadius: 6, padding: "4px 12px",
      fontSize: 12, fontWeight: 700,
    }}>{s.label}</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SIDEBAR NAV CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const SECTIONS = [
  { id: "overview",    label: "Overview",     icon: User,         desc: "Profile & details" },
  { id: "complaints",  label: "Complaints",   icon: MessageSquare,desc: "Customer issues"   },
  { id: "subscribers", label: "Subscribers",  icon: Users,        desc: "Your customers"    },
  { id: "payouts",     label: "Payouts",      icon: CreditCard,   desc: "Earnings & bank"   },
  { id: "documents",   label: "Documents",    icon: FileText,     desc: "Uploaded files"    },
  { id: "service",     label: "Service Area", icon: MapPin,       desc: "Delivery zone"     },
];

const SECTION_COMPONENTS = {
  overview:    OverviewSection,
  complaints:  ComplaintsSection,
  subscribers: SubscribersSection,
  payouts:     PayoutsSection,
  documents:   DocumentsSection,
  service:     ServiceAreaSection,
};

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const [section, setSection] = useState("overview");
  const [holiday, setHoliday] = useState(false);
  const [holidayLoading, setHolidayLoading] = useState(false);
  const { profile } = useProfile();

  const handleHoliday = async () => {
    setHolidayLoading(true);
    try {
      const res = await toggleHoliday();
      setHoliday(res.holiday);
    } catch (e) {
      alert("Failed to toggle holiday: " + e.message);
    } finally {
      setHolidayLoading(false);
    }
  };

  const ActiveSection = SECTION_COMPONENTS[section] || OverviewSection;

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <div style={{ width: 240, flexShrink: 0, minWidth: 200 }}>
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 20, overflow: "hidden", position: "sticky", top: 20,
        }}>
          {/* Avatar */}
          <div style={{
            padding: "28px 20px 20px",
            background: `linear-gradient(145deg, ${T.accent}22 0%, ${T.surface} 100%)`,
            textAlign: "center", borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.accent}, ${T.accent}99)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, margin: "0 auto 12px",
              boxShadow: `0 4px 20px ${T.accent}40`,
            }}>
              👨‍🍳
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
              {profile?.mess_name || "Your Mess"}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
              {profile?.owner_name || "Owner"}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 10 }}>
              <Star size={12} color="#EAB308" fill="#EAB308" />
              <span style={{ fontSize: 13, color: "#EAB308", fontWeight: 700 }}>
                {profile?.avg_rating || "0.0"}
              </span>
              <span style={{ fontSize: 11, color: T.textMuted }}>
                · {profile?.rating_count || 0} ratings
              </span>
            </div>

            {/* Status pill */}
            <div style={{ marginTop: 12 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", padding: "4px 10px", borderRadius: 20,
                background: profile?.status === "approved" ? `${T.green}20` : `${T.yellow}20`,
                color: profile?.status === "approved" ? T.green : "#EAB308",
                border: `1px solid ${profile?.status === "approved" ? T.green : "#EAB308"}40`,
              }}>
                {profile?.status || "Pending"}
              </span>
            </div>
          </div>

          {/* Holiday toggle */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <button
              onClick={handleHoliday}
              disabled={holidayLoading}
              style={{
                width: "100%", border: "none", borderRadius: 10, padding: "10px 12px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: holiday ? T.red : `${T.accent}18`,
                color: holiday ? "#fff" : T.accent,
                border: `1px solid ${holiday ? T.red : T.accent}40`,
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.2s",
                opacity: holidayLoading ? 0.6 : 1,
              }}
            >
              {holidayLoading
                ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                : <Coffee size={13} />}
              {holiday ? "Holiday Marked ✓" : "Mark Holiday Today"}
            </button>
          </div>

          {/* Nav links */}
          <div style={{ padding: "8px 10px 12px" }}>
            {SECTIONS.map(s => {
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  style={{
                    width: "100%",
                    background: active ? `${T.accent}15` : "transparent",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 12px",
                    marginBottom: 3,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: active ? T.accent : `${T.textMuted}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}>
                    <s.icon size={14} color={active ? "#fff" : T.textMuted} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      color: active ? T.textPrimary : T.textSecondary,
                    }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>{s.desc}</div>
                  </div>
                  {active && (
                    <ChevronRight size={13} color={T.accent} style={{ marginLeft: "auto" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ActiveSection />
      </div>
    </div>
  );
}
