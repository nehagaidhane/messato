import { Routes, Route } from "react-router-dom";

import VendorLogin from "../pages/auth/VendorLogin";
import VendorSignup from "../pages/auth/VendorSignup";
import Splash from "../pages/Dashboard/Splash";
import Onboarding from "../pages/Dashboard/Onboarding";
import Vendoronboarding from  "../pages/Dashboard/Vendoronboarding";       


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
     <Route path="/login" element={<VendorLogin />} />
     <Route path="/signup" element={<VendorSignup />} />
      <Route path="/vendor/onboarding" element={<Vendoronboarding />} />

    </Routes>
  );
};

export default AppRoutes;