import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  ClipboardList,
  Settings,
  LogOut,
  Shield,
  Image,
  BarChart3,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // 💾 persist state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar");
    if (saved === "collapsed") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed ? "collapsed" : "open");
  }, [collapsed]);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "User", path: "/users" },
    { icon: Store, label: "Vendor", path: "/vendor" },
    { icon: ClipboardList, label: "Subscription", path: "/subscription" },
    { icon: Shield, label: "Admin Role", path: "/admin-role" },
    { icon: Image, label: "Content & Banner", path: "/content" },
    { icon: BarChart3, label: "Report", path: "/report" },
  ];

  return (
    <div
      className={`h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between py-6 transition-all duration-300 ${
        collapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      {/* TOP */}
      <div>
        {/* LOGO / HAMBURGER */}
        <div className="flex items-center justify-between px-4 mb-8">

          {/* 👇 Show logo only when expanded */}
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" className="h-10" />
              <span className="text-lg font-semibold dark:text-white">
                Messato
              </span>
            </div>
          )}

          {/* 👇 Toggle Button */}
<button
  onClick={() => setCollapsed(!collapsed)}
  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
>
  {collapsed ? (
    <Menu
      size={20}
      className="text-gray-700 dark:text-gray-200"
    />
  ) : (
    <ChevronLeft
      size={20}
      className="text-gray-700 dark:text-gray-200"
    />
  )}
</button>
        </div>

        {/* MENU */}
        <div className="space-y-2 px-2">
          {menuItems.map((item, i) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={i}
                to={item.path}
                onClick={() => collapsed && setCollapsed(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                <Icon size={20} />

                {!collapsed && <span>{item.label}</span>}

                {/* Tooltip */}
                {collapsed && (
                  <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="space-y-2 px-2">

        <div className="group relative flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
          <Settings size={20} />
          {!collapsed && "Settings"}

          {collapsed && (
            <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
              Settings
            </span>
          )}
        </div>

        <div className="group relative flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
          <LogOut size={20} />
          {!collapsed && "Logout"}

          {collapsed && (
            <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
              Logout
            </span>
          )}
        </div>

      </div>
    </div>
  );
}