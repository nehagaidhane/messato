import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />;

  if (role !== "user") {
    alert("Access denied");
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;