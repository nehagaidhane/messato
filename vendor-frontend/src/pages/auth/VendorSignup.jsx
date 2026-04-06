import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorSignup.css";
import logo from "../../assets/Group 37.png";

const API_BASE = "http://localhost:5000/api/auth";

/* ── Desktop Left Panel ──────────────────────────────────── */
const DesktopPanel = () => (
  <div className="vs-desktop-panel">
    {/* Extra decorative ring element */}
    <div className="dp-ring-extra" />

    {/* Brand */}
    <div className="dp-logo-wrap">
      {/* White pill so the logo is always visible on the dark bg */}
      <img src={logo} alt="Messato" className="dp-logo-img" />
      <span className="dp-brand-name">Messato</span>
    </div>

    {/* Tagline */}
    <h1 className="dp-tagline">
      Home-cooked meals,<br />
      <span>delivered fresh</span><br />
      every day.
    </h1>

    <p className="dp-desc">
      Messato connects you with trusted tiffin vendors who prepare nutritious,
      hygienic, home-style meals — so you never have to compromise on taste or
      health, no matter how busy your day gets.
    </p>

    {/* Features */}
    <div className="dp-features">
      <div className="dp-feature">
        <div className="dp-feature-icon">🍱</div>
        <div className="dp-feature-text">
          <strong>Fresh Daily Tiffins</strong>
          <span>Meals cooked fresh every morning by verified home chefs</span>
        </div>
      </div>
      <div className="dp-feature">
        <div className="dp-feature-icon">🚴</div>
        <div className="dp-feature-text">
          <strong>On-Time Delivery</strong>
          <span>Hot tiffins at your doorstep — lunch &amp; dinner on schedule</span>
        </div>
      </div>
      <div className="dp-feature">
        <div className="dp-feature-icon">🥗</div>
        <div className="dp-feature-text">
          <strong>Customised Menus</strong>
          <span>Veg, non-veg, diet plans — tailored to your preferences</span>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="dp-stats">
      <div className="dp-stat"><strong>2,400+</strong><span>Happy customers</span></div>
      <div className="dp-stat"><strong>180+</strong><span>Tiffin vendors</span></div>
      <div className="dp-stat"><strong>4.8★</strong><span>Avg. rating</span></div>
    </div>

    {/* Accent dots at the bottom */}
    <div className="dp-accent-bar">
      <div className="dp-accent-dot" />
      <div className="dp-accent-dot active" />
      <div className="dp-accent-dot" />
    </div>
  </div>
);

/* ── Signup Form ─────────────────────────────────────────── */
function SignupForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [msg, setMsg]                 = useState({ text: "", type: "" });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (!form.name || !form.email || !form.password || !form.confirmPassword)
      return setMsg({ text: "All fields required", type: "error" });

    if (form.password !== form.confirmPassword)
      return setMsg({ text: "Passwords do not match", type: "error" });

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/signup-vendor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: data.message, type: "success" });
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMsg({ text: data.message, type: "error" });
      }
    } catch {
      setMsg({ text: "Network error. Please try again.", type: "error" });
    }
    setLoading(false);
  };

  return (
    <form className="vs-card" onSubmit={submit}>

      {/*
        BACK BUTTON
        ─ Mobile: position:absolute (top-left of page) via CSS
        ─ Desktop: position:static, flows above the heading via CSS
        No inline styles needed.
      */}
      <button
        type="button"
        className="vs-back-btn"
        onClick={() => navigate("/")}
        aria-label="Back to login"
      >
        ‹
      </button>

      {/* ── MOBILE ONLY: logo + "Sign Up" title + subtitle ── */}
      <div className="vl-logo-wrap">
        <img src={logo} alt="Messato" className="vl-logo-img" />
      </div>
      <h2 className="vs-title">Sign Up</h2>
      <p className="vs-subtitle">Please sign in to your existing account</p>

      {/*
        DESKTOP ONLY heading block.
        CSS: display:none on mobile, display:block on ≥900px.
        "Create an Account" never appears on mobile.
      */}
      <div className="vs-desktop-form-header">
        <h2>Create an Account</h2>
        <p>Join Messato and start listing your tiffin service today</p>
      </div>

      {/* Name */}
      <label className="vs-label">NAME</label>
      <input
        name="name"
        placeholder="John Doe"
        value={form.name}
        onChange={handle}
        className="vs-input"
        autoComplete="name"
      />

      {/* Email */}
      <label className="vs-label">EMAIL</label>
      <input
        name="email"
        type="email"
        placeholder="example@gmail.com"
        value={form.email}
        onChange={handle}
        className="vs-input"
        autoComplete="email"
      />

      {/* Passwords */}
      <div className="vs-pass-row">
        <div className="vs-pass-col">
          <label className="vs-label">PASSWORD</label>
          <div className="vs-pass-wrap">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••••"
              value={form.password}
              onChange={handle}
              className="vs-input"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="vs-eye-btn"
              onClick={() => setShowPass(v => !v)}
              aria-label="Toggle password"
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="vs-pass-col">
          <label className="vs-label">RE-TYPE PASSWORD</label>
          <div className="vs-pass-wrap">
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••"
              value={form.confirmPassword}
              onChange={handle}
              className="vs-input"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="vs-eye-btn"
              onClick={() => setShowConfirm(v => !v)}
              aria-label="Toggle confirm password"
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
      </div>

      {/* Status message */}
      {msg.text && <p className={`vs-msg ${msg.type}`}>{msg.text}</p>}

      {/* Submit */}
      <button type="submit" className="vs-btn" disabled={loading}>
        {loading ? "SIGNING UP..." : "SIGN UP"}
      </button>

      {/* Bottom link */}
      <p className="vs-bottom-text">
        Already have an account?{" "}
        <button type="button" className="vs-link" onClick={() => navigate("/")}>
          LOG IN
        </button>
      </p>

    </form>
  );
}

/* ── Page Root ───────────────────────────────────────────── */
export default function VendorSignup() {
  return (
    <div className="vs-page">
      <div className="vs-split">
        <DesktopPanel />
        <div className="vs-form-panel">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
