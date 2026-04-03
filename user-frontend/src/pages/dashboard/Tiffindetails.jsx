import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiArrowLeft, FiCheck, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../../components/usecart";
import "./Tiffindetails.css";

// 🔥 Get day name from a date string or today
const getDayName = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString("en-IN", { weekday: "long" });
};

const getFormattedDate = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const MEAL_DATA = {
  lunch: {
    items: [
      "Sabji (Rajma Masala)",
      "Chapati - 2 Pieces",
      "Papad",
      "Moong Dal Halwa - 1 Plate",
    ],
    price: 40,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
    time: "12:00 – 3:00 PM",
    emoji: "🌞",
    label: "Lunch",
  },
  dinner: {
    items: [
      "Paneer Sabji",
      "Chapati - 3 Pieces",
      "Rice",
      "Salad",
    ],
    price: 50,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    time: "7:00 – 9:00 PM",
    emoji: "🌙",
    label: "Dinner",
  },
};

const TiffinDetails = () => {
  const { mealType } = useParams();
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const date = query.get("date");
  const plan = query.get("plan");

  const data = MEAL_DATA[mealType];

  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [instructionSaved, setInstructionSaved] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addToCart, setCartOpen } = useCart();

  // 🔥 Dynamic day name from URL date or today
  const dayName = getDayName(date);
  const displayDate = date ? getFormattedDate(date) : getFormattedDate();
  const mealName = `${dayName} (${data?.label})`;

  const handleSaveInstruction = () => {
    setInstructionSaved(true);
    setTimeout(() => setInstructionSaved(false), 2000);
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: `${mealType}-${date || plan || "default"}`,
      name: mealName,
      price: data.price,
      image: data.image,
      quantity: qty,
      meal_time: mealType,
      instructions,
    };
    addToCart(cartItem);
    setCartOpen(true);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleOrderNow = () => {
    const cartItem = {
      id: `${mealType}-${date || plan || "default"}`,
      name: mealName,
      price: data.price,
      image: data.image,
      quantity: qty,
      meal_time: mealType,
      instructions,
    };
    addToCart(cartItem);
    navigate("/confirm-address");
  };

  if (!data) {
    return <h2 style={{ padding: "20px" }}>No data found</h2>;
  }

  const subtotal = data.price * qty;
  const delivery = 10;
  const total = subtotal + delivery;

  return (
    <div className="td-page">

      {/* Header */}
      <div className="td-header">
        <button className="td-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
        </button>
        <div className="td-header-text">
          <h3>Order Summary</h3>
          <span>{data.emoji} {data.label} • {data.time}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="td-container">

        {/* LEFT — Image + date badge */}
        <div className="td-left">
          <div className="td-img-wrap">
            <img src={data.image} alt="food" className="td-img" />
            <div className="td-img-gradient" />
            <div className="td-img-badge">
              <span className="td-day-tag">{data.emoji} {data.label}</span>
              <span className="td-time-tag">{data.time}</span>
            </div>
          </div>

          {/* Items list shown below image on desktop */}
          <div className="td-items-panel">
            <p className="td-panel-title">What's included</p>
            <ul className="td-items-list">
              {data.items.map((item, i) => (
                <li key={i}>
                  <span className="td-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT — Details card */}
        <div className="td-card">

          {/* Meal name — dynamic day */}
          <div className="td-title-row">
            <div>
              <h4>{mealName}</h4>
              {date && <p className="td-sub">📅 {displayDate}</p>}
              {plan && <p className="td-sub">📋 Plan: <strong>{plan}</strong></p>}
            </div>
            <span className={`td-meal-badge ${mealType}`}>
              {data.emoji} {data.label}
            </span>
          </div>

          <div className="td-divider" />

          {/* Items — mobile only */}
          <div className="td-items-mobile">
            <p className="td-panel-title">What's included</p>
            <ul className="td-items-list">
              {data.items.map((item, i) => (
                <li key={i}>
                  <span className="td-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="td-divider td-hide-desktop" />

          {/* Quantity */}
          <div className="td-qty-row">
            <span className="td-qty-label">Quantity</span>
            <div className="qty-box">
              <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>

          <div className="td-divider" />

          {/* Pricing */}
          <div className="price-box">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="price-row">
              <span>Delivery Fee</span>
              <span>₹{delivery}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div className="td-divider" />

          {/* Instructions */}
          <div className="td-instructions">
            <p className="td-panel-title">Special Instructions</p>
            <div className="td-input-wrap">
              <input
                placeholder="e.g. Less spicy, no onion..."
                value={instructions}
                onChange={(e) => { setInstructions(e.target.value); setInstructionSaved(false); }}
              />
              <button
                className={instructionSaved ? "saved" : ""}
                onClick={handleSaveInstruction}
              >
                {instructionSaved ? <FiCheck size={15} /> : "Add"}
              </button>
            </div>
            {instructionSaved && <p className="td-saved-msg">✓ Note saved!</p>}
          </div>

          {/* Action Buttons */}
          <div className="td-actions">
            <button
              className={`cart-btn ${addedToCart ? "added" : ""}`}
              onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            >
              {addedToCart ? <><FiCheck size={15} /> Added!</> : <><FiShoppingCart size={15} /> Add to Cart</>}
            </button>
            <button className="order-btn" onClick={handleOrderNow}>
              Order Now →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TiffinDetails;
