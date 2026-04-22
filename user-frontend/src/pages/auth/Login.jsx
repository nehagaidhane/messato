import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../api/axios";
import "./Login.css";

// ─────────────────────────────────────────────────────────────
// Facebook SDK — loads once
// ─────────────────────────────────────────────────────────────
const loadFB = () =>
  new Promise((resolve) => {
    if (window.FB) return resolve(window.FB);
    window.fbAsyncInit = () => {
      window.FB.init({
        appId:   import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie:  true,
        xfbml:   true,
        version: "v19.0",
      });
      resolve(window.FB);
    };
    const s = document.createElement("script");
    s.src   = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  });

// ─────────────────────────────────────────────────────────────
// Apple JS SDK — loads once
// ─────────────────────────────────────────────────────────────
const loadApple = () =>
  new Promise((resolve, reject) => {
    if (window.AppleID) return resolve(window.AppleID);
    const s = document.createElement("script");
    s.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    s.onload = () => {
      window.AppleID.auth.init({
        clientId:    import.meta.env.VITE_APPLE_CLIENT_ID,   // your Apple Services ID
        scope:       "name email",
        redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI, // must match Apple Console
        usePopup:    true,
      });
      resolve(window.AppleID);
    };
    s.onerror = () => reject(new Error("Failed to load Apple SDK"));
    document.body.appendChild(s);
  });

