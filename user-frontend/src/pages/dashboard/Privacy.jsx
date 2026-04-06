import { useNavigate } from "react-router-dom";
import "./Privacy.css";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-container">
      {/* Header */}
      <div className="privacy-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>Privacy Policy</h3>
      </div>

      {/* Image */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
        alt="privacy"
        className="privacy-img"
      />

      {/* Content */}
      <div className="privacy-content">
        <p>
          We value your privacy. Your personal data is securely stored and never
          shared with third parties without consent.
        </p>

        <p>
          We collect minimal data required for order processing and delivery.
        </p>

        <p>
          By using our app, you agree to our data usage policies.
        </p>
      </div>
    </div>
  );
};

export default Privacy;