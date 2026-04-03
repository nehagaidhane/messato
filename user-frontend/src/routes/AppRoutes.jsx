import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import LocationSetup from "../pages/auth/Locationsetup";
import UserDashboard from "../pages/dashboard/UserDashboard";
import ProtectedRoute from "../utils/ProtectedRoute";
import Menus from "../pages/dashboard/Menus";
import TiffinDetails from "../pages/dashboard/Tiffindetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
       <Route path="/location" element={<LocationSetup onComplete={(data) => console.log("Location saved:", data)} />} />
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/vendor/:id" element={<Menus />} />
      <Route path="/tiffin/:id/:mealType" element={<TiffinDetails />} />
    </Routes>
  );
};

export default AppRoutes;