import { useNavigate } from "react-router-dom";
import "./trackorder.css";

const TrackOrder = () => {
  const navigate = useNavigate();

  return (
    <div className="track-container">
      {/* Top Bar */}
      <div className="top-bar">
        <button onClick={() => navigate(-1)}>←</button>
        <span>Track Order</span>
      </div>

      {/* Map Background */}
      <div className="map"></div>

      {/* Bottom Card */}
      <div className="bottom-card">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          className="profile"
        />

        <h3>Kaylynn Stanton</h3>
        <p>15 min | 1.5km Free Delivery</p>

        <div className="info">
          <div>
            📍 <b>9 Gotmare Complex</b>
            <span>Delivery address</span>
          </div>
          <div>
            ⏰ <b>20-25 min</b>
            <span>Delivery time</span>
          </div>
        </div>

        <button className="call-btn">Call Now</button>
      </div>
    </div>
  );
};

export default TrackOrder;