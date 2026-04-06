import { useNavigate } from "react-router-dom";
import "./Terms.css";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-container">
      {/* Header */}
      <div className="terms-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>Terms and Conditions</h3>
      </div>

      {/* Image */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/942/942748.png"
        alt="terms"
        className="terms-img"
      />

      {/* Content */}
      <div className="terms-content">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          vehicula risus non nisl suscipit, nec aliquet justo tristique.
        </p>

        <p>
          By using our services, you agree to follow our policies regarding
          subscription, delivery, and payments.
        </p>

        <p>
          We reserve the right to modify or cancel services anytime without
          prior notice.
        </p>
      </div>
    </div>
  );
};

export default Terms;