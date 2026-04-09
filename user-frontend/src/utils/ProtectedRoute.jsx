import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role = "user" }) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const type =
    localStorage.getItem("type") ||
    sessionStorage.getItem("type");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ❌ Wrong role (vendor/admin trying user route)
  if (role && type !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;