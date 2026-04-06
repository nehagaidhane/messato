import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorLogin.css";
import logo from "../../assets/Group 37.png";

const API_BASE = "http://localhost:5000/api/auth";

// ── Messato Logo ──────────────────────────────────────────────
const MessatoLogo = () => (
  <div className="vl-logo-wrap">
    <img 
      src={logo} 
      alt="Messato" 
      className="vl-logo-img"
    />
  </div>
);

// ── Google Icon ───────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

// ── Facebook Icon ─────────────────────────────────────────────
const FacebookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.03 4.388 11.026 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.099 24 18.102 24 12.073z" />
  </svg>
);

// ── Apple Icon ────────────────────────────────────────────────
const AppleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#1a1a2e">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

// ─────────────────────────────────────────────
// Google OAuth — loads GSI script and triggers popup
// Requires VITE_GOOGLE_CLIENT_ID in your .env file
// ─────────────────────────────────────────────
const loadGoogleScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("google-gsi-script")) return resolve();
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });

const triggerGoogleLogin = async (onSuccess, onError) => {
  try {
    await loadGoogleScript();
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch(`${API_BASE}/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.credential }),
          });
          const data = await res.json();
          if (!res.ok) return onError(data.message || "Google login failed");
          onSuccess(data);
        } catch {
          onError("Network error during Google login");
        }
      },
    });
    window.google.accounts.id.prompt();
  } catch {
    onError("Failed to load Google login");
  }
};

// ═════════════════════════════════════════════════════════════
// SCREEN 1 — LOGIN
// ═════════════════════════════════════════════════════════════
const LoginScreen = ({ onForgotPassword }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/vendor/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("userType", data.type);

    if (!data.onboardingComplete) {
      navigate("/vendor/onboarding");
    } else if (data.isApproved) {
      navigate("/vendor/dashboard");
    } else {
      navigate("/vendor/pending");
    }
  } catch {
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handleGoogle = () => {
  setError("");
  triggerGoogleLogin(
    (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userType", data.type);

      if (!data.onboardingComplete) {
        navigate("/vendor/onboarding");
      } else if (data.isApproved) {
        navigate("/vendor/dashboard");
      } else {
        navigate("/vendor/pending");
      }
    },
    (msg) => setError(msg)
  );
};

 return (
    <form onSubmit={handleLogin} className="vl-card">
      <MessatoLogo />
      <h2 className="vl-title">Log In</h2>
      <p className="vl-subtitle">Please sign in to your existing account</p>

      {error && <p className="vl-error">{error}</p>}

      <label className="vl-label">EMAIL</label>
      <input
        type="email" placeholder="example@gmail.com" value={email}
        onChange={(e) => setEmail(e.target.value)} className="vl-input" required
      />

      <label className="vl-label">PASSWORD</label>
      <div className="vl-pass-wrap">
        <input
          type={showPass ? "text" : "password"} placeholder="••••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="vl-input" required
        />
        <button type="button" onClick={() => setShowPass((v) => !v)} className="vl-eye-btn">
          {showPass ? "🙈" : "👁️"}
        </button>
      </div>

      <div className="vl-row">
        <label className="vl-remember-label">
          <input
            type="checkbox" checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
        <button type="button" onClick={onForgotPassword} className="vl-forgot-btn">
          Forgot Password
        </button>
      </div>

      <button type="submit" className="vl-primary-btn" disabled={loading}>
        {loading ? "Logging in..." : "LOG IN"}
      </button>

      <p className="vl-bottom-text">
        Don't have an account?{" "}
        <button type="button" className="vl-signup-link" onClick={() => navigate("/signup")}>
          SIGN UP
        </button>
      </p>

      <p className="vl-or">Or</p>

      <div className="vl-social-row">
        <button type="button" className="vl-social-btn" aria-label="Facebook login">
          <FacebookIcon />
        </button>
        <button type="button" className="vl-social-btn" onClick={handleGoogle} aria-label="Google login">
          <GoogleIcon />
        </button>
        <button type="button" className="vl-social-btn" aria-label="Apple login">
          <AppleIcon />
        </button>
      </div>
    </form>
  );
};

// ═════════════════════════════════════════════════════════════
// SCREEN 2 — FORGOT PASSWORD
// ═════════════════════════════════════════════════════════════
const ForgotPasswordScreen = ({ onBack, onOtpSent }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      onOtpSent(email);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="vl-card">
      <button type="button" onClick={onBack} className="vl-back-btn">‹</button>
      <MessatoLogo />
      <h2 className="vl-title">Forgot Password</h2>
      <p className="vl-subtitle">Please sign in to your existing account</p>

      {error && <p className="vl-error">{error}</p>}

      <label className="vl-label">EMAIL</label>
      <input
        type="email" placeholder="example@gmail.com" value={email}
        onChange={(e) => setEmail(e.target.value)} className="vl-input" required
      />

      <button type="submit" className="vl-primary-btn" style={{ marginTop: 24 }} disabled={loading}>
        {loading ? "Sending..." : "SEND CODE"}
      </button>
    </form>
  );
};

// ═════════════════════════════════════════════════════════════
// SCREEN 3 — OTP VERIFICATION
// ═════════════════════════════════════════════════════════════
const VerifyScreen = ({ email, onBack, onVerified }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(50);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 3) inputRefs[i + 1].current.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs[i - 1].current.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) { setError("Enter the 4-digit code"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      onVerified(email, code);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResendTimer(50);
  };

  return (
    <form onSubmit={handleVerify} className="vl-card">
      <button type="button" onClick={onBack} className="vl-back-btn">‹</button>
      <MessatoLogo />
      <h2 className="vl-title">Verification</h2>
      <p className="vl-subtitle">
        We have sent a code to your email<br />
        <strong style={{ color: "#1a1a2e" }}>{email}</strong>
      </p>

      {error && <p className="vl-error">{error}</p>}

      <div className="vl-resend-row">
        <label className="vl-label" style={{ marginBottom: 0 }}>CODE</label>
        <button
          type="button"
          onClick={handleResend}
          className={`vl-resend-btn ${resendTimer > 0 ? "inactive" : "active"}`}
        >
          Resend {resendTimer > 0 ? `In.${resendTimer}sec` : ""}
        </button>
      </div>

      <div className="vl-otp-row">
        {otp.map((digit, i) => (
          <input
            key={i} ref={inputRefs[i]}
            type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="vl-otp-input"
          />
        ))}
      </div>

      <button type="submit" className="vl-primary-btn" disabled={loading}>
        {loading ? "Verifying..." : "VERIFY"}
      </button>
    </form>
  );
};

// ═════════════════════════════════════════════════════════════
// SCREEN 4 — RESET PASSWORD
// ═════════════════════════════════════════════════════════════
const ResetPasswordScreen = ({ email, otp, onSuccess }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset} className="vl-card">
      <MessatoLogo />
      <h2 className="vl-title">New Password</h2>
      <p className="vl-subtitle">Create a new password for your account</p>

      {error && <p className="vl-error">{error}</p>}

      <label className="vl-label">NEW PASSWORD</label>
      <div className="vl-pass-wrap">
        <input
          type={showNew ? "text" : "password"} placeholder="••••••••••"
          value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
          className="vl-input" required
        />
        <button type="button" onClick={() => setShowNew((v) => !v)} className="vl-eye-btn">
          {showNew ? "🙈" : "👁️"}
        </button>
      </div>

      <label className="vl-label vl-label-mt">CONFIRM PASSWORD</label>
      <div className="vl-pass-wrap">
        <input
          type={showConfirm ? "text" : "password"} placeholder="••••••••••"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          className="vl-input" required
        />
        <button type="button" onClick={() => setShowConfirm((v) => !v)} className="vl-eye-btn">
          {showConfirm ? "🙈" : "👁️"}
        </button>
      </div>

      <button type="submit" className="vl-primary-btn" style={{ marginTop: 28 }} disabled={loading}>
        {loading ? "Resetting..." : "RESET PASSWORD"}
      </button>
    </form>
  );
};

// ═════════════════════════════════════════════════════════════
// ROOT — Flow controller
// ═════════════════════════════════════════════════════════════
const SCREENS = { LOGIN: "login", FORGOT: "forgot", VERIFY: "verify", RESET: "reset" };

export default function VendorLogin() {
  const [screen, setScreen] = useState(SCREENS.LOGIN);
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");

  return (
    <div className="vl-page">
      {screen === SCREENS.LOGIN && (
        <LoginScreen onForgotPassword={() => setScreen(SCREENS.FORGOT)} />
      )}
      {screen === SCREENS.FORGOT && (
        <ForgotPasswordScreen
          onBack={() => setScreen(SCREENS.LOGIN)}
          onOtpSent={(email) => { setFpEmail(email); setScreen(SCREENS.VERIFY); }}
        />
      )}
      {screen === SCREENS.VERIFY && (
        <VerifyScreen
          email={fpEmail}
          onBack={() => setScreen(SCREENS.FORGOT)}
          onVerified={(email, otp) => { setFpOtp(otp); setScreen(SCREENS.RESET); }}
        />
      )}
      {screen === SCREENS.RESET && (
        <ResetPasswordScreen
          email={fpEmail}
          otp={fpOtp}
          onSuccess={() => setScreen(SCREENS.LOGIN)}
        />
      )}
    </div>
  );
}
