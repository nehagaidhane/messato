// PaymentCard.jsx
// Renders a single saved card row inside the Payment page.

// ── Inline SVG logos (no props needed) ──────────────────────────
const MasterCardLogo = () => (
  <svg width="36" height="24" viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="19" cy="16" r="13" fill="#EB001B"/>
    <circle cx="31" cy="16" r="13" fill="#F79E1B"/>
    <path d="M25 6.8a13 13 0 0 1 0 18.4A13 13 0 0 1 25 6.8z" fill="#FF5F00"/>
  </svg>
);

const VisaLogo = () => (
  <svg width="44" height="24" viewBox="0 0 70 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="70" height="32" rx="4" fill="#1A1F71"/>
    <text x="8" y="22" fontFamily="Arial" fontWeight="900" fontSize="18" fill="white" fontStyle="italic">VISA</text>
  </svg>
);

const PaymentCard = ({ card, active, onSelect }) => {
  const isVisa = card.type === "visa";

  return (
    <div
      className={`pay-row pay-row--card${active ? " pay-row--active" : ""}`}
      onClick={onSelect}
    >
      <span className="pay-row-left">
        <span className="pay-logo card-logo">
          {isVisa ? <VisaLogo /> : <MasterCardLogo />}
        </span>
        <span className="card-info">
          <span className="card-name">{card.name}</span>
          <span className="card-number">
            {"•••• •••• •••• "}{card.last4}
          </span>
        </span>
      </span>
      <div className={`radio${active ? " radio--active" : ""}`} />
    </div>
  );
};

export default PaymentCard;
