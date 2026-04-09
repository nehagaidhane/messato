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

      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/location"
        element={
          <ProtectedRoute>
            <LocationSetup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/:vendorId"
        element={
          <ProtectedRoute>
            <Menus />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tiffin/:vendorId/:mealType"
        element={
          <ProtectedRoute>
            <TiffinDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/confirm-address"
        element={
          <ProtectedRoute>
            <ConfirmAddress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/track-order/:orderId"
        element={
          <ProtectedRoute>
            <TrackOrder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/logout"
        element={
          <ProtectedRoute>
            <Logout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faqs"
        element={
          <ProtectedRoute>
            <FAQ />
          </ProtectedRoute>
        }
      />

      <Route
        path="/terms"
        element={
          <ProtectedRoute>
            <Terms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/privacy"
        element={
          <ProtectedRoute>
            <Privacy />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;