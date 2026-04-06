import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;

    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`w-14 h-7 flex items-center rounded-full p-1 transition duration-300 ${
        dark ? "bg-gray-700" : "bg-yellow-400"
      }`}
    >
      <div
        className={`w-5 h-5 flex items-center justify-center rounded-full bg-white shadow-md transform transition duration-300 ${
          dark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {dark ? (
          <Moon size={14} className="text-gray-700" />
        ) : (
          <Sun size={14} className="text-yellow-500" />
        )}
      </div>
    </button>
  );
}