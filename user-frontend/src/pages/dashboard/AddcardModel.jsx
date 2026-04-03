import { useState } from "react";
import "./addCard.css";

// ── Detect card type from number ─────────────────────────────────
const detectType = (num) => {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n))           return "visa";
  if (/^5[1-5]/.test(n))     return "mastercard";
  if (/^3[47]/.test(n))      return "amex";
  if (/^6(?:011|5)/.test(n)) return "discover";
  return "unknown";
};

// ── Format card number with spaces every 4 digits ─────────────────
const formatCardNum = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

// ── Format MM/YY ─────────────────────────────────────────────────
const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

// ── Card type badge ───────────────────────────────────────────────
const CardTypeBadge = ({ type }) => {
  const map = {
    visa:       { label: "VISA",       bg: "#1A1F71", color: "#fff" },
    mastercard: { label: "MC",         bg: "#EB001B", color: "#fff" },
    amex:       { label: "AMEX",       bg: "#007BC1", color: "#fff" },
    discover:   { label: "DISC",       bg: "#FF6600", color: "#fff" },
    unknown:    { label: "CARD",       bg: "#ccc",    color: "#555" },
  };
  const s = map[type] || map.unknown;
  return (
    <span
      className="card-type-badge"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

// ── AddCardModal ──────────────────────────────────────────────────
const AddCardModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    cardNumber: "",
    holderName: "",
    expiry: "",
    cvv: "",
    saveCard: true,
  });
  const [errors, setErrors] = useState({});
  const [flipped, setFlipped] = useState(false);

  const cardType  = detectType(form.cardNumber);
  const last4     = form.cardNumber.replace(/\s/g, "").slice(-4) || "••••";
  const displayNum = form.cardNumber || "•••• •••• •••• ••••";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    if (name === "cardNumber") val = formatCardNum(value);
    if (name === "expiry")     val = formatExpiry(value);
    if (name === "cvv")        val = value.replace(/\D/g, "").slice(0, 4);

    setForm((p) => ({ ...p, [name]: val }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    const num = form.cardNumber.replace(/\s/g, "");
    if (num.length < 15)              e.cardNumber = "Enter a valid card number";
    if (!form.holderName.trim())      e.holderName = "Cardholder name is required";
    if (form.expiry.length < 5)       e.expiry     = "Enter a valid expiry (MM/YY)";
    if (form.cvv.length < 3)          e.cvv        = "Enter a valid CVV";
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onAdd({
      type:   cardType,
      last4,
      expiry: form.expiry,
      name:   form.holderName,
    });
  };

  return (
    <div className="ac-overlay" onClick={onClose}>
      <div className="ac-sheet" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="ac-header">
          <h3 className="ac-title">Add New Card</h3>
          <button className="ac-close" onClick={onClose}>✕</button>
        </div>

        {/* ── 3-D card preview ── */}
        <div className="ac-card-wrap">
          <div className={`ac-card${flipped ? " flipped" : ""}`}>

            {/* Front */}
            <div className="ac-card-front">
              <div className="ac-card-top">
                <span className="ac-chip">▬</span>
                <CardTypeBadge type={cardType} />
              </div>
              <p className="ac-card-num">{displayNum}</p>
              <div className="ac-card-bottom">
                <div>
                  <p className="ac-card-sub">Card Holder</p>
                  <p className="ac-card-val">
                    {form.holderName || "FULL NAME"}
                  </p>
                </div>
                <div>
                  <p className="ac-card-sub">Expires</p>
                  <p className="ac-card-val">{form.expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="ac-card-back">
              <div className="ac-mag-stripe" />
              <div className="ac-cvv-wrap">
                <p className="ac-card-sub">CVV</p>
                <p className="ac-cvv-val">{form.cvv || "•••"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="ac-form">

          {/* Card Number */}
          <div className="ac-field">
            <label>Card Number</label>
            <div className="ac-input-wrap">
              <input
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                className={errors.cardNumber ? "err" : ""}
              />
            </div>
            {errors.cardNumber && <p className="ac-error">{errors.cardNumber}</p>}
          </div>

          {/* Holder name */}
          <div className="ac-field">
            <label>Cardholder Name</label>
            <input
              name="holderName"
              value={form.holderName}
              onChange={handleChange}
              placeholder="Name on card"
              className={errors.holderName ? "err" : ""}
            />
            {errors.holderName && <p className="ac-error">{errors.holderName}</p>}
          </div>

          {/* Expiry + CVV */}
          <div className="ac-row2">
            <div className="ac-field">
              <label>Expiry</label>
              <input
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                inputMode="numeric"
                className={errors.expiry ? "err" : ""}
              />
              {errors.expiry && <p className="ac-error">{errors.expiry}</p>}
            </div>
            <div className="ac-field">
              <label>CVV</label>
              <input
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="•••"
                inputMode="numeric"
                type="password"
                className={errors.cvv ? "err" : ""}
                onFocus={() => setFlipped(true)}
                onBlur={() => setFlipped(false)}
              />
              {errors.cvv && <p className="ac-error">{errors.cvv}</p>}
            </div>
          </div>

          {/* Save toggle */}
          <label className="ac-save-toggle">
            <input
              type="checkbox"
              name="saveCard"
              checked={form.saveCard}
              onChange={handleChange}
            />
            <span className="ac-toggle-box" />
            Save card for future payments
          </label>
        </div>

        {/* Add button */}
        <button className="ac-add-btn" onClick={handleAdd}>
          Add Card
        </button>

      </div>
    </div>
  );
};

export default AddCardModal;
