
const API_BASE = "http://localhost:5000/api";

export const fetchWithAuth = async (endpoint, options = {}) => {
  let token = localStorage.getItem("token");

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    credentials: "include", // important for refresh token
  });

  // 🔴 If token expired → refresh
  if (res.status === 401) {
    console.log("Token expired, refreshing...");

    const refreshRes = await fetch(`${API_BASE}/auth/refresh-admin`, {
      method: "GET",
      credentials: "include",
    });

    const refreshData = await refreshRes.json();

    if (!refreshRes.ok) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    // ✅ store new token
    localStorage.setItem("token", refreshData.accessToken);

    token = refreshData.accessToken;

    // 🔁 retry original request
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  }

  return res;
};