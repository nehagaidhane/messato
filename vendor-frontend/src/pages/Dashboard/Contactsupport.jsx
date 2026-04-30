// pages/settings/SupportPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { T } from "../../constants/theme";
import api from "../../api/axios";

const CATEGORIES = [
  { value: "general",   label: "General Query"      },
  { value: "billing",   label: "Billing / Payments"  },
  { value: "technical", label: "Technical Issue"     },
  { value: "orders",    label: "Order Problem"       },
  { value: "account",   label: "Account Issue"       },
];

const statusColor = {
  open:        "#f39c12",
  in_progress: "#3498db",
  resolved:    "#27ae60",
  closed:      "#95a5a6",
};

export default function SupportPage() {
  const navigate = useNavigate();
  const [form,      setForm]      = useState({ subject: "", category: "general", message: "" });
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");
  const [tickets,   setTickets]   = useState([]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data } = await api.get("/vendor/support/tickets");
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  };

  // ── Submit ───────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault(); // stops page reload

    if (!form.subject.trim() || !form.message.trim()) {
      setError("Please fill in subject and message.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/vendor/support/tickets", {
        subject:  form.subject.trim(),
        category: form.category,
        message:  form.message.trim(),
      });
      console.log("Ticket created:", res.data);
      setSubmitted(true);
      loadTickets();
    } catch (err) {
      console.error("Submit error:", err);
      if (err.response)       setError(err.response.data?.message || "Server error");
      else if (err.request)   setError("No response from server. Check your connection.");
      else                    setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: "12px 14px", color: T.textPrimary,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box", outline: "none",
  };

  // ── Success screen ───────────────────────────────────
  if (submitted) return (
    <div style={{ maxWidth: 680, textAlign: "center", paddingTop: 60 }}>
      <CheckCircle size={56} color={T.accent} style={{ marginBottom: 16 }} />
      <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>
        Ticket Submitted!
      </div>
      <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 32 }}>
        Our team will get back to you within 24–48 hours.
      </div>
      <button
        onClick={() => {
          setSubmitted(false);
          setForm({ subject: "", category: "general", message: "" });
        }}
        style={{
          background: T.accent, color: "#fff", border: "none",
          borderRadius: 10, padding: "12px 28px", fontSize: 14,
          fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          marginRight: 12,
        }}>
        Submit Another
      </button>
      <button
        onClick={() => navigate("/vendor/dashboard")}
        style={{
          background: T.surface, color: T.textSecondary,
          border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "12px 28px", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>
        Back to Settings
      </button>
    </div>
  );

  // ── Main page ────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center",
        }}>
          <ArrowLeft size={16} color={T.textSecondary} />
        </button>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
          Contact Support
        </div>
      </div>

      {/* Form card — wrapped in <form> for proper submit handling */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Category */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 6 }}>
              Category
            </label>
            <select value={form.category} onChange={e => set("category", e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 6 }}>
              Subject
            </label>
            <input
              type="text"
              placeholder="Brief description of your issue"
              value={form.subject}
              onChange={e => set("subject", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 6 }}>
              Message
            </label>
            <textarea
              rows={5}
              placeholder="Describe your issue in detail..."
              value={form.message}
              onChange={e => set("message", e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              fontSize: 13, color: "#e74c3c",
              padding: "10px 14px", background: "#fdeaea", borderRadius: 8,
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: T.accent, color: "#fff", border: "none", borderRadius: 10,
              padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 8,
              opacity: loading ? 0.7 : 1,
            }}>
            <Send size={15} />
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>

        </form>
      </div>

      {/* Past tickets */}
      {tickets.length > 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
              My Tickets
            </div>
          </div>
          {tickets.map((t, i) => (
            <div key={t.id} style={{
              padding: "14px 24px",
              borderBottom: i < tickets.length - 1 ? `1px solid ${T.border}` : "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{t.subject}</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                  background: (statusColor[t.status] || "#888") + "22",
                  color: statusColor[t.status] || "#888",
                  textTransform: "capitalize", whiteSpace: "nowrap",
                }}>
                  {t.status.replace("_", " ")}
                </span>
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
                {t.category} · {new Date(t.created_at).toLocaleDateString()}
              </div>
              {t.admin_reply && (
                <div style={{
                  marginTop: 8, padding: "8px 12px", background: T.surface,
                  borderRadius: 8, fontSize: 13, color: T.textSecondary,
                  borderLeft: `3px solid ${T.accent}`,
                }}>
                  <strong>Support reply:</strong> {t.admin_reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}