// ─────────────────────────────────────────────────────────────
// Helpers — Remember Me token storage
// ─────────────────────────────────────────────────────────────
const saveToken = (token, type, remember) => {
  if (remember) {
    // persist across browser restarts
    localStorage.setItem("accessToken", token);
    localStorage.setItem("type", type);
  } else {
    // cleared when tab/browser is closed
    sessionStorage.setItem("accessToken", token);
    sessionStorage.setItem("type", type);
    // also clear any old localStorage token so they don't conflict
    localStorage.removeItem("accessToken");
    localStorage.removeItem("type");
  }
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function Login() {
  const [form, setForm]                   = useState({ email: "", password: "" });
  const [showPwd, setShowPwd]             = useState(false);
  const [remember, setRemember]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [fbLoading, setFbLoading]         = useState(false);
  const [appleLoading, setAppleLoading]   = useState(false);
  const [forgotOpen, setForgotOpen]       = useState(false);
  const [forgotEmail, setForgotEmail]     = useState("");
  const [forgotSent, setForgotSent]       = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const googleBtnRef = useRef(null);
  const navigate     = useNavigate();

  // Pre-fill email from localStorage if "Remember me" was used before
  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) setForm(f => ({ ...f, email: saved }));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Normal email/password login ──────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      alert("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/auth/user/login", {
        email:      form.email,
        password:   form.password,
        rememberMe: remember,
      });

      console.log("✅ Login Response:", res.data);

     if (res.data.user.type !== "user") {
  console.warn("⚠️ User type mismatch:", res.data.user.type);
  alert("Please login as user");
  return;
}

      // Save token based on Remember Me
  saveToken(res.data.accessToken, res.data.user.type, remember);
  console.log("TYPE:", res.data.user.type);
      console.log("✅ Token saved, type:", res.data.type);

      // Persist email field if remember checked
      if (remember) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/location");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ─────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google-login", {
        token: credentialResponse.credential,
      });
      saveToken(res.data.accessToken, res.data.type, false);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Google login failed");
    }
  };

  const triggerGoogle = () => {
    const btn = googleBtnRef.current?.querySelector("div[role=button], button");
    if (btn) btn.click();
  };

  // ── Facebook login ───────────────────────────────────────────
  const handleFacebook = async () => {
    try {
      setFbLoading(true);
      const FB = await loadFB();
      FB.login(
        async (response) => {
          if (response.authResponse) {
            try {
              const res = await api.post("/auth/facebook-login", {
                accessToken: response.authResponse.accessToken,
                userID:      response.authResponse.userID,
              });
              saveToken(res.data.accessToken, res.data.type, false);
              navigate("/dashboard");
            } catch (err) {
              alert(err.response?.data?.message || "Facebook login failed");
            }
          } else {
            alert("Facebook login was cancelled.");
          }
          setFbLoading(false);
        },
        { scope: "email,public_profile" }
      );
    } catch {
      alert("Could not load Facebook SDK. Check your App ID.");
      setFbLoading(false);
    }
  };

  // ── Apple login ──────────────────────────────────────────────
  const handleApple = async () => {
    try {
      setAppleLoading(true);
      const AppleID = await loadApple();

      // This opens Apple's popup — user signs in with their Apple ID
      const appleResponse = await AppleID.auth.signIn();

      // appleResponse.authorization.id_token  → the identity token
      // appleResponse.user                     → name (only on first sign-in)
      const identityToken = appleResponse.authorization.id_token;
      const fullName      = appleResponse.user?.name || null;

      const res = await api.post("/auth/apple-login", {
        identityToken,
        fullName,
      });

      saveToken(res.data.accessToken, res.data.type, false);
      navigate("/dashboard");
    } catch (err) {
      if (err?.error === "popup_closed_by_user") {
        // user closed the popup — no alert needed
      } else {
        console.error("Apple Login Error:", err);
        alert(err.response?.data?.message || "Apple login failed");
      }
    } finally {
      setAppleLoading(false);
    }
  };

  // ── Forgot password ──────────────────────────────────────────
  const handleForgot = async () => {
    if (!forgotEmail.trim()) { alert("Enter your email"); return; }
    try {
      setForgotLoading(true);
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotSent(false);
    setForgotEmail("");
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <div className="lp-root">
        <div className="lp-shell">

          {/* Hero */}
          <div className="lp-hero">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
              alt="Food"
              className="lp-hero-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="lp-hero-overlay">
              <h1 className="lp-hero-title">Log In</h1>
              <p className="lp-hero-sub">Please sign in to your existing account</p>
            </div>
          </div>

          {/* Form card */}
          <div className="lp-card">

            {/* Desktop-only heading */}
            <div className="lp-desktop-heading">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            {/* Email */}
            <div className="lp-field">
              <label className="lp-label">EMAIL</label>
              <input
                className="lp-input"
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label">PASSWORD</label>
              <div className="lp-input-wrap">
                <input
                  className="lp-input"
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label="Toggle password visibility"
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

            {/* Remember me / Forgot password */}
            <div className="lp-row">
              <label className="lp-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                className="lp-forgot"
                type="button"
                onClick={() => setForgotOpen(true)}
              >
                Forgot Password
              </button>
            </div>

            {/* Login button */}
            <button
              className="lp-btn-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading && <span className="lp-spinner" />}
              {loading ? "Logging in…" : "LOG IN"}
            </button>

            {/* Sign up */}
            <p className="lp-signup">
              Don't have an account?&nbsp;<Link to="/signup">SIGN UP</Link>
            </p>

            {/* Divider */}
            <div className="lp-divider"><span>Or</span></div>

            {/* Social icons */}
            <div className="lp-social">

              {/* Facebook */}
              <button
                className="lp-social-btn lp-social-fb"
                onClick={handleFacebook}
                disabled={fbLoading}
                title="Continue with Facebook"
              >
                {fbLoading ? (
                  <span className="lp-spinner lp-spinner-sm" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.3)" }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                  </svg>
                )}
              </button>

              {/* Google */}
              <button
                className="lp-social-btn lp-social-google"
                onClick={triggerGoogle}
                title="Continue with Google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              {/* Apple */}
              <button
                className="lp-social-btn lp-social-apple"
                onClick={handleApple}
                disabled={appleLoading}
                title="Continue with Apple"
              >
                {appleLoading ? (
                  <span className="lp-spinner lp-spinner-sm" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.3)" }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                )}
              </button>

            </div>

            {/* Hidden real GoogleLogin button triggered by the icon above */}
            <div ref={googleBtnRef} className="lp-google-hidden" aria-hidden="true">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Login Failed")}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="lp-backdrop"
          onClick={e => e.target === e.currentTarget && closeForgot()}
        >
          <div className="lp-modal">
            <button className="lp-modal-close" onClick={closeForgot} aria-label="Close">✕</button>
            <h3>Forgot Password?</h3>
            <p>Enter your registered email and we'll send you a reset link.</p>

            {forgotSent ? (
              <div className="lp-success">
                ✓ Reset link sent! Check your inbox (and spam folder).
              </div>
            ) : (
              <input
                className="lp-input"
                type="email"
                placeholder="example@gmail.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleForgot()}
                autoFocus
              />
            )}

            <div className="lp-modal-actions">
              <button className="lp-btn-ghost" onClick={closeForgot}>
                {forgotSent ? "Close" : "Cancel"}
              </button>
              {!forgotSent && (
                <button
                  className="lp-btn-sm"
                  onClick={handleForgot}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending…" : "Send Link"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
