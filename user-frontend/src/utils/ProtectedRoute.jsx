import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
const type = localStorage.getItem("type");

  if (!token) return <Navigate to="/" />;

  if (type !== "user") {
    alert("Access denied");
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;