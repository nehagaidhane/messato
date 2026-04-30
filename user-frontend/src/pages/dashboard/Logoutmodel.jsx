// import { useEffect, useRef } from "react";
import api from "../../api/axios";
import "./LogoutModel.css"; // 👈 import the CSS below

const LogoutModal = ({ onClose }) => {
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("User logout API failed, clearing local auth anyway", err?.message);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("type");
    localStorage.removeItem("rememberedEmail");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("type");
    window.location.href = "/";
  };

  return (
    <div className="logout-overlay" onClick={onClose}>
      <div className="logout-modal" onClick={e => e.stopPropagation()}>

        <span className="logout-close" onClick={onClose} title="Close">✕</span>

        <div className="logout-icon-ring">
          <svg className="logout-ring-svg" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="34" stroke="url(#ringGrad)"
              strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round"/>
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff4040" stopOpacity="0.9"/>
                <stop offset="0.5" stopColor="#ff8060" stopOpacity="0.4"/>
                <stop offset="1" stopColor="#ff4040" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="logout-inner-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 3.5A9 9 0 1 0 15 4" stroke="#ff5a45" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 3v9" stroke="#ff5a45" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h3>Logging Out?</h3>
        <p>You'll be signed out of your current session.<br/>Come back anytime — we'll miss you.</p>

        <div className="logout-divider" />

        <div className="logout-btn-group">
          <button className="logout-btn-confirm" onClick={handleLogout}>LOG OUT</button>
          <button className="logout-btn-cancel" onClick={onClose}>Stay Signed In</button>
        </div>

        <div className="logout-session-tag">
          <span className="logout-session-dot" />
          <span>Active session · Secured</span>
        </div>

      </div>
    </div>
  );
};

export default LogoutModal;