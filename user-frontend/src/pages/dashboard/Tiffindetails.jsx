import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiCheck, FiShoppingCart, FiLoader } from "react-icons/fi";
import { useCart } from "../../components/usecart";
import api from "../../api/axios"; // your existing axios instance
import "./Tiffindetails.css";

// ─── Helpers ───────────────────────────────────────────────────────────────
const getDayName = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString("en-IN", { weekday: "long" });
};

const getFormattedDate = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Fallback images per meal type (used only when DB has no image)
const FALLBACK_IMAGES = {
  lunch:
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  dinner:
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
};

const MEAL_META = {
  lunch:  { emoji: "🌞", label: "Lunch",  time: "12:00 – 3:00 PM" },
  dinner: { emoji: "🌙", label: "Dinner", time: "7:00 – 9:00 PM"  },
};

// ─── Component ─────────────────────────────────────────────────────────────
const TiffinDetails = () => {
  const { mealType, vendorId } = useParams();   // route: /tiffin/:vendorId/:mealType
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const date = query.get("date");
  const plan = query.get("plan");

  // API state
  const [menuData, setMenuData]   = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [apiError, setApiError]   = useState(null);

  // UI state
  const [qty, setQty]                         = useState(1);
  const [instructions, setInstructions]       = useState("");
  const [instructionSaved, setInstructionSaved] = useState(false);
  const [addedToCart, setAddedToCart]         = useState(false);

  const { addToCart, setCartOpen } = useCart();

  // ── Fetch menu from backend ──────────────────────────────────────────────
  useEffect(() => {
    if (!vendorId) {
      setApiError("Vendor ID is missing.");
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      setLoading(true);
      setApiError(null);
      try {
        /*
          GET /api/menus/:vendorId
          Response: { lunch: {...} | null, dinner: {...} | null }
        */
const { data } = await api.get("/menu", {
  baseURL: "http://localhost:5000/api",
  params: {
    vendorId,
    date: date || new Date().toISOString().split("T")[0],
  },
});

        const meal = data[mealType]; // data.lunch or data.dinner

        if (!meal) {
          setApiError(`No ${mealType} menu found for this vendor.`);
          setMenuData(null);
        } else {
          /*
            DB columns used:
              id, vendor_id, name, description, price, type, created_at
            
            We parse "description" as a newline-separated list of items.
            e.g. "Rajma Masala\nChapati - 2 pcs\nPapad"
          */
         const items = meal.items?.length
  ? meal.items.map(i => `${i.name} (${i.quantity})`)
  : ["Menu items not listed"];

          setMenuData({
            id:    meal.id,
            name:  meal.name,
            price: Number(meal.price),
            items,
            image: meal.image || FALLBACK_IMAGES[mealType], // swap with meal.image if you add an image column later
          });
        }
      } catch (err) {
        console.error(err);
        setApiError(
          err.response?.data?.error || err.message || "Failed to load menu."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId, mealType]);

  // ── Derived display values ───────────────────────────────────────────────
  const meta        = MEAL_META[mealType] ?? { emoji: "🍽️", label: mealType, time: "" };
  const dayName     = getDayName(date);
  const displayDate = getFormattedDate(date);
  const mealName    = `${dayName} (${meta.label})`;

  const subtotal  = (menuData?.price ?? 0) * qty;
  const delivery  = 10;
  const total     = subtotal + delivery;

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSaveInstruction = () => {
    setInstructionSaved(true);
    setTimeout(() => setInstructionSaved(false), 2000);
  };

  const buildCartItem = () => ({
    id:           `${mealType}-${vendorId}-${date || plan || "default"}`,
    name:         mealName,
    price:        menuData.price,
    image:        menuData.image,
    quantity:     qty,
    meal_time:    mealType,
    instructions,
    vendorId,
    menuId:       menuData.id,
  });

  const handleAddToCart = () => {
    if (!menuData) return;
    addToCart(buildCartItem());
    setCartOpen(true);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

const handleOrderNow = async () => {
  if (!menuData) return;

  try {
    const cartItem = buildCartItem();
    addToCart(cartItem);

    // ✅ Pass order data to ConfirmAddress via navigation state
    navigate("/confirm-address", {
      state: {
        vendorId,
        menuId:              menuData.id,
        mealType,
        orderDate:           date || new Date().toISOString().split("T")[0],
        quantity:            qty,
        totalPrice:          total,
        specialInstructions: instructions,
        name:                menuData.name,   // shown in order strip
        total,                                // shown in order strip
      },
    });

  } catch (err) {
    console.error("Order error:", err);
    alert("Failed to proceed. Try again.");
  }
};
  // ── Render ───────────────────────────────────────────────────────────────

  // Loading state
  if (loading) {
    return (
      <div className="td-page td-centered">
        <FiLoader className="td-spinner" size={32} />
        <p>Loading menu…</p>
      </div>
    );
  }

  // Error state
  if (apiError || !menuData) {
    return (
      <div className="td-page td-centered">
        <p style={{ color: "var(--color-error, #e53e3e)", fontWeight: 600 }}>
          {apiError || "Menu not found."}
        </p>
        <button className="td-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="td-page">

      {/* Header */}
      <div className="td-header">
        <button className="td-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
        </button>
        <div className="td-header-text">
          <h3>Order Summary</h3>
          <span>{meta.emoji} {meta.label} • {meta.time}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="td-container">

        {/* LEFT — Image + date badge */}
        <div className="td-left">
          <div className="td-img-wrap">
            <img src={menuData.image} alt="food" className="td-img" />
            <div className="td-img-gradient" />
            <div className="td-img-badge">
              <span className="td-day-tag">{meta.emoji} {meta.label}</span>
              <span className="td-time-tag">{meta.time}</span>
            </div>
          </div>

          {/* Items list shown below image on desktop */}
          <div className="td-items-panel">
            <p className="td-panel-title">What's included</p>
            <ul className="td-items-list">
              {menuData.items.map((item, i) => (
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

          {/* Meal name */}
          <div className="td-title-row">
            <div>
              <h4>{mealName}</h4>
              {date && <p className="td-sub">📅 {displayDate}</p>}
              {plan && <p className="td-sub">📋 Plan: <strong>{plan}</strong></p>}
            </div>
            <span className={`td-meal-badge ${mealType}`}>
              {meta.emoji} {meta.label}
            </span>
          </div>

          <div className="td-divider" />

          {/* Items — mobile only */}
          <div className="td-items-mobile">
            <p className="td-panel-title">What's included</p>
            <ul className="td-items-list">
              {menuData.items.map((item, i) => (
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
                onChange={(e) => {
                  setInstructions(e.target.value);
                  setInstructionSaved(false);
                }}
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
              {addedToCart
                ? <><FiCheck size={15} /> Added!</>
                : <><FiShoppingCart size={15} /> Add to Cart</>}
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
