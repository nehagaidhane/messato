

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../../api/axios";

export default function ProtectedVendorRoute({ children }) {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  const userType = localStorage.getItem("userType");
  const initialRedirectTo = !token || userType !== "vendor" ? "/login" : null;

  const [state, setState] = useState(initialRedirectTo ? "redirect" : "loading"); // loading | ok | redirect
  const [redirectTo, setRedirectTo] = useState(initialRedirectTo);
  const location = useLocation();

  useEffect(() => {
    if (initialRedirectTo) return;

    api
      .get("/onboarding/status")
      .then((res) => {
        const status = res.data?.status;

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
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          localStorage.removeItem("userType");
          setRedirectTo("/login");
          setState("redirect");
          return;
        }

        setState("ok");
      });

  }, [initialRedirectTo, token]);

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


