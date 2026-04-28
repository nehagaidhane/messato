// hooks/useVendorProfile.js
// ─────────────────────────────────────────────────────────────────────────────
// Uses your existing axios instance (api) so the interceptor handles
// the token automatically — no manual getToken() needed anywhere.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios"; // ← your existing axios instance

// All routes go through: app.use("/api/vendor-profile", Vendorprofileroutes)
const PREFIX = "/vendor-profile";

// ─── Central axios caller ─────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${PREFIX}${path}`;
  console.log(`📡 [VendorProfile] ${options.method || "GET"} ${url}`);

  try {
    const res = await api({
      url,
      method: options.method || "GET",
      data: options.data || undefined,
    });
    console.log(`✅ [VendorProfile] response:`, res.data);
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;
    console.error(`❌ [VendorProfile] ${status || "Network"} error on ${url}:`, message);
    throw new Error(message);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  useProfile  →  GET /api/vendor-profile/profile
// ═════════════════════════════════════════════════════════════════════════════
export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/profile");
      setProfile(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const update = async (body) => {
    await apiFetch("/profile", { method: "PUT", data: body });
    await fetchProfile();
  };

  return { profile, loading, error, refetch: fetchProfile, update };
}

// ═════════════════════════════════════════════════════════════════════════════
//  useDocuments  →  GET /api/vendor-profile/documents
// ═════════════════════════════════════════════════════════════════════════════
export function useDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/documents")
      .then(data => setDocs(Array.isArray(data) ? data : data.documents || []))
      .catch(e => { setError(e.message); setDocs([]); })
      .finally(() => setLoading(false));
  }, []);

  return { docs, loading, error };
}

// ═════════════════════════════════════════════════════════════════════════════
//  useSubscribers  →  GET /api/vendor-profile/subscribers
// ═════════════════════════════════════════════════════════════════════════════
export function useSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/subscribers")
      .then(data => {
        const list = Array.isArray(data) ? data : data.subscribers || [];
        setSubscribers(list);
        setTotal(data.total ?? list.length);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { subscribers, total, loading, error };
}

// ═════════════════════════════════════════════════════════════════════════════
//  usePayouts  →  GET /api/vendor-profile/payouts
// ═════════════════════════════════════════════════════════════════════════════
export function usePayouts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/payouts")
      .then(setData)
      .catch(e => {
        setError(e.message);
        setData({ availableBalance: 0, thisMonth: 0, payoutHistory: [], bankDetails: null });
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// ═════════════════════════════════════════════════════════════════════════════
//  useComplaints  →  GET /api/vendor-profile/complaints
// ═════════════════════════════════════════════════════════════════════════════
export function useComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/complaints")
      .then(data => {
        const list = Array.isArray(data) ? data : data.complaints || [];
        setComplaints(list);
        setTotal(data.total ?? list.length);
      })
      .catch(e => { setError(e.message); setComplaints([]); })
      .finally(() => setLoading(false));
  }, []);

  return { complaints, total, loading, error };
}

// ═════════════════════════════════════════════════════════════════════════════
//  toggleHoliday  →  POST /api/vendor-profile/holiday
// ═════════════════════════════════════════════════════════════════════════════
export async function toggleHoliday() {
  return apiFetch("/holiday", { method: "POST" });
}