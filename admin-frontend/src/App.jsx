import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import UserList from "./pages/UserList";
import VendorList from "./pages/VendorList";
import Subscriber from "./pages/Subscriber";
import AdminRole from "./pages/AdminRole";
import Report from "./pages/Report";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor"
          element={
            <ProtectedRoute>
              <VendorList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscriber />
            </ProtectedRoute>
          }
        />

        {/* 🔐 Only superadmin can access */}
        <Route
          path="/admin-role"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <AdminRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
{/* <Route path="/orders" element={<Orders />} />
<Route path="/commission" element={<Commission />} />
<Route path="/refund" element={<Refund />} />
<Route path="/taxes" element={<Taxes />} /> */}
      </Routes>
    </Router>
  );
}

export default App;