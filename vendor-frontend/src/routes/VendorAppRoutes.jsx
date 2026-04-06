import { Routes, Route } from "react-router-dom";

import VendorLogin from "../pages/auth/VendorLogin";
import VendorSignup from "../pages/auth/VendorSignup";



const AppRoutes = () => {
  return (
    <Routes>
     <Route path="/" element={<VendorLogin />} />
     <Route path="/signup" element={<VendorSignup />} />
    </Routes>
  );
};

export default AppRoutes;