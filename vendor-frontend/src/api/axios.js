import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

const getStoredAccessToken = () =>
  localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

const setStoredAccessToken = (token) => {
  if (localStorage.getItem("accessToken")) {
    localStorage.setItem("accessToken", token);
    return;
  }

  if (sessionStorage.getItem("accessToken")) {
    sessionStorage.setItem("accessToken", token);
    return;
  }

  localStorage.setItem("accessToken", token);
};

const clearStoredAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userType");
  localStorage.removeItem("userEmail");
  sessionStorage.removeItem("accessToken");
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const flushRefreshSubscribers = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh-vendor")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          originalRequest._retry = true;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshRes = await refreshClient.get("/auth/refresh-vendor");
      const newToken = refreshRes.data?.accessToken;

      if (!newToken) {
        throw new Error("Refresh token response missing access token");
      }

      setStoredAccessToken(newToken);
      flushRefreshSubscribers(newToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      flushRefreshSubscribers(null);
      clearStoredAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;