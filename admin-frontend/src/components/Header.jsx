import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700">

      {/* Search */}
      <input
        type="text"
        placeholder="Search"
        className="w-[400px] bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full outline-none text-black dark:text-white"
      />

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Theme */}
        <ThemeToggle />

        {/* Profile */}
        <div className="flex items-center gap-3">

          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`}
            className="w-10 h-10 rounded-full"
          />

          <div>
            <p className="text-sm font-semibold text-black dark:text-white">
              {user?.name || "Guest"}
            </p>

            <p className="text-xs text-gray-500">
              {user?.role || "Role"}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}