import ThemeToggle from "./ThemeToggle";

// components/Header.jsx
export default function Header() {
  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">

      {/* Search */}
      <input
        type="text"
        placeholder="Search"
        className="w-[400px] bg-gray-100 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-full outline-none placeholder-gray-400"
      />

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Theme Toggle */}
        <ThemeToggle />

        <span className="text-sm text-gray-600 dark:text-gray-300">
          English
        </span>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/40"
            className="w-10 h-10 rounded-full"
            alt="profile"
          />
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">
              Moni Roy
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}