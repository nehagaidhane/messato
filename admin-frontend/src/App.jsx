import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/UserList";
import VendorList from "./pages/VendorList";
import Subscriber from "./pages/Subscriber";
import AdminRole from "./pages/AdminRole";
import Report from "./pages/Report";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/vendor" element={<VendorList />} />
        <Route path="/subscription" element={<Subscriber />} />
        <Route path="/admin-role" element={<AdminRole />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App; 