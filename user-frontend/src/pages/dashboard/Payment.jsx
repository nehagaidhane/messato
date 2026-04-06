import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddCardModal from "./AddcardModel";
import PaymentCard from "./PaymentCard";
import SuccessModal from "./SuccessModal";
import ReviewModal from "../../components/Reviewmodel";
import { useCart } from "../../components/usecart";
import "./payment.css";

// ── Inline SVG logos ─────────────────────────────────────────────

const PhonePeLogo = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#5f259f"/>
    <path d="M28 14.5c0-2.5-2-4.5-4.5-4.5H14l-2 18h4l.7-6H20c4.4 0 8-3.6 8-7.5z" fill="white"/>
    <path d="M16.7 18.5l.8-6h5.5c1.7 0 3 1.3 3 3s-1.3 3-3 3h-6.3z" fill="#5f259f"/>
    <circle cx="29" cy="29" r="5" fill="#04d98b"/>
  </svg>
);

const GooglePayLogo = () => (
  <svg width="56" height="22" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="22" fontFamily="Arial" fontWeight="700" fontSize="20" fill="#4285F4">G</text>
    <text x="14" y="22" fontFamily="Arial" fontWeight="400" fontSize="20" fill="#34A853">o</text>
    <text x="26" y="22" fontFamily="Arial" fontWeight="400" fontSize="20" fill="#FBBC05">o</text>
    <text x="38" y="22" fontFamily="Arial" fontWeight="400" fontSize="20" fill="#EA4335">g</text>
    <text x="50" y="22" fontFamily="Arial" fontWeight="400" fontSize="20" fill="#34A853">l</text>
    <text x="57" y="22" fontFamily="Arial" fontWeight="400" fontSize="20" fill="#4285F4">e</text>
    <text x="70" y="22" fontFamily="Arial" fontWeight="700" fontSize="20" fill="#333">Pay</text>
  </svg>
);

const PaytmLogo = () => (
  <svg width="52" height="22" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="32" rx="5" fill="#00BAF2"/>
    <text x="8" y="22" fontFamily="Arial" fontWeight="900" fontSize="18" fill="white">paytm</text>
  </svg>
);

// ── Saved cards (mock — replace with API data) ───────────────────
const SAVED_CARDS = [
  { id: 1, type: "mastercard", last4: "435", expiry: "12/26", name: "Master Card" },
];

// ── PaymentPage ──────────────────────────────────────────────────
const PaymentPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [selected, setSelected] = useState("CARD_1");
  const [cards, setCards] = useState(SAVED_CARDS);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const handleConfirm = () => {
    setTimeout(() => {
      clearCart();
      setShowSuccess(true);
    }, 300);
  };

  const handleAddCard = (card) => {
    const newCard = { ...card, id: Date.now() };
    setCards((prev) => [...prev, newCard]);
    setSelected(`CARD_${newCard.id}`);
    setShowAddCard(false);
  };

  return (
    <>
      <div className="pay-page">

        {/* HEADER */}
        <div className="pay-header">
          <button className="pay-back" onClick={() => navigate(-1)}>‹</button>
          <h3>Payment Card</h3>
        </div>

        {/* SAVED CARDS */}
        <div className="pay-card">
          {cards.map((card) => (
            <PaymentCard
              key={card.id}
              card={card}
              active={selected === `CARD_${card.id}`}
              onSelect={() => setSelected(`CARD_${card.id}`)}
            />
          ))}

          {/* ADD NEW */}
          <div className="pay-row add-new-row" onClick={() => setShowAddCard(true)}>
            <span className="add-new-label">＋ ADD NEW</span>
          </div>
        </div>

        {/* ONLINE PAYMENTS */}
        <p className="section-title">Online Payments</p>
        <div className="pay-card">
          <PayOption
            logo={<PhonePeLogo />}
            label="PhonePe"
            active={selected === "PHONEPE"}
            onClick={() => setSelected("PHONEPE")}
          />
          <PayOption
            logo={<GooglePayLogo />}
            label=""
            active={selected === "GPAY"}
            onClick={() => setSelected("GPAY")}
          />
          <PayOption
            logo={<PaytmLogo />}
            label=""
            active={selected === "PAYTM"}
            onClick={() => setSelected("PAYTM")}
          />
        </div>

        {/* CASH */}
        <p className="section-title">Cash</p>
        <div className="pay-card">
          <PayOption
            logo={<span className="cash-icon">💵</span>}
            label="Cash on Delivery"
            active={selected === "COD"}
            onClick={() => setSelected("COD")}
          />
        </div>

        {/* CONFIRM */}
        <div className="pay-footer">
          <button className="pay-confirm-btn" onClick={handleConfirm}>
            CONFIRM PAYMENT
          </button>
        </div>
      </div>

      {/* ADD CARD MODAL */}
      {showAddCard && (
        <AddCardModal
          onClose={() => setShowAddCard(false)}
          onAdd={handleAddCard}
        />
      )}

      {/* SUCCESS */}
      {showSuccess && (
        <SuccessModal
          onHome={() => navigate("/dashboard")}
          onReview={() => { setShowSuccess(false); setShowReview(true); }}
        />
      )}

      {/* REVIEW */}
      {showReview && <ReviewModal onClose={() => navigate("/dashboard")} />}
    </>
  );
};

// ── PayOption row ────────────────────────────────────────────────
const PayOption = ({ logo, label, active, onClick }) => (
  <div className={`pay-row${active ? " pay-row--active" : ""}`} onClick={onClick}>
    <span className="pay-row-left">
      <span className="pay-logo">{logo}</span>
      {label && <span className="pay-label">{label}</span>}
    </span>
    <div className={`radio${active ? " radio--active" : ""}`} />
  </div>
);

export default PaymentPage;
