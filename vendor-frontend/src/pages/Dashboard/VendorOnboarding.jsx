import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorOnboarding.css";

const API = "http://localhost:5000/api/onboarding";

const STEP_LABELS = ["Basic Info", "Service Area", "Commission", "Food Type", "Legal Docs", "Bank"];

// ─── Helpers ──────────────────────────────────────────────────
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// ─── Persist current step in localStorage ─────────────────────
const saveStep = (step) => localStorage.setItem("ob_step", String(step));
const loadStep = () => parseInt(localStorage.getItem("ob_step") || "1", 10);
const clearStep = () => localStorage.removeItem("ob_step");

const UploadBox = ({ label, name, accept = "image/*,.pdf", onFile, fileName }) => (
  <div className={`ob-upload-box ${fileName ? "filled" : ""}`}>
    <span className="ob-upload-label">{fileName || label}</span>
    <button type="button" className="ob-upload-btn">Upload file</button>
    <input
      type="file"
      name={name}
      accept={accept}
      className="ob-upload-input"
      onChange={(e) => onFile(e.target.files[0])}
    />
  </div>
);

// ─── Progress ─────────────────────────────────────────────────
const Progress = ({ current }) => (
  <div className="ob-progress-wrap">
    <div className="ob-steps-row">
      {STEP_LABELS.map((_, i) => (
        <span key={i} style={{ display: "contents" }}>
          <div className={`ob-step-dot ${i + 1 === current ? "active" : i + 1 < current ? "done" : ""}`}>
            {i + 1 < current ? "✓" : i + 1}
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`ob-step-line ${i + 1 < current ? "done" : ""}`} />
          )}
        </span>
      ))}
    </div>
    <div className="ob-step-labels">
      {STEP_LABELS.map((label, i) => (
        <span key={i} className={`ob-step-label ${i + 1 === current ? "active" : ""}`}>
          {label}
        </span>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
// STEP 1 — Mess Basic Details
// ═══════════════════════════════════════════════════════
const Step1 = ({ onNext, saved }) => {
  const [form, setForm] = useState({
    mess_name: saved?.mess_name || "",
    owner_name: saved?.owner_name || "",
    mobile: saved?.mobile || "",
    experience: saved?.experience || "",
    description: saved?.description || "",
  });
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.mess_name || !form.mobile)
      return setMsg({ text: "Mess name and mobile are required", type: "error" });

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (profileImg) fd.append("profile_image", profileImg);

      const res = await fetch(`${API}/step/1`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return setMsg({ text: data.message, type: "error" });
      onNext(form);
    } catch {
      setMsg({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ob-card" onSubmit={submit}>
      <h2 className="ob-card-title">Mess Basic Details</h2>
      <p className="ob-card-subtitle">Tell us about your tiffin service</p>
      {msg.text && <p className={`ob-msg ${msg.type}`}>{msg.text}</p>}

      <label className="ob-label">Mess / Kitchen Name *</label>
      <input name="mess_name" className="ob-input" placeholder="e.g. Sharma Tiffin Service" value={form.mess_name} onChange={h} required />

      <label className="ob-label">Owner / Manager Name</label>
      <input name="owner_name" className="ob-input" placeholder="Full name" value={form.owner_name} onChange={h} />

      <div className="ob-row">
        <div>
          <label className="ob-label">Email ID *</label>
          <input name="email" type="email" className="ob-input" placeholder="email@example.com" disabled
            style={{ opacity: 0.5 }} value={localStorage.getItem("userEmail") || ""} />
        </div>
        <div>
          <label className="ob-label">Mobile Number *</label>
          <input name="mobile" className="ob-input" placeholder="+91 XXXXXXXXXX" value={form.mobile} onChange={h} required />
        </div>
      </div>

      <label className="ob-label">Years of Experience (optional)</label>
      <input name="experience" type="number" min="0" className="ob-input" placeholder="e.g. 3" value={form.experience} onChange={h} />

      <label className="ob-label">Mess Description *</label>
      <textarea name="description" className="ob-input" placeholder="Describe your service (menu style, specialty...)" value={form.description} onChange={h} />

      <label className="ob-label">Profile Image / Logo</label>
      <UploadBox
        label="Profile Image / Logo"
        name="profile_image"
        accept="image/jpeg,image/png,image/jpg"
        onFile={setProfileImg}
        fileName={profileImg?.name || (saved?.profile_image ? "Existing image" : null)}
      />

      <button type="submit" className="ob-btn" disabled={loading}>
        {loading ? "Saving..." : "NEXT"}
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════
// STEP 2 — Service Area
// ═══════════════════════════════════════════════════════
const Step2 = ({ onNext, onBack, saved }) => {
  const [form, setForm] = useState({
    address: saved?.address || "",
    city: saved?.city || "",
    state: saved?.state || "",
    zip: saved?.zip || "",
    town: saved?.town || "",
    latitude: saved?.latitude || "",
    longitude: saved?.longitude || "",
    service_radius: saved?.service_radius || "2",
    area_doc_type: "electricity_bill",
  });
  const [areaDoc, setAreaDoc] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const detectLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const d = await r.json();
          setForm(f => ({
            ...f,
            latitude, longitude,
            address: d.display_name || "",
            city: d.address?.city || d.address?.town || "",
            state: d.address?.state || "",
            zip: d.address?.postcode || "",
          }));
        } catch {
          setForm(f => ({ ...f, latitude, longitude }));
        }
        setLocLoading(false);
      },
      () => {
        setMsg({ text: "Could not get location. Enter manually.", type: "error" });
        setLocLoading(false);
      }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.town || !form.latitude || !form.longitude)
      return setMsg({ text: "Town and location (GPS) are required", type: "error" });

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (areaDoc) fd.append("area_document", areaDoc);
      if (ownerId) fd.append("owner_id", ownerId);

      const res = await fetch(`${API}/step/2`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return setMsg({ text: data.message, type: "error" });
      onNext(form);
    } catch {
      setMsg({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ob-card" onSubmit={submit}>
      <h2 className="ob-card-title">Service Area</h2>
      <p className="ob-card-subtitle">Select your delivery town and upload address proof</p>
      {msg.text && <p className={`ob-msg ${msg.type}`}>{msg.text}</p>}

      <label className="ob-label">Your Location</label>
      <div className="ob-location-row">
        <span>{form.latitude ? `${form.city || "Location detected"} — ${Number(form.latitude).toFixed(4)}, ${Number(form.longitude).toFixed(4)}` : "Tap 📍 to auto-detect"}</span>
        <button type="button" className="ob-loc-btn" onClick={detectLocation} title="Detect location">
          {locLoading ? "⏳" : "📍"}
        </button>
      </div>

      <label className="ob-label">Full Address</label>
      <input name="address" className="ob-input" placeholder="Street address" value={form.address} onChange={h} />

      <div className="ob-row">
        <div>
          <label className="ob-label">City</label>
          <input name="city" className="ob-input" placeholder="City" value={form.city} onChange={h} />
        </div>
        <div>
          <label className="ob-label">State</label>
          <input name="state" className="ob-input" placeholder="State" value={form.state} onChange={h} />
        </div>
      </div>

      <div className="ob-row">
        <div>
          <label className="ob-label">ZIP Code</label>
          <input name="zip" className="ob-input" placeholder="ZIP" value={form.zip} onChange={h} />
        </div>
        <div>
          <label className="ob-label">Service Radius (km)</label>
          <select name="service_radius" className="ob-select" value={form.service_radius} onChange={h}>
            <option value="1">1 km</option>
            <option value="2">2 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
          </select>
        </div>
      </div>

      <label className="ob-label">Delivery Town *</label>
      <input name="town" className="ob-input" placeholder="e.g. Hinjewadi, Pune" value={form.town} onChange={h} required />

      <label className="ob-label">Documents Required (Any One)</label>
      <div className="ob-radio-group" style={{ marginBottom: 10 }}>
        {["electricity_bill", "rent_agreement", "shop_act_certificate"].map((t) => (
          <label key={t} className="ob-radio-item">
            <input type="radio" name="area_doc_type" value={t} checked={form.area_doc_type === t} onChange={h} />
            {t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </label>
        ))}
      </div>

      <UploadBox label="Upload Document" name="area_document" onFile={setAreaDoc} fileName={areaDoc?.name} />

      <label className="ob-label" style={{ marginTop: 14 }}>Owner ID Proof (Aadhaar / PAN)</label>
      <UploadBox label="Owner ID Proof" name="owner_id" onFile={setOwnerId} fileName={ownerId?.name} />

      <button type="submit" className="ob-btn" disabled={loading}>
        {loading ? "Saving..." : "CONTINUE"}
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════
// STEP 3 — Commission Plan
// ═══════════════════════════════════════════════════════
const Step3 = ({ onNext, saved }) => {
  const [selected, setSelected] = useState(saved?.plan_type || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const plans = [
    {
      key: "fixed",
      icon: "🧾",
      name: "Fixed Fee Plan",
      price: "₹10 / order",
      features: ["Same fee every order", "Easy calculation", "No surprises"],
    },
    {
      key: "percentage",
      icon: "📊",
      name: "Percentage Plan",
      price: "10% per order",
      features: ["Pay as you earn", "Scales with business", "Flexible pricing"],
    },
  ];

  const choosePlan = async (key) => {
    setSelected(key);
    setLoading(true);
    try {
      const res = await fetch(`${API}/step/3`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: key }),
      });
      const data = await res.json();
      if (!res.ok) return setMsg({ text: data.message, type: "error" });
      onNext({ plan_type: key });
    } catch {
      setMsg({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ob-card">
      <h2 className="ob-card-title">Choose Your Commission Plan</h2>
      <p className="ob-card-subtitle">Select how you want to pay platform fees</p>
      {msg.text && <p className={`ob-msg ${msg.type}`}>{msg.text}</p>}
      <div className="ob-plan-cards">
        {plans.map((p) => (
          <div key={p.key} className={`ob-plan-card ${selected === p.key ? "selected" : ""}`}>
            <div className="ob-plan-header">
              <div className="ob-plan-icon">{p.icon}</div>
              <div className="ob-plan-name">{p.name}</div>
            </div>
            <div className="ob-plan-price">{p.price}</div>
            <div className="ob-plan-features">
              {p.features.map((f) => <div key={f} className="ob-plan-feat">{f}</div>)}
            </div>
            <button className="ob-plan-select-btn" onClick={() => choosePlan(p.key)} disabled={loading}>
              {loading && selected === p.key ? "Saving..." : `Select ${p.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// STEP 4 — Food Type & Cuisine
// ═══════════════════════════════════════════════════════
const Step4 = ({ onNext, saved }) => {
  const FOOD_TYPES = ["Pure Veg", "Jain Food", "Satvik", "Special Diet (Diabetic / Low Oil / High Protein)"];
  const [foodType, setFoodType] = useState(saved?.food_type ? JSON.parse(saved.food_type) : []);
  const [form, setForm] = useState({
    cuisine_type: saved?.cuisine_type || "",
    uses_onion_garlic: saved?.uses_onion_garlic != null ? (saved.uses_onion_garlic ? "yes" : "no") : "",
    operating_days: saved?.operating_days || "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleFood = (ft) => setFoodType(prev =>
    prev.includes(ft) ? prev.filter(f => f !== ft) : [...prev, ft]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (foodType.length === 0)
      return setMsg({ text: "Select at least one food type", type: "error" });
    setLoading(true);
    try {
      const res = await fetch(`${API}/step/4`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ food_type: foodType, ...form }),
      });
      const data = await res.json();
      if (!res.ok) return setMsg({ text: data.message, type: "error" });
      onNext({ food_type: JSON.stringify(foodType), ...form });
    } catch {
      setMsg({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ob-card" onSubmit={submit}>
      <h2 className="ob-card-title">Food Type & Cuisine</h2>
      <p className="ob-card-subtitle">Help customers find the right meal for them</p>
      {msg.text && <p className={`ob-msg ${msg.type}`}>{msg.text}</p>}
      <label className="ob-label">Food Type (Multi-select) *</label>
      <div className="ob-check-group">
        {FOOD_TYPES.map((ft) => (
          <label key={ft} className="ob-check-item">
            <input type="checkbox" checked={foodType.includes(ft)} onChange={() => toggleFood(ft)} />
            {ft}
          </label>
        ))}
      </div>
      <label className="ob-label">Cuisine Type</label>
      <select name="cuisine_type" className="ob-select" value={form.cuisine_type} onChange={h}>
        <option value="">Select cuisine...</option>
        <option>North Indian</option><option>South Indian</option>
        <option>Gujarati</option><option>Punjabi</option>
        <option>Bengali</option><option>Maharashtrian</option>
        <option>Multi-Cuisine</option>
      </select>
      <label className="ob-label">Uses Onion &amp; Garlic?</label>
      <select name="uses_onion_garlic" className="ob-select" value={form.uses_onion_garlic} onChange={h}>
        <option value="">Select...</option>
        <option value="yes">Yes</option>
        <option value="no">No (Jain / Satvik)</option>
      </select>
      <label className="ob-label">Operating Days</label>
      <select name="operating_days" className="ob-select" value={form.operating_days} onChange={h}>
        <option value="">Select...</option>
        <option value="Mon-Sat">Monday to Saturday</option>
        <option value="Mon-Sun">Monday to Sunday (All days)</option>
        <option value="Weekdays">Weekdays only</option>
        <option value="Weekends">Weekends only</option>
      </select>
      <button type="submit" className="ob-btn" disabled={loading}>
        {loading ? "Saving..." : "NEXT"}
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════
// STEP 5 — FSSAI & Legal Docs
// ═══════════════════════════════════════════════════════
const Step5 = ({ onNext, saved }) => {
  const [form, setForm] = useState({
    fssai_number: saved?.fssai_number || "",
    fssai_date: saved?.fssai_date || "",
    fssai_validity: saved?.fssai_validity || "",
  });
  const [files, setFiles] = useState({ fssai_certificate: null, gst_certificate: null, shop_act_license: null });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setFile = (key, file) => setFiles(f => ({ ...f, [key]: file }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fssai_number) return setMsg({ text: "FSSAI registration number is required", type: "error" });
    if (!files.fssai_certificate) return setMsg({ text: "FSSAI certificate is required", type: "error" });
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const res = await fetch(`${API}/step/5`, { method: "POST", headers: authHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) return setMsg({ text: data.message, type: "error" });
      onNext(form);
    } catch {
      setMsg({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ob-card" onSubmit={submit}>
      <h2 className="ob-card-title">FSSAI &amp; Legal Documents</h2>
      <p className="ob-card-subtitle">Required for food safety compliance</p>
      {msg.text && <p className={`ob-msg ${msg.type}`}>{msg.text}</p>}
      <label className="ob-label">FSSAI Registration Number *</label>
      <input name="fssai_number" className="ob-input" placeholder="14-digit FSSAI number" value={form.fssai_number} onChange={h} required />
      <div className="ob-row">
        <div>
          <label className="ob-label">Certificate Date</label>
          <input name="fssai_date" type="date" className="ob-input" value={form.fssai_date} onChange={h} />
        </div>
        <div>
          <label className="ob-label">Valid Until</label>
          <input name="fssai_validity" type="date" className="ob-input" value={form.fssai_validity} onChange={h} />
        </div>
      </div>
      <label className="ob-label">Documents Required</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <UploadBox label="FSSAI Certificate *" name="fssai_certificate" onFile={(f) => setFile("fssai_certificate", f)} fileName={files.fssai_certificate?.name} />
        <UploadBox label="GST Certificate (if applicable)" name="gst_certificate" onFile={(f) => setFile("gst_certificate", f)} fileName={files.gst_certificate?.name} />
        <UploadBox label="Shop Act License (optional)" name="shop_act_license" onFile={(f) => setFile("shop_act_license", f)} fileName={files.shop_act_license?.name} />
      </div>
      <button type="submit" className="ob-btn" disabled={loading}>
        {loading ? "Saving..." : "NEXT"}
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════
// STEP 6 — Bank Details
// ═══════════════════════════════════════════════════════
const Step6 = ({ onNext, saved }) => {
  const [form, setForm] = useState({
    account_holder_name: saved?.account_holder_name || "",
    bank_name: saved?.bank_name || "",
    account_number: saved?.account_number || "",
    ifsc_code: saved?.ifsc_code || "",
    branch_name: saved?.branch_name || "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const required = ["account_holder_name", "bank_name", "account_number", "ifsc_code"];
    if (required.some(k => !form[k]))
      return setMsg({ text: "All fields except branch name are required", type: "error" });
    setLoading(true);
    try {
      const res = await fetch(`${API}/step/6`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setMsg({ text: data.message, type: "error" });
      onNext(form);
    } catch {
      setMsg({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ob-card" onSubmit={submit}>
      <h2 className="ob-card-title">Bank Details Setup</h2>
      <p className="ob-card-subtitle">For receiving your payments securely</p>
      {msg.text && <p className={`ob-msg ${msg.type}`}>{msg.text}</p>}
      <label className="ob-label">Account Holder Name *</label>
      <input name="account_holder_name" className="ob-input" placeholder="As per bank records" value={form.account_holder_name} onChange={h} required />
      <label className="ob-label">Bank Name *</label>
      <input name="bank_name" className="ob-input" placeholder="e.g. State Bank of India" value={form.bank_name} onChange={h} required />
      <label className="ob-label">Account Number *</label>
      <input name="account_number" className="ob-input" placeholder="Account number" value={form.account_number} onChange={h} required />
      <div className="ob-row">
        <div>
          <label className="ob-label">IFSC Code *</label>
          <input name="ifsc_code" className="ob-input" placeholder="SBIN0001234" value={form.ifsc_code} onChange={h} required />
        </div>
        <div>
          <label className="ob-label">Branch Name</label>
          <input name="branch_name" className="ob-input" placeholder="Branch" value={form.branch_name} onChange={h} />
        </div>
      </div>
      <button type="submit" className="ob-btn" disabled={loading}>
        {loading ? "Submitting..." : "DONE — SUBMIT FOR REVIEW"}
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════
// PENDING SCREEN — matches middle design image
// ═══════════════════════════════════════════════════════
const PendingScreen = ({ vendorName }) => {
  const navigate = useNavigate();

  const steps = [
    { label: "Submit", num: 1, state: "done" },
    { label: "Pending", num: 2, state: "active" },
    { label: "Approved", num: 3, state: "upcoming" },
  ];

  return (
    <div className="ob-status-page">
      {/* Header */}
      <div className="ob-status-header">
        <div className="ob-status-avatar">
          {vendorName ? vendorName.charAt(0).toUpperCase() : "V"}
        </div>
        <div>
          <h2 className="ob-status-name">Hi, {vendorName || "Vendor"} 👋</h2>
          <p className="ob-status-welcome">Welcome back</p>
        </div>
        <div className="ob-status-bell">🔔</div>
      </div>

      {/* Timeline */}
      <div className="ob-timeline-wrap">
        {steps.map((s, i) => (
          <div key={s.num} className="ob-timeline-item">
            {/* Left label for odd (Submit), right label for even */}
            <div className={`ob-tl-label ${i % 2 === 0 ? "left" : "right"}`}>
              {s.label}
            </div>

            {/* Line above (not for first) */}
            {i > 0 && (
              <div className={`ob-tl-line ${s.state === "done" ? "done" : s.state === "active" ? "active-line" : ""}`} />
            )}

            {/* Circle */}
            <div className={`ob-tl-circle ${s.state}`}>
              {s.state === "done" ? "✓" : s.num}
            </div>

            {/* Line below (not for last) */}
            {i < steps.length - 1 && (
              <div className={`ob-tl-line ${s.state === "done" ? "done" : ""}`} />
            )}
          </div>
        ))}
      </div>

      <button className="ob-btn" style={{ marginTop: 32 }} onClick={() => navigate("/vendor/pending")}>
        DONE
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// REJECTED SCREEN — matches left design image
// ═══════════════════════════════════════════════════════
const RejectedScreen = ({ reason, onReapply }) => (
  <div className="ob-status-page ob-rejected-page">
    <div className="ob-rejected-icon-wrap">
      <div className="ob-rejected-icon">✕</div>
    </div>
    <h2 className="ob-rejected-title">Account Not Approved</h2>
    <p className="ob-rejected-reason">
      {reason || "Required documents were missing or not uploaded correctly."}
    </p>
    <button className="ob-btn" onClick={onReapply}>
      Update Details &amp; Reapply
    </button>
    <button className="ob-btn-outline" style={{ marginTop: 12 }}>
      Contact Support
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════
// ROOT — VendorOnboarding
// ═══════════════════════════════════════════════════════
export default function VendorOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState(null);
  const [savedData, setSavedData] = useState({});
  const [rejectionReason, setRejectionReason] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [initLoading, setInitLoading] = useState(true);

  // ── On mount: fetch status from server (source of truth) ─
  useEffect(() => {
  const token = localStorage.getItem("accessToken");
  if (!token) { navigate("/login"); return; }

  fetch(`${API}/status`, { headers: authHeaders() })
    .then(async (r) => {
      // ✅ FIX 1: Handle expired/invalid token explicitly
      if (r.status === 401) {
        localStorage.removeItem("accessToken");
        clearStep();
        navigate("/login?reason=session_expired", { replace: true });
        return;
      }

      const data = await r.json();
      const serverStatus = data.status;

      if (serverStatus === "approved") {
        clearStep();
        navigate("/vendor/dashboard", { replace: true });
        return;
      }

      if (serverStatus === "pending") {
        clearStep();
        setStatus("pending");
        setVendorName(data.profile?.owner_name || data.profile?.mess_name || "");
        setSavedData({ ...(data.profile || {}), ...(data.bankDetails || {}), ...(data.commissionPlan || {}) });

      } else if (serverStatus === "rejected") {
        clearStep();
        setStatus("rejected");
        setRejectionReason(data.rejectionReason || "Please review and resubmit.");
        setSavedData({ ...(data.profile || {}), ...(data.bankDetails || {}), ...(data.commissionPlan || {}) });

      } else {
        const savedStep = loadStep();
        setStep(savedStep);
        setSavedData({ ...(data.profile || {}), ...(data.bankDetails || {}) });
        setStatus(null);
      }

      setInitLoading(false);
    })
    .catch(() => {
      // ✅ FIX 2: Network error — restore step but warn user
      const savedStep = loadStep();
      setStep(savedStep);
      setStatus("network_error");  // shows offline banner
      setInitLoading(false);
    });
}, []);

  const handleNext = (stepData) => {
    setSavedData(prev => ({ ...prev, ...stepData }));
    if (step < 6) {
      const nextStep = step + 1;
      setStep(nextStep);
      saveStep(nextStep); // ✅ Persist step to localStorage
    } else {
      // Step 6 submitted — show pending
      clearStep();
      setStatus("pending");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      saveStep(prevStep);
    }
  };

  const handleReapply = () => {
    // Vendor wants to re-edit after rejection — go back to form step 1
    setStatus("reapplying");
    setStep(1);
    saveStep(1);
  };

  const stepTitles = [
    "Mess Basic Details", "Service Area", "Commission Plan",
    "Food Type", "FSSAI & Legal Docs", "Bank Details Setup",
  ];

  // ── Loading ──────────────────────────────────────────────
  if (initLoading) return (
    <div className="ob-page" style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", color: "#6b7280" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <p>Loading your profile...</p>
      </div>
    </div>
  );

  // ── Pending screen ───────────────────────────────────────
  if (status === "pending") return (
    <div className="ob-page">
      <PendingScreen vendorName={vendorName} />
    </div>
  );

  // ── Rejected screen (shown first before re-editing) ──────
  if (status === "rejected") return (
    <div className="ob-page">
      <RejectedScreen reason={rejectionReason} onReapply={handleReapply} />
    </div>
  );

  // ── Form steps (not_started OR reapplying after rejection) ─
  return (
    <div className="ob-page">
      {/* Header */}
      <div className="ob-header">
        {step > 1 && (
          <button className="ob-back-btn" onClick={handleBack} aria-label="Back">‹</button>
        )}
        <span className="ob-header-title">{stepTitles[step - 1]}</span>
      </div>

      {/* Rejection banner shown on first step when reapplying */}
      {status === "reapplying" && step === 1 && (
        <div className="ob-rejection-banner" style={{ width: "100%", maxWidth: 520 }}>
          <span className="ob-rejection-icon">⚠️</span>
          <div>
            <div className="ob-rejection-title">Application Rejected — Please Update</div>
            <div className="ob-rejection-reason">{rejectionReason}</div>
          </div>
        </div>
      )}
{status === "network_error" && (
  <div className="ob-rejection-banner" style={{ width: "100%", maxWidth: 520 }}>
    <span className="ob-rejection-icon">⚠️</span>
    <div>
      <div className="ob-rejection-title">You're offline or session failed</div>
      <div className="ob-rejection-reason">
        Could not verify your session. Check your connection before submitting.
      </div>
    </div>
  </div>
)}
      {/* Progress */}
      <Progress current={step} />

      {/* Steps */}
      {step === 1 && <Step1 onNext={handleNext} saved={savedData} />}
      {step === 2 && <Step2 onNext={handleNext} onBack={handleBack} saved={savedData} />}
      {step === 3 && <Step3 onNext={handleNext} onBack={handleBack} saved={savedData} />}
      {step === 4 && <Step4 onNext={handleNext} onBack={handleBack} saved={savedData} />}
      {step === 5 && <Step5 onNext={handleNext} onBack={handleBack} saved={savedData} />}
      {step === 6 && <Step6 onNext={handleNext} onBack={handleBack} saved={savedData} />}
    </div>
  );
}
