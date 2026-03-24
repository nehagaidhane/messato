import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import UserDashboard from "../pages/dashboard/UserDashboard";
import ProtectedRoute from "../utils/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;