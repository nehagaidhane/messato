import { useCart } from "../../components/usecart";
import { useLocation } from "react-router-dom";
import "./Globalcartpopup.css";

const Globalcartpopup = () => {
  const { cart, setCartOpen, cartOpen } = useCart(); // ✅ added cartOpen
  const location = useLocation();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  /* ✅ HIDE ON ROUTES */
  const hideOnRoutes = ["/cart", "/payment", "/confirm-address"];

  const shouldHide =
    totalItems === 0 ||
    cartOpen || // ✅ IMPORTANT FIX
    hideOnRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

  if (shouldHide) return null;

  return (
    <div
      className="global-cart-popup"
      onClick={() => setCartOpen(true)}
    >
      <div className="cart-popup-left">
        <h4>
          {totalItems} item{totalItems > 1 && "s"} added
        </h4>
        <p>₹{totalPrice}</p>
      </div>

      <button className="view-cart-btn">
        View Cart 🛒
      </button>
    </div>
  );
};

export default Globalcartpopup;