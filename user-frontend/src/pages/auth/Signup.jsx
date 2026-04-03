import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import "./Signup.css";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [heroErr, setHeroErr]         = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      alert("All fields are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      console.log("Sending data:", form);
      const res = await api.post("/signup-user", form);
      alert(res.data.message || "Signup successful");
      navigate("/");
    } catch (err) {
      console.log("ERROR:", err.response);
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-root">
      <div className="sp-shell">

        {/* Hero */}
        <div className="sp-hero">
          {!heroErr ? (
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
              alt="Food"
              className="sp-hero-img"
              onError={() => setHeroErr(true)}
            />
          ) : (
            <div className="sp-hero-fallback" />
          )}
          <div className="sp-hero-overlay">
            <h1>Sign Up</h1>
            <p>Please sign in to your existing account</p>
          </div>
        </div>

        {/* Card */}
        <div className="sp-card">

          {/* Name */}
          <div className="sp-field">
            <label className="sp-label">Name</label>
            <input
              className="sp-input"
              type="text"
              placeholder="John doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="sp-field">
            <label className="sp-label">Email</label>
            <input
              className="sp-input"
              type="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="sp-field">
            <label className="sp-label">Password</label>
            <div className="sp-input-wrap">
              <input
                className="sp-input"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                className="sp-eye"
                onClick={() => setShowPwd(v => !v)}
                aria-label="Toggle password"
              >
                {showPwd ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="sp-field">
            <label className="sp-label">Re-type Password</label>
            <div className="sp-input-wrap">
              <input
                className="sp-input"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                className="sp-eye"
                onClick={() => setShowConfirm(v => !v)}
                aria-label="Toggle confirm password"
              >
                {showConfirm ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            className="sp-btn-primary"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading && <span className="sp-spinner" />}
            {loading ? "Signing up…" : "SIGN UP"}
          </button>

          {/* Login link */}
          <p className="sp-login">
            Already have an account?&nbsp;<Link to="/">Login In</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;
