const LogoutModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Log Out?</h3>
        <p>Are you sure want to log out?</p>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          LOG OUT
        </button>

        <span className="close" onClick={onClose}>✖</span>
      </div>
    </div>
  );
};

export default LogoutModal;