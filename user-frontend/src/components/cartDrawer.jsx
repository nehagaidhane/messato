/* eslint-disable react-hooks/set-state-in-effect */
import { useCart } from "./usecart";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./CartDrawer.css";

const CartDrawer = ({ open, onClose }) => {
  const { cart, updateQty } = useCart();
  const navigate = useNavigate();

  const [tip, setTip] = useState("");
  const [appliedTip, setAppliedTip] = useState(0);
  const [loading, setLoading] = useState(true);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = cart.length > 0 ? 10 : 0;
  const total = subtotal + delivery + appliedTip;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleConfirm = () => {
    onClose();
    navigate("/confirm-address");
  };

  const drawer = (
    <>
      {/* Overlay */}
      <div
        className={`cd-overlay ${open ? "cd-overlay--show" : ""}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`cd-panel ${open ? "cd-panel--open" : ""}`}>

        {/* Drag handle — mobile/tablet only */}
        <div className="cd-drag-handle"><span /></div>

        {/* Top bar */}
        <div className="cd-topbar">
          <div className="cd-topbar__left">
            <span className="cd-topbar__icon">🛒</span>
            <span className="cd-topbar__title">My Cart</span>
            {cart.length > 0 && (
              <span className="cd-topbar__count">{cart.length}</span>
            )}
          </div>
          <button className="cd-topbar__close" onClick={onClose}>✕</button>
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div className="cd-scroll">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cd-skeleton" />
            ))}
          </div>

        ) : cart.length === 0 ? (
          <div className="cd-empty">
            <span>🍱</span>
            <p>Your cart is empty</p>
            <small>Add a tiffin to get started</small>
          </div>

        ) : (
          <>
            {/* Scrollable items */}
            <div className="cd-scroll">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="cd-item"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  <div className="cd-item__img-wrap">
                    <img src={item.image} alt={item.name} className="cd-item__img" />
                  </div>

                  <div className="cd-item__info">
                    <p className="cd-item__name">{item.name}</p>
                    <p className="cd-item__sub">🏠 Homemade Meal</p>
                    <p className="cd-item__price">₹{item.price} <span className="cd-item__per">/ plate</span></p>
                  </div>

                  <div className="cd-qty">
                    <button
                      className="cd-qty__btn cd-qty__btn--dec"
                      onClick={() => updateQty(item.id, "dec")}
                    >−</button>
                    <span className="cd-qty__count">{item.quantity}</span>
                    <button
                      className="cd-qty__btn cd-qty__btn--inc"
                      onClick={() => updateQty(item.id, "inc")}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom section */}
            <div className="cd-bottom">

              {/* Tip */}
              <div className="cd-tip">
                <p className="cd-tip__label">💝 Add a tip for your cook</p>
                <div className="cd-tip__row">
                  <div className="cd-tip__quick">
                    {[5, 10, 20].map((amt) => (
                      <button
                        key={amt}
                        className={`cd-tip__quick-btn ${appliedTip === amt ? "active" : ""}`}
                        onClick={() => { setTip(String(amt)); setAppliedTip(amt); }}
                      >₹{amt}</button>
                    ))}
                  </div>
                  <div className="cd-tip__custom">
                    <input
                      className="cd-tip__input"
                      type="number"
                      placeholder="Custom"
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                    />
                    <button
                      className="cd-tip__btn"
                      onClick={() => setAppliedTip(parseFloat(tip) || 0)}
                    >Add</button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="cd-summary">
                <div className="cd-summary__row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="cd-summary__row">
                  <span>Delivery Fee</span>
                  <span>₹{delivery.toFixed(2)}</span>
                </div>
                {appliedTip > 0 && (
                  <div className="cd-summary__row cd-summary__row--tip">
                    <span>💝 Tip</span>
                    <span>₹{appliedTip.toFixed(2)}</span>
                  </div>
                )}
                <div className="cd-summary__row cd-summary__row--total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="cd-footer">
                <div className="cd-footer__left">
                  <p className="cd-footer__label">Total Payable</p>
                  <p className="cd-footer__total">₹{total.toFixed(2)}</p>
                </div>
                <button className="cd-footer__btn" onClick={handleConfirm}>
                  Confirm Tiffin →
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );

  return createPortal(drawer, document.body);
};

export default CartDrawer;
