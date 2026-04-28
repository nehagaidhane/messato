import { Routes, Route } from "react-router-dom";

import VendorLogin from "../pages/auth/VendorLogin";
import VendorSignup from "../pages/auth/VendorSignup";
import Splash from "../pages/Dashboard/Splash";
import Onboarding from "../pages/Dashboard/Onboarding";
import VendorOnboarding from "../pages/Dashboard/VendorOnboarding";
import ProtectedVendorRoute from "../pages/Dashboard/ProtectedVendorRoute";
import VendorDashboard from "../pages/Dashboard/VendorDashboard";
import Privacy from "../pages/Dashboard/Privacy";
import FAQ from "../pages/Dashboard/FAQ";
import Terms from "../pages/Dashboard/Terms";
import SupportPage from "../pages/Dashboard/Contactsupport";

// 👉 Create these pages (simple for now)
const Pending = () => <h2>⏳ Your request is under review</h2>;
const Rejected = () => <h2>❌ Your request was rejected</h2>;

const AppRoutes = () => {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<VendorLogin />} />
      <Route path="/signup" element={<VendorSignup />} />

      {/* PROTECTED VENDOR ROUTES */}
      <Route
        path="/vendor/onboarding"
        element={
          <ProtectedVendorRoute>
            <VendorOnboarding />
          </ProtectedVendorRoute>
        }
      />

      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedVendorRoute>
            <VendorDashboard />
          </ProtectedVendorRoute>
        }
      />

      <Route
        path="/vendor/pending"
        element={
          <ProtectedVendorRoute>
            <Pending />
          </ProtectedVendorRoute>
        }
      />

      <Route
        path="/vendor/rejected"
        element={
          <ProtectedVendorRoute>
            <Rejected />
          </ProtectedVendorRoute>
        }
      />
      <Route path="/vendor/dashboard/privacy" element={<Privacy />} />
      <Route path="/vendor/dashboard/faq" element={<FAQ />} />
      <Route path="/vendor/dashboard/terms" element={<Terms />} />
      <Route path="/vendor/dashboard/customersupport" element={<SupportPage />} />


       


    </Routes>
  );
};

export default AppRoutes;