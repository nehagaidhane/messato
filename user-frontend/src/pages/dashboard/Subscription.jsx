import "./Subscription.css";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const navigate = useNavigate();

  return (
    <div className="sub-container">
      {/* Header */}
      <div className="sub-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>Subscription</h3>
      </div>

      {/* Daily Plan */}
      <div className="plan-card active">
        <div className="plan-title">Daily Plan</div>

        <div className="plan-body">
          <span className="badge">Active</span>
          <span className="price">₹99/day</span>

          <h4>Mom’s Mess</h4>

          <div className="plan-info">
            🍽 Lunch & Dinner
            <span>🕒 12:30 PM & 7:30 PM</span>
          </div>

          <p>Started 31 Jan</p>
        </div>
      </div>

      {/* Monthly Plan */}
      <div className="plan-card">
        <div className="plan-title">Monthly Plan</div>

        <div className="plan-body">
          <span className="badge paused">Paused</span>
          <span className="price">₹2999/day</span>

          <h4>Mom’s Mess</h4>

          <div className="plan-info">
            🍽 Lunch & Dinner
            <span>🕒 12:30 PM & 7:30 PM</span>
          </div>

          <p>Started 31 Jan</p>
        </div>
      </div>

      {/* Buttons */}
      <button className="main-btn">RENEW PLAN</button>
      <button className="main-btn">PAUSE</button>
      <button className="main-btn danger">CANCEL PLAN</button>
    </div>
  );
};

export default Subscription;