import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { themes } from "../constants/theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const resolvedMode = mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

  const T = themes[resolvedMode] || themes.dark;

  const saveTheme = useCallback((newMode) => {
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  }, []);

  // ✅ APPLY THEME TO HTML (VERY IMPORTANT)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedMode);
  }, [resolvedMode]);

  // ✅ Listen for system theme change
  useEffect(() => {
    if (mode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setSystemPrefersDark(mq.matches);
    };

    setSystemPrefersDark(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const value = useMemo(() => ({ T, mode, resolvedMode, saveTheme }), [T, mode, resolvedMode, saveTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);