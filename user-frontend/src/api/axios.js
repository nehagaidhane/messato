import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ================= INSTANCE =================
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ================= TOKEN HELPERS =================
const getStoredAccessToken = () =>
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

const setStoredAccessToken = (token) => {
  if (localStorage.getItem("accessToken")) {
    localStorage.setItem("accessToken", token);
  } else if (sessionStorage.getItem("accessToken")) {
    sessionStorage.setItem("accessToken", token);
  } else {
    localStorage.setItem("accessToken", token);
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("type");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("type");
};

// ================= REFRESH CONTROL =================
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const flushRefreshSubscribers = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    console.error("API ERROR:", {
      url: originalRequest?.url,
      status,
      data: error.response?.data,
    });

    // 🔥 Handle BOTH 401 and 403
    if (
      !originalRequest ||
      (status !== 401 && status !== 403) ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // ================= WAIT IF ALREADY REFRESHING =================
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    // ================= START REFRESH =================
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      console.log("🔄 Refreshing token...");

      const refreshRes = await refreshClient.get("/auth/refresh");

      const newToken = refreshRes.data?.accessToken;

      if (!newToken) {
        throw new Error("No access token in refresh response");
      }

      console.log("✅ New token received");

      setStoredAccessToken(newToken);
      flushRefreshSubscribers(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshErr) {
      console.error("❌ Refresh failed");

      flushRefreshSubscribers(null);
      clearStoredAuth();

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;