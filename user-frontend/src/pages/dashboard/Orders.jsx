import { useNavigate } from "react-router-dom";
import "./orders.css";

const Orders = () => {
  const navigate = useNavigate();

  const orders = [1, 2, 3]; // dummy

  return (
    <div className="orders-container">
      <div className="tabs">
        <button className="active">Running Order</button>
        <button>Past Order</button>
      </div>

      {orders.map((item, index) => (
        <div key={index} className="order-card">
          <img
            src="https://source.unsplash.com/100x100/?food"
            alt="food"
          />

          <div className="order-info">
            <h4>Veg Thali</h4>
            <p>Mom’s Mess</p>
            <span>Delivery Time 2.00 - 3.00 pm</span>

            <div className="order-actions">
              <button
                className="track"
                onClick={() => navigate("/track-order")}
              >
                Track Order
              </button>
              <button className="cancel">Cancel</button>
            </div>
          </div>

          <div className="order-right">
            <span className="price">₹200.00</span>
            <span className="distance">2 km Radius</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;