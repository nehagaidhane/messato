import { useState } from "react";
import "../pages/dashboard/Payment.css";
import "./Reviewmodel.css"

// ReviewModal.jsx
const ReviewModal = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [tab, setTab] = useState("feedback");

  return (
    <div className="review-overlay">
      <div className="review-modal">   {/* ← was "review-box", fix to "review-modal" */}
        <h3>Feedback Review</h3>
        <p>Your Rating For SHREE TIFFIN : Good</p>

        <div className="stars">
          {[1,2,3,4,5].map((i) => (
            <span
              key={i}
              onClick={() => setRating(i)}
              className={i <= rating ? "active" : ""}
            >★</span>
          ))}
        </div>

        <div className="tabs">
          <button className={tab === "feedback" ? "active" : ""} onClick={() => setTab("feedback")}>Feedback</button>
          <button className={tab === "complaint" ? "active" : ""} onClick={() => setTab("complaint")}>Complaint</button>
        </div>

        {tab === "complaint" && (
          <select className="dropdown">
            <option>Food Quality</option>
            <option>Delivery Time</option>
            <option>Packaging</option>
          </select>
        )}

        <textarea placeholder="Type here..." />

        <div className="review-actions">
          <button onClick={onClose}>Skip</button>
          <button onClick={onClose}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;