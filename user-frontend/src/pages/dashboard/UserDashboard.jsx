import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>👤 User Dashboard</h1>

      <button onClick={() => navigate("/vendors")}>
        View Nearby Vendors
      </button>

      <br /><br />

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserDashboard;
