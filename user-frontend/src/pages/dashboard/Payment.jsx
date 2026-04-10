import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddCardModal from "./AddcardModel";
import PaymentCard from "./PaymentCard";
import SuccessModal from "./SuccessModal";
import ReviewModal from "../../components/Reviewmodel";
import { useCart } from "../../components/usecart";
import "./payment.css";

const PhonePeLogo = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#5f259f"/>
    <path d="M28 14.5c0-2.5-2-4.5-4.5-4.5H14l-2 18h4l.7-6H20c4.4 0 8-3.6 8-7.5z" fill="white"/>
    <path d="M16.7 18.5l.8-6h5.5c1.7 0 3 1.3 3 3s-1.3 3-3 3h-6.3z" fill="#5f259f"/>
    <circle cx="29" cy="29" r="5" fill="#04d98b"/>
  </svg>
);

const GooglePayLogo = () => (
  <svg width="56" height="22" viewBox="0 0 90 30" fill="none">
    <text x="0"  y="22" fontFamily="Arial" fontWeight="700" fontSize="20" fill="#4285F4">G</text>
    <text x="14" y="22" fontFamily="Arial" fontSize="20" fill="#34A853">o</text>
    <text x="26" y="22" fontFamily="Arial" fontSize="20" fill="#FBBC05">o</text>
    <text x="38" y="22" fontFamily="Arial" fontSize="20" fill="#EA4335">g</text>
    <text x="50" y="22" fontFamily="Arial" fontSize="20" fill="#34A853">l</text>
    <text x="57" y="22" fontFamily="Arial" fontSize="20" fill="#4285F4">e</text>
    <text x="70" y="22" fontFamily="Arial" fontWeight="700" fontSize="20" fill="#333">Pay</text>
  </svg>
);

const PaytmLogo = () => (
  <svg width="52" height="22" viewBox="0 0 100 32" fill="none">
    <rect width="100" height="32" rx="5" fill="#00BAF2"/>
    <text x="8" y="22" fontFamily="Arial" fontWeight="900" fontSize="18" fill="white">paytm</text>
  </svg>
);

const SAVED_CARDS = [
  { id: 1, type: "mastercard", last4: "435", expiry: "12/26", name: "Master Card" },
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ─── IMPORTANT: Use this component from your cart/checkout page like:
//
//   <PaymentPage
//     orderId={order.id}
//     vendorId={order.vendor_id}
//     totalAmount={order.grand_total}
//     customerName={user.name}
//     customerEmail={user.email}
//     customerPhone={user.phone}
//   />
//
// OR pass via router state (see useLocation fallback below)

const PaymentPage = (props) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { clearCart } = useCart();

  // Support both direct props AND router state (navigate("/payment", { state: {...} }))
  const orderId       = props.orderId       ?? location.state?.orderId;
  const vendorId      = props.vendorId      ?? location.state?.vendorId;
  const totalAmount   = props.totalAmount   ?? location.state?.totalAmount;
  const customerName  = props.customerName  ?? location.state?.customerName  ?? "";
  const customerEmail = props.customerEmail ?? location.state?.customerEmail ?? "";
  const customerPhone = props.customerPhone ?? location.state?.customerPhone ?? "";

  const [selected,    setSelected]    = useState("CARD_1");
  const [cards,       setCards]       = useState(SAVED_CARDS);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReview,  setShowReview]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => { loadRazorpayScript(); }, []);

  // Validate required props early so you get a clear error
  useEffect(() => {
    if (!orderId || !vendorId || !totalAmount) {
      setError("Missing order data. Please go back and try again.");
      console.error("PaymentPage: orderId, vendorId, totalAmount are required.", { orderId, vendorId, totalAmount });
    }
  }, [orderId, vendorId, totalAmount]);

  const isCOD          = selected === "COD";
  const isOnlineWallet = ["PHONEPE", "GPAY", "PAYTM"].includes(selected);

  // ── COD ────────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/payment/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, vendor_id: vendorId, total_amount: totalAmount }),
      });
     const text = await res.text();
let data;

try {
  data = text ? JSON.parse(text) : {};
} catch (err) {
  throw new Error("Invalid JSON response from server"+err);
}
      if (!res.ok) throw new Error(data.error || "COD failed");
      clearCart();
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Razorpay ───────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    setLoading(true);
    setError("");

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Razorpay failed to load. Check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Razorpay order on your backend
      const createRes = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id:     orderId,
          vendor_id:    vendorId,
          total_amount: totalAmount,
        }),
      });
      const text = await createRes.text();
let orderData;

