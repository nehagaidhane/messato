import { useState, useRef } from "react";
import "./VendorOnboarding.css";

const STEPS = [
  "Mess Basic Details",
  "Service Area",
  "Commission Plan",
  "Food Type",
  "FSSAI & Legal",
  "Bank Details",
];

/* ─── Step Indicator ─────────────────────────────── */
function StepIndicator({ step }) {
  return (
    <div className="step-container">
      {[1, 2, 3, 4, 5, 6].map((s, i) => (
        <div key={s} className="step-wrapper">
          <div className={`step-circle ${step >= s ? "active" : ""}`}>{s}</div>
          {i < 5 && <div className={`step-line ${step > s ? "active" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

/* ─── Shared Shell ───────────────────────────────── */
function StepShell({ step, children, onBack }) {
  return (
    <div className="vo-page">
      {/* Sidebar */}
      <aside className="vo-sidebar">
        <div className="vo-sidebar-logo">
          <div className="vo-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M7 8h10M7 12h10M7 16h6" />
            </svg>
          </div>
          <span className="vo-logo-text">MESSATO</span>
        </div>
        <p className="vo-sidebar-sub">Vendor Registration Portal</p>

        <nav className="vo-sidebar-nav">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const cls = n === step ? "active" : n < step ? "done" : "";
            return (
              <div key={i} className={`vo-nav-item ${cls}`}>
                <span className="vo-nav-num">
                  {n < step ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : n}
                </span>
                <span className="vo-nav-label">{s}</span>
              </div>
            );
          })}
        </nav>

        <div className="vo-sidebar-footer">
          <div className="vo-prog-label">Step {step} of {STEPS.length}</div>
          <div className="vo-prog-bar">
            <div className="vo-prog-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="vo-main">
        <div className="vo-deco-circle vo-deco-1" />
        <div className="vo-deco-circle vo-deco-2" />
        <div className="vo-content-wrap">
          {children}
        </div>
      </main>
    </div>
  );
}

/* ─── Step 1: Basic Details ──────────────────────── */
function Step1({ data, onChange, onNext }) {
  return (
    <StepShell step={1}>
      <h1 className="vo-page-title">Mess basic details</h1>
      <div className="vo-dark-card">
        <div className="vo-card-inner">
          <div className="two-col">
            <div className="vo-field-group">
              <label className="vo-label">Mess / kitchen name *</label>
              <input className="vo-input" placeholder="Enter kitchen name" value={data.messName} onChange={e => onChange("messName", e.target.value)} />
            </div>
            <div className="vo-field-group">
              <label className="vo-label">Owner / manager name</label>
              <input className="vo-input" placeholder="Enter name" value={data.ownerName} onChange={e => onChange("ownerName", e.target.value)} />
            </div>
          </div>
          <div className="two-col">
            <div className="vo-field-group">
              <label className="vo-label">Email id *</label>
              <input className="vo-input" type="email" placeholder="Enter email" value={data.email} onChange={e => onChange("email", e.target.value)} />
            </div>
            <div className="vo-field-group">
              <label className="vo-label">Mobile number *</label>
              <input className="vo-input" type="tel" placeholder="+91 98765 43210" value={data.mobile} onChange={e => onChange("mobile", e.target.value)} />
            </div>
          </div>
          <div className="vo-field-group">
            <label className="vo-label">Mess description (short) *</label>
            <textarea className="vo-input vo-textarea" placeholder="Describe your mess in a few words..." value={data.description} onChange={e => onChange("description", e.target.value)} />
          </div>
          <div className="vo-field-group">
            <label className="vo-label">Profile image / logo</label>
            <div className="vo-upload-row">
              <span className="vo-upload-hint">
                {data.profileImage ? `✔ ${data.profileImage.name}` : "Click to upload image"}
              </span>
              <label className="vo-upload-btn">
                Upload file
                <input type="file" accept="image/*" hidden onChange={e => onChange("profileImage", e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>
        <div className="vo-card-footer">
          <StepIndicator step={1} />
          <button className="vo-btn-primary" onClick={onNext}>Next →</button>
        </div>
      </div>
    </StepShell>
  );
}

/* ─── Step 2: Service Area ───────────────────────── */
function Step2({ data, onChange, onNext, onBack }) {
  const getLiveLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const d = await r.json();
          const a = d.address;
          onChange("location", `${a.suburb || a.city || ""}, ${a.state || ""}`);
        } catch { alert("Failed to get location"); }
      },
      () => alert("Please allow location access")
    );
  };

  return (
    <StepShell step={2} onBack={onBack}>
      <h1 className="vo-page-title">Service area</h1>
      <div className="vo-dark-card">
        <div className="vo-card-inner">
          <div className="vo-center-heading">
            <h2 className="vo-sub-title">Select your delivery town</h2>
            <p className="vo-sub-desc">Find nearby mess & home kitchen within 1–2 km</p>
          </div>

          <div className="vo-location-box">
            <span className="vo-location-text">{data.location || "Click to detect your location"}</span>
            <div className="vo-location-icons">
              <svg onClick={getLiveLocation} style={{ cursor: "pointer" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </div>

          <input
            list="towns"
            className="vo-input"
            placeholder="Choose Town"
            value={data.town}
            onChange={e => onChange("town", e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <datalist id="towns">
            <option value="Hinjewadi" />
            <option value="Baner" />
            <option value="Aundh" />
            <option value="Kothrud" />
            <option value="Aurangabad" />
            <option value="Pune" />
            <option value="Mumbai" />
            <option value="Nashik" />
          </datalist>

          <div className="vo-select-box" style={{ marginTop: 4 }}>
            <select className="vo-select" value={data.radius} onChange={e => onChange("radius", e.target.value)}>
              <option value="">Service Radius</option>
              <option value="1">1 km</option>
              <option value="2">2 km</option>
              <option value="5">5 km</option>
            </select>
            <svg className="vo-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>

          <div className="vo-section-label" style={{ marginTop: 14 }}>Documents required (any one)</div>
          <div className="vo-radio-group">
            {["Electricity Bill", "Rent Agreement", "Shop Act Certificate"].map(doc => (
              <label key={doc} className="vo-radio-label">
                <input type="radio" name="docType" value={doc} checked={data.docType === doc} onChange={() => onChange("docType", doc)} />
                <span>{doc}</span>
              </label>
            ))}
          </div>

          <div className="vo-upload-row">
            <span className="vo-upload-hint">
              {data.document ? `✔ ${data.document.name}` : "Upload document"}
            </span>
            <label className="vo-upload-btn">
              Upload file
              <input type="file" hidden onChange={e => onChange("document", e.target.files[0])} />
            </label>
          </div>
        </div>
        <div className="vo-card-footer">
          <StepIndicator step={2} />
          <button className="vo-btn-primary" onClick={onNext}>Continue</button>
        </div>
      </div>
    </StepShell>
  );
}

/* ─── Step 3: Commission Plan ────────────────────── */
function Step3({ data, onChange, onNext, onBack }) {
  const plans = [
    {
      id: "fixed",
      name: "Fixed Fee Plan",
      sub: "Pay a fixed amount per order",
      price: "₹10 / order",
      feats: ["Same fee every order", "Easy calculation", "No surprises"],
      btnLabel: "Select Fixed Fee Plan",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      ),
    },
    {
      id: "percent",
      name: "Percentage Plan",
      sub: "Pay a percentage on each order",
      price: "10% per order",
      feats: ["Pay as you earn", "Scales with business", "Flexible pricing"],
      btnLabel: "Select Percent Fee Plan",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ];

  return (
    <StepShell step={3} onBack={onBack}>
      <h1 className="vo-page-title">Commission plan</h1>
      <div className="vo-dark-card">
        <div className="vo-card-inner">
          <div className="vo-center-heading">
            <h2 className="vo-sub-title">Choose your commission plan</h2>
            <p className="vo-sub-desc">Select how you want to pay platform fees</p>
          </div>
          {plans.map((p, idx) => (
            <div
              key={p.id}
              className={`vo-plan-card ${data.plan === p.id ? "vo-plan-selected" : ""}`}
              style={{ marginTop: idx === 0 ? 4 : 12 }}
              onClick={() => onChange("plan", p.id)}
            >
              <div className="vo-plan-icon">{p.icon}</div>
              <h3 className="vo-plan-name">{p.name}</h3>
              <p className="vo-plan-sub">{p.sub}</p>
              <span className="vo-plan-price">{p.price}</span>
              <ul className="vo-plan-feats">
                {p.feats.map(f => <li key={f}><span className="vo-feat-check">✓</span>{f}</li>)}
              </ul>
              <button
                className={`vo-plan-btn ${data.plan === p.id ? "vo-plan-btn-active" : ""}`}
                onClick={e => { e.stopPropagation(); onChange("plan", p.id); }}
              >
                {p.btnLabel}
              </button>
            </div>
          ))}
        </div>
        <div className="vo-card-footer">
          <StepIndicator step={3} />
          <button className="vo-btn-primary" onClick={onNext}>Continue</button>
        </div>
      </div>
    </StepShell>
  );
}

/* ─── Step 4: Food Type ──────────────────────────── */
function Step4({ data, onChange, onNext, onBack }) {
  const foods = [
    "Pure Veg",
    "Jain Food",
    "Satvik",
    "Special Diet (Diabetic / Low Oil / High Protein)",
  ];

  const toggle = t => {
    const cur = data.foodTypes || [];
    onChange("foodTypes", cur.includes(t) ? cur.filter(f => f !== t) : [...cur, t]);
  };

  return (
    <StepShell step={4} onBack={onBack}>
      <h1 className="vo-page-title">Food type</h1>
      <div className="vo-dark-card">
        <div className="vo-card-inner">
          <div className="vo-field-group">
            <label className="vo-label">Food type (multi-select)</label>
            <div className="vo-checkbox-box">
              {foods.map(f => (
                <label key={f} className="vo-check-label">
                  <input type="checkbox" checked={(data.foodTypes || []).includes(f)} onChange={() => toggle(f)} />
                  <span>{f.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="vo-select-box" style={{ marginTop: 14 }}>
            <select className="vo-select" value={data.cuisineType} onChange={e => onChange("cuisineType", e.target.value)}>
              <option value="">Cuisine Type</option>
              <option>North Indian</option>
              <option>South Indian</option>
              <option>Maharashtrian</option>
              <option>Gujarati</option>
            </select>
            <svg className="vo-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>

          <div className="vo-select-box" style={{ marginTop: 10 }}>
            <select className="vo-select" value={data.onionGarlic} onChange={e => onChange("onionGarlic", e.target.value)}>
              <option value="">Uses Onion & Garlic?</option>
              <option>Yes</option>
              <option>No</option>
            </select>
            <svg className="vo-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>

          <div className="vo-select-box" style={{ marginTop: 10 }}>
            <select className="vo-select" value={data.operatingDays} onChange={e => onChange("operatingDays", e.target.value)}>
              <option value="">Operating Days</option>
              <option>Monday – Friday</option>
              <option>Monday – Saturday</option>
              <option>All Days</option>
            </select>
            <svg className="vo-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </div>
        <div className="vo-card-footer">
          <StepIndicator step={4} />
          <button className="vo-btn-primary" onClick={onNext}>Next →</button>
        </div>
      </div>
    </StepShell>
  );
}

/* ─── Step 5: FSSAI & Legal ──────────────────────── */
function Step5({ data, onChange, onNext, onBack }) {
  return (
    <StepShell step={5} onBack={onBack}>
      <h1 className="vo-page-title">FSSAI & legal documents</h1>
      <div className="vo-dark-card">
        <div className="vo-card-inner">
          <div className="vo-field-group">
            <label className="vo-label">FSSAI registration number</label>
            <input className="vo-input" placeholder="Enter registration number" value={data.fssaiNumber} onChange={e => onChange("fssaiNumber", e.target.value)} />
          </div>

          <div className="two-col">
            <div className="vo-field-group">
              <label className="vo-label">Certificate date</label>
              <input className="vo-input" type="date" value={data.fssaiDate} onChange={e => onChange("fssaiDate", e.target.value)} />
            </div>
            <div className="vo-field-group">
              <label className="vo-label">Certificate validity *</label>
              <input className="vo-input" type="date" value={data.fssaiValidity} onChange={e => onChange("fssaiValidity", e.target.value)} />
            </div>
          </div>

          <div className="vo-section-label" style={{ marginTop: 14 }}>Upload documents</div>

          {[
            { key: "fssaiCert", label: "FSSAI Certificate", required: true },
            { key: "gstCert", label: "GST Certificate (if applicable)", required: false },
            { key: "shopAct", label: "Shop Act License (optional)", required: false },
          ].map(({ key, label, required }) => (
            <div className="vo-upload-row" key={key}>
              <span className="vo-upload-hint">
                {data[key] ? `✔ ${data[key].name}` : <>{label}{required && <span style={{ color: "#E53935" }}> *</span>}</>}
              </span>
              <label className="vo-upload-btn">
                Upload file
                <input type="file" hidden onChange={e => onChange(key, e.target.files[0])} />
              </label>
            </div>
          ))}
        </div>
        <div className="vo-card-footer">
          <StepIndicator step={5} />
          <button className="vo-btn-primary" onClick={onNext}>Next →</button>
        </div>
      </div>
    </StepShell>
  );
}

/* ─── Step 6: Bank Details ───────────────────────── */
function Step6({ data, onChange, onDone, onBack }) {
  return (
    <StepShell step={6} onBack={onBack}>
      <h1 className="vo-page-title">Bank details setup</h1>
      <div className="vo-dark-card">
        <div className="vo-card-inner">
          <div className="vo-field-group">
            <label className="vo-label">Account holder name</label>
            <input className="vo-input" placeholder="Enter account holder name" value={data.accountHolder} onChange={e => onChange("accountHolder", e.target.value)} />
          </div>
          <div className="vo-field-group">
            <label className="vo-label">Bank name</label>
            <input className="vo-input" placeholder="Enter bank name" value={data.bankName} onChange={e => onChange("bankName", e.target.value)} />
          </div>
          <div className="vo-field-group">
            <label className="vo-label">Account number</label>
            <input className="vo-input" placeholder="Enter account number" value={data.accountNumber} onChange={e => onChange("accountNumber", e.target.value)} />
          </div>
          <div className="two-col">
            <div className="vo-field-group">
              <label className="vo-label">IFSC code</label>
              <input className="vo-input" placeholder="IFSC Code" value={data.ifsc} onChange={e => onChange("ifsc", e.target.value)} />
            </div>
            <div className="vo-field-group">
              <label className="vo-label">Branch name</label>
              <input className="vo-input" placeholder="Branch name" value={data.branch} onChange={e => onChange("branch", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="vo-card-footer">
          <StepIndicator step={6} />
          <button className="vo-btn-primary vo-btn-green" onClick={onDone}>Done ✓</button>
        </div>
      </div>
    </StepShell>
  );
}

/* ─── Main Component ─────────────────────────────── */
export default function VendorOnboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    messName: "", ownerName: "", email: "", mobile: "", description: "", profileImage: null,
    location: "", town: "", radius: "", docType: "Electricity Bill", document: null,
    plan: "",
    foodTypes: [], cuisineType: "", onionGarlic: "", operatingDays: "",
    fssaiNumber: "", fssaiDate: "", fssaiValidity: "", fssaiCert: null, gstCert: null, shopAct: null,
    accountHolder: "", bankName: "", accountNumber: "", ifsc: "", branch: "",
  });


  // b bn bn 

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!form.messName || !form.email || !form.mobile || !form.description) {
          alert("All fields are required");
          return false;
        }
        return true;

      case 2:
        if (!form.location || !form.town || !form.radius || !form.document) {
          alert("Please fill all fields & upload document");
          return false;
        }
        return true;

      case 3:
        if (!form.plan) {
          alert("Please select a plan");
          return false;
        }
        return true;

      case 4:
        if (!form.foodTypes.length || !form.cuisineType || !form.operatingDays) {
          alert("Please fill all food details");
          return false;
        }
        return true;

      case 5:
        if (!form.fssaiNumber || !form.fssaiValidity || !form.fssaiCert) {
          alert("FSSAI details required");
          return false;
        }
        return true;

      case 6:
        if (!form.accountHolder || !form.bankName || !form.accountNumber || !form.ifsc) {
          alert("Bank details required");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // mnmnmnm

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const next = () => {
    if (validateStep()) {
      setStep(s => Math.min(s + 1, 6));
    }
  };
  const back = () => setStep(s => Math.max(s - 1, 1));

  const done = async () => {
    try {
      const formData = new FormData();

      // append all fields
      Object.keys(form).forEach(key => {
        if (form[key] instanceof File) {
          formData.append(key, form[key]);
        } else if (Array.isArray(form[key])) {
          form[key].forEach(v => formData.append(key, v));
        } else {
          formData.append(key, form[key]);
        }
      });

      const res = await fetch("http://localhost:5000/api/vendor/submit", {
        method: "POST",
        body: formData // ❗ NO JSON
      });

      const data = await res.json();

      if (data.success) {
        alert("🎉 Registration submitted successfully!");
        window.location.href = "/pending";
      }

    } catch (err) {
      console.log(err);
      alert("Error submitting form");
    }
  };


  return (
    <>
      {step === 1 && <Step1 data={form} onChange={set} onNext={next} />}
      {step === 2 && <Step2 data={form} onChange={set} onNext={next} onBack={back} />}
      {step === 3 && <Step3 data={form} onChange={set} onNext={next} onBack={back} />}
      {step === 4 && <Step4 data={form} onChange={set} onNext={next} onBack={back} />}
      {step === 5 && <Step5 data={form} onChange={set} onNext={next} onBack={back} />}
      {step === 6 && <Step6 data={form} onChange={set} onDone={done} onBack={back} />}
    </>
  );
}
