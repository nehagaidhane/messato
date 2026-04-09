import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("running");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        console.log("Token:", token ? "found ✅" : "NOT found ❌ — check localStorage key");

        const res = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          return;
        }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError("Could not load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const RUNNING_STATUSES = ["pending", "accepted"];
  const runningOrders = orders.filter((o) => RUNNING_STATUSES.includes(o.status));
  const pastOrders = orders.filter((o) => !RUNNING_STATUSES.includes(o.status));
  const displayed = activeTab === "running" ? runningOrders : pastOrders;

  const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const handleCancel = async (orderId, e) => {
    e.stopPropagation();
    if (!window.confirm("Cancel this order?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Cancel failed");
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, status: "rejected" } : o))
      );
      if (selectedOrder?.order_id === orderId)
        setSelectedOrder((s) => ({ ...s, status: "rejected" }));
    } catch (err) {
      alert("Could not cancel order: " + err.message);
    }
  };

  const statusColor = (status) =>
    ({ pending: "#f59e0b", accepted: "#10b981", rejected: "#ef4444", delivered: "#6366f1" }[
      status
    ] || "#888");

  const foodImage = (menuImage) => {
    if (!menuImage) return "";
    if (menuImage.startsWith("http")) return menuImage;
    const clean = menuImage.replace(/^\/?(uploads\/)?/, "");
    return `http://localhost:5000/uploads/${clean}`;
  };

  const mealEmoji = (mealType) =>
    ({ lunch: "🍱", dinner: "🌙", breakfast: "🌅" }[mealType] || "🍽️");

  return (
    <div className="orders-page">
      {/* ── Header ── */}
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <div className="tabs">
          <button
            className={activeTab === "running" ? "active" : ""}
            onClick={() => setActiveTab("running")}
          >
            Running
            {runningOrders.length > 0 && (
              <span className="badge">{runningOrders.length}</span>
            )}
          </button>
          <button
            className={activeTab === "past" ? "active" : ""}
            onClick={() => setActiveTab("past")}
          >
            Past Orders
          </button>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {selectedOrder && (
        <div className="drawer-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setSelectedOrder(null)}>
              ✕
            </button>

            <div className="drawer-hero">
              <img
                src={foodImage(selectedOrder.menu_image)}
                alt={selectedOrder.menu_name}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div className="drawer-hero-overlay">
                <h2>{selectedOrder.menu_name}</h2>
                <p>{selectedOrder.vendor_name}</p>
              </div>
            </div>

            <div className="drawer-body">
              <div className="drawer-status-row">
                <span
                  className="drawer-status-pill"
                  style={{ background: statusColor(selectedOrder.status) }}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
                <span className="drawer-date">
                  {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="drawer-info-grid">
                <div className="drawer-info-item">
                  <span className="info-label">Order ID</span>
                  <span className="info-val">#{selectedOrder.order_id}</span>
                </div>
                <div className="drawer-info-item">
                  <span className="info-label">Quantity</span>
                  <span className="info-val">{selectedOrder.quantity}</span>
                </div>
                <div className="drawer-info-item">
                  <span className="info-label">Total Paid</span>
                  <span className="info-val price-val">
                    ₹{Number(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
                <div className="drawer-info-item">
                  <span className="info-label">Per Item</span>
                  <span className="info-val">₹{Number(selectedOrder.menu_price || 0).toFixed(2)}</span>
                </div>
                <div className="drawer-info-item">
                  <span className="info-label">Meal Type</span>
                  <span className="info-val" style={{textTransform:"capitalize"}}>{selectedOrder.meal_type}</span>
                </div>
                <div className="drawer-info-item">
                  <span className="info-label">Payment</span>
                  <span className="info-val">{selectedOrder.payment_status}</span>
                </div>
              </div>
              {selectedOrder.menu_description && (
                <div className="drawer-detail-block">
                  <span className="info-label">🍱 About this meal</span>
                  <p>{selectedOrder.menu_description}</p>
                </div>
              )}
              {selectedOrder.vendor_city && (
                <div className="drawer-detail-block">
                  <span className="info-label">🏪 Mess Location</span>
                  <p>{selectedOrder.vendor_address}, {selectedOrder.vendor_city}</p>
                </div>
              )}

              {selectedOrder.delivery_address && (
                <div className="drawer-detail-block">
                  <span className="info-label">📍 Delivery Address</span>
                  <p>{selectedOrder.delivery_address}</p>
                </div>
              )}

              {selectedOrder.special_instructions && (
                <div className="drawer-detail-block">
                  <span className="info-label">📝 Special Instructions</span>
                  <p>{selectedOrder.special_instructions}</p>
                </div>
              )}

              <div className="drawer-actions">
                {RUNNING_STATUSES.includes(selectedOrder.status) && (
                  <button
                    className="btn-track"
                    onClick={() => navigate(`/track-order/${selectedOrder.order_id}`)}
                  >
                    🚴 Track Order
                  </button>
                )}
                {selectedOrder.status === "pending" && (
                  <button
                    className="btn-cancel"
                    onClick={(e) => handleCancel(selectedOrder.order_id, e)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main List ── */}
      <div className="orders-container">
        {loading && (
          <div className="state-wrapper">
            <div className="loader" />
            <p>Loading your orders…</p>
          </div>
        )}

        {error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && displayed.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p>No {activeTab} orders yet</p>
          </div>
        )}

        <div className="orders-grid-desktop">
        {!loading &&
          displayed.map((order) => (
            <div
              key={order.order_id}
              className="order-card"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-img-wrap">
                <div className="img-placeholder">{mealEmoji(order.meal_type)}</div>
                {foodImage(order.menu_image) && (
                  <img
                    src={foodImage(order.menu_image)}
                    alt={order.menu_name}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                <span
                  className="status-dot"
                  style={{ background: statusColor(order.status) }}
                />
              </div>

              <div className="order-info">
                <h4>{order.menu_name}</h4>
                <p className="vendor-name">{order.vendor_name}</p>
                <span
                  className="status-pill"
                  style={{
                    background: statusColor(order.status) + "22",
                    color: statusColor(order.status),
                  }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>

                {RUNNING_STATUSES.includes(order.status) && (
                  <div className="order-actions">
                    <button
                      className="track"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/track-order/${order.order_id}`);
                      }}
                    >
                      Track
                    </button>
                    {order.status === "pending" && (
                      <button
                        className="cancel"
                        onClick={(e) => handleCancel(order.order_id, e)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="order-right">
                <span className="price">₹{Number(order.total_amount).toFixed(2)}</span>
                <span className="qty">x{order.quantity}</span>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="view-detail">View ›</span>
              </div>
            </div>
          ))}
      </div>
    </div>
    </div>
  );
};

export default Orders;