try {
  orderData = text ? JSON.parse(text) : {};
} catch {
  throw new Error("Invalid response from server");
}
      if (!createRes.ok) throw new Error(orderData.error || "Order creation failed");

      const { razorpay_order_id, amount, currency, key_id } = orderData;

      // Guard: if key_id is missing, .env is not loaded on backend
      if (!key_id) throw new Error("Razorpay key missing — check RAZORPAY_KEY_ID in backend .env");
      if (!razorpay_order_id) throw new Error("razorpay_order_id missing from backend response");

      // 2. Build method config for UPI wallets
      let methodConfig = {};
      if (selected === "PHONEPE" || selected === "GPAY") {
        methodConfig = { method: "upi" };
      } else if (selected === "PAYTM") {
        methodConfig = { method: "wallet", wallet: "paytm" };
      }

      // 3. Open Razorpay checkout
      const options = {
        key:         key_id,
        amount,                      // in paise, already set by backend
        currency:    currency || "INR",
        name:        "Tiffin App",
        description: `Order #${orderId}`,
        order_id:    razorpay_order_id,
        prefill: {
          name:    customerName,
          email:   customerEmail,
          contact: customerPhone,
        },
        ...methodConfig,
        theme: { color: "#5f3dc4" },

       handler: async (response) => {
  try {
    const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: orderId,
        vendor_id: vendorId,
        total_amount: totalAmount,
      }),
    });
const text = await verifyRes.text();
let verifyData;

try {
  verifyData = text ? JSON.parse(text) : {};
} catch (err) {
  throw new Error("Invalid JSON response from server"+err);
}

    if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
const token =
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

if (!token) {
  alert("Session expired. Please login again.");
  return;
}
    // ✅ NEW: Update order status (important)
    // const statusRes =await fetch("http://localhost:5000/api/orders/update-status", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`,
    //    },
    //   body: JSON.stringify({
    //     order_id: orderId,
    //     payment_id: response.razorpay_payment_id,
    //     status: "paid"
    //   }),
    // });
//    if (!statusRes.ok) {
//   const errText = await statusRes.text();
//   console.error("Update status failed:", errText);
//   throw new Error("Order status update failed");
// }
    clearCart();

    // ✅ show success
    setShowSuccess(true);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
},

        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment was cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!orderId || !vendorId || !totalAmount) {
      setError("Missing order data. Please go back and try again.");
      return;
    }
    isCOD ? handleCOD() : handleRazorpay();
  };

  const handleAddCard = (card) => {
    const newCard = { ...card, id: Date.now() };
    setCards((prev) => [...prev, newCard]);
    setSelected(`CARD_${newCard.id}`);
    setShowAddCard(false);
  };

  const confirmLabel = () => {
    if (loading) return "Processing…";
    if (isCOD)   return "Place order (COD)";
    if (isOnlineWallet) return `Pay via ${selected === "PHONEPE" ? "PhonePe" : selected === "GPAY" ? "Google Pay" : "Paytm"}`;
    return "Confirm payment";
  };

  return (
    <>
      <div className="pay-page">

        <div className="pay-header">
          <button className="pay-back" onClick={() => navigate(-1)}>‹</button>
          <h3>Payment</h3>
        </div>

        {error && <div className="pay-error-banner">⚠️ {error}</div>}

        <div className="pay-summary">
          <span className="pay-summary-label">Order Total</span>
          <span className="pay-summary-amount">
            ₹{parseFloat(totalAmount || 0).toFixed(2)}
          </span>
        </div>

        {/* Saved Cards */}
        <p className="section-title">Saved Cards</p>
        <div className="pay-card">
          {cards.map((card) => (
            <PaymentCard
              key={card.id}
              card={card}
              active={selected === `CARD_${card.id}`}
              onSelect={() => setSelected(`CARD_${card.id}`)}
            />
          ))}
          <div className="pay-row add-new-row" onClick={() => setShowAddCard(true)}>
            <span className="add-new-label">＋ ADD NEW</span>
          </div>
        </div>

        {/* Online Payments */}
        <p className="section-title">Online Payments</p>
        <div className="pay-card">
          <PayOption logo={<PhonePeLogo />} label="PhonePe"
            active={selected === "PHONEPE"} onClick={() => setSelected("PHONEPE")} />
          <PayOption logo={<GooglePayLogo />} label="Google Pay"
            active={selected === "GPAY"} onClick={() => setSelected("GPAY")} />
          <PayOption logo={<PaytmLogo />} label="Paytm"
            active={selected === "PAYTM"} onClick={() => setSelected("PAYTM")} />
        </div>

        {/* COD */}
        <p className="section-title">Cash</p>
        <div className="pay-card">
          <PayOption logo={<span className="cash-icon">💵</span>} label="Cash on Delivery"
            active={selected === "COD"} onClick={() => setSelected("COD")} />
        </div>

        {isCOD && (
          <p className="cod-note">
            💡 Cash on Delivery: vendor receives payment directly. 20% commission is settled later via vendor dashboard.
          </p>
        )}

        <div className="pay-footer">
          <button className="pay-confirm-btn" onClick={handleConfirm} disabled={loading}>
            {confirmLabel()}
          </button>
        </div>
      </div>

      {showAddCard && (
        <AddCardModal onClose={() => setShowAddCard(false)} onAdd={handleAddCard} />
      )}
      {showSuccess && (
        <SuccessModal
          onHome={() => navigate("/dashboard")}
          onReview={() => { setShowSuccess(false); setShowReview(true); }}
        />
      )}
      {showReview && <ReviewModal onClose={() => navigate("/dashboard")} />}
    </>
  );
};

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