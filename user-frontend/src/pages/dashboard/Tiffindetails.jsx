import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import "./Tiffindetails.css";

const MOCK_ITEMS = {
  lunch: {
    name: "Monday (Lunch)",
    items: [
      "Sabji (Rajma Masala)",
      "Chapati - 2 Pieces",
      "Papad",
      "Moong Dal Halwa - 1 Plate",
    ],
    price: 40,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  dinner: {
    name: "Monday (Dinner)",
    items: [
      "Paneer Sabji",
      "Chapati - 3 Pieces",
      "Rice",
      "Salad",
    ],
    price: 50,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
};

const TiffinDetails = () => {
  const { mealType } = useParams();
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const date = query.get("date");
  const plan = query.get("plan");

  const data = MOCK_ITEMS[mealType];

  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState("");

  // ✅ FIX: define function inside component
  const handleAddToCart = () => {
    console.log("Cart function triggered");

    const cartItem = {
      id: `${mealType}-${date || plan}`,
      name: `${data.name}`,
      price: data.price,
      image: data.image,
      quantity: qty,
      meal_time: mealType,
      instructions,
    };

    console.log("Item added:", cartItem);

    // 👉 TODO: connect to global cart (context/redux/localStorage)
  };

  if (!data) {
    return <h2 style={{ padding: "20px" }}>No data found</h2>;
  }

  const subtotal = data.price * qty;
  const delivery = 10;
  const total = subtotal + delivery;

  return (
    <div className="td-page">

      {/* 🔙 Header */}
      <div className="td-header">
        <button onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h3>Order Summary</h3>
      </div>

      {/* 🔥 MAIN CONTAINER */}
      <div className="td-container">

        {/* 🖼 LEFT SIDE */}
        <div className="td-left">
          <img src={data.image} alt="food" className="td-img" />
        </div>

        {/* 📦 RIGHT SIDE */}
        <div className="td-card">

          <h4>{data.name}</h4>

          {date && <p className="td-sub">Date: {date}</p>}
          {plan && <p className="td-sub">Plan: {plan}</p>}

          {/* 🍽 Items */}
          <ul>
            {data.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {/* 🔢 Quantity */}
          <div className="qty-box">
            <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>

          {/* 💰 Pricing */}
          <div className="price-box">
            <p>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </p>
            <p>
              <span>Delivery Fee</span>
              <span>₹{delivery}</span>
            </p>
            <h4>
              <span>Total</span>
              <span>₹{total}</span>
            </h4>
          </div>

          {/* ✍️ Instructions */}
          <div className="td-instructions">
            <p>ADD INSTRUCTIONS</p>
            <div className="td-input-wrap">
              <input
                placeholder="Enter here"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <button>Add</button>
            </div>
          </div>

          {/* 🔘 Buttons */}
          <div className="td-actions">
            <button
              className="cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
            >
              ADD TO CART
            </button>

            <button className="order-btn">ORDER NOW</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TiffinDetails;