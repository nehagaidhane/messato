import { Home, User, Menu, Settings } from "lucide-react";
// import "./sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Messato</h2>

      <ul>
        <li><Home size={20}/> Home</li>
        <li><Menu size={20}/> Orders</li>
        <li><User size={20}/> Profile</li>
        <li><Settings size={20}/> Settings</li>
      </ul>
    </div>
  );
}