import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import LocationSetup from "../pages/auth/Locationsetup";
import UserDashboard from "../pages/dashboard/UserDashboard";
import ProtectedRoute from "../utils/ProtectedRoute";
import Menus from "../pages/dashboard/Menus";
import TiffinDetails from "../pages/dashboard/Tiffindetails";
import ConfirmAddress from "../pages/dashboard/ConfirmAddress";
import Payment from "../pages/dashboard/Payment";
import Profile from "../pages/dashboard/Profile";
import Orders from "../pages/dashboard/Orders";
import ChangePassword from "../pages/dashboard/Changepassword";
import TrackOrder from "../pages/dashboard/TrackOrder";
import Logout from "../pages/dashboard/Logoutmodel";
import Subscription from "../pages/dashboard/Subscription";
import Complaints from "../pages/dashboard/Complaints";
import FAQ from "../pages/dashboard/FAQ";
import Terms from "../pages/dashboard/Terms";
import Privacy from "../pages/dashboard/Privacy";
import EditProfile from "../pages/dashboard/Editprofile";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
       <Route path="/location" element={<LocationSetup onComplete={(data) => console.log("Location saved:", data)} />} />
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/vendor/:id" element={<Menus />} />
      <Route path="/tiffin/:id/:mealType" element={<TiffinDetails />} />
      <Route path="/confirm-address" element={<ConfirmAddress />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/complaints" element={<Complaints />} />
      <Route path="/faqs" element={<FAQ />} />
<Route path="/terms" element={<Terms />} />
<Route path="/privacy" element={<Privacy />} />
      <Route path="/edit-profile" element={<EditProfile />} />
     

    
    </Routes>
  );
};

export default AppRoutes;