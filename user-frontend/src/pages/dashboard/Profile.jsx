import { useNavigate } from "react-router-dom";
import "./profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const menuItems = [
    { title: "Edit Profile",    path: "/edit-profile" },
    { title: "Payment Card",    path: "/payment" },
    { title: "My Orders",       path: "/orders" },
    { title: "Addresses",       path: "/confirm-address" },
    { title: "Change Password", path: "/change-password" },
    { title: "Subscription",    path: "/subscription" },
    { title: "Complaints",      path: "/complaints" },
  ];

  const aboutItems = [
    { title: "Privacy Policy",      path: "/privacy" },
    { title: "Terms & Conditions",  path: "/terms" },
    { title: "FAQs",                path: "/faqs" },
  ];

  return (
    <div className="profile-container">

      <h2 className="profile-title">Account</h2>

      {/* Main menu */}
      <div className="section">
        {menuItems.map((item, i) => (
          <div
            key={i}
            className="profile-item"
            onClick={() => navigate(item.path)}
          >
            {item.title}
            <span className="chevron">›</span>
          </div>
        ))}
      </div>

      {/* Settings */}
      <p className="section-label">Settings</p>
      <div className="section">
        <div className="profile-item settings">
          Notifications
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider" />
          </label>
        </div>
        <div className="profile-item settings">
          Dark Mode
          <label className="switch">
            <input type="checkbox" />
            <span className="slider" />
          </label>
        </div>
      </div>

      {/* About */}
      <p className="section-label">About</p>
      <div className="section">
        {aboutItems.map((item, i) => (
          <div
            key={i}
            className="profile-item"
            onClick={() => navigate(item.path)}
          >
            {item.title}
            <span className="chevron">›</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div
        className="logout"
        onClick={() => {
          localStorage.clear();
          navigate("/logout");
        }}
      >
        Log Out
      </div>

    </div>
  );
};

export default Profile;
