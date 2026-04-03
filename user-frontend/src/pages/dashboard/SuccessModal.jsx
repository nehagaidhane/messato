import "./SucessModal.css";

const SuccessModal = ({ onHome, onReview }) => {
  return (
    <div className="sm-overlay">
      <div className="sm-box">

        {/* ── Cart icon circle ── */}
        <div className="sm-icon-wrap">
          <div className="sm-icon-ring sm-ring-outer" />
          <div className="sm-icon-ring sm-ring-inner" />
          <div className="sm-icon-circle">
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9"  cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
        </div>

        {/* ── Text ── */}
        <h2 className="sm-title">Tiffin Confirm Successfully</h2>

        <p className="sm-quote">
          "Homely taste, on time." <br />
          "Glad to have all our life."
        </p>

        {/* ── Go to Home button ── */}
        <button className="sm-home-btn" onClick={onHome}>
          Go to Home
        </button>

        {/* ── Feedback link ── */}
        <p className="sm-feedback" onClick={onReview}>
          Feedback Review
        </p>

      </div>
    </div>
  );
};

export default SuccessModal;
