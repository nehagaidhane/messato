

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const API = "http://localhost:5000/api/onboarding";

export default function ProtectedVendorRoute({ children }) {
  const [state, setState] = useState("loading"); // loading | ok | redirect
  const [redirectTo, setRedirectTo] = useState(null);
  const location = useLocation();

  useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    setRedirectTo("/login");
    setState("redirect");
    return;
  }

  const userType = localStorage.getItem("userType");

  if (userType !== "vendor") {
    setRedirectTo("/login");
    setState("redirect");
    return;
  }

  fetch(`${API}/status`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(data => {
      const status = data.status;

      console.log("STATUS:", status);

      if (status === "approved") {
        setState("ok");
      } else if (status === "pending") {
        setRedirectTo("/vendor/pending");
        setState("redirect");
      } else if (status === "rejected") {
        setRedirectTo("/vendor/rejected");
        setState("redirect");
      } else {
        setRedirectTo("/vendor/onboarding"); // not_started
        setState("redirect");
      }
    })
    .catch(() => {
      setState("ok");
    });

}, []);

  if (state === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f4f6fb",
        fontFamily: "system-ui", color: "#6b7280",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          <p>Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (state === "redirect") {
    // Don't redirect away if we're already on onboarding
    if (location.pathname === redirectTo) return children;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}


