// constants/theme.js

const darkTheme = {
  bg:          "#0f0f1a",
  card:        "#1a1a2e",
  surface:     "#16213e",
  border:      "#2a2a4a",
  accent:      "#6c63ff",
  green:       "#22c55e",
  red:         "#ef4444",
  orange:      "#f97316",
  yellow:      "#eab308",
  blue:        "#3b82f6",
  textPrimary: "#ffffff",
  textSecondary:"#b0b0c8",
  textMuted:   "#6b6b8a",
};

const lightTheme = {
  bg:          "#f4f4f8",
  card:        "#ffffff",
  surface:     "#ebebf5",
  border:      "#d8d8e8",
  accent:      "#6c63ff",
  green:       "#16a34a",
  red:         "#dc2626",
  orange:      "#ea580c",
  yellow:      "#ca8a04",
  blue:        "#2563eb",
  textPrimary: "#0f0f1a",
  textSecondary:"#3a3a5c",
  textMuted:   "#8888aa",
};

// Export both so ThemeContext can use them
export const themes = { dark: darkTheme, light: lightTheme };

export const STATUS_CONFIG = {
  pending: { label: "Pending", color: darkTheme.yellow, next: "accepted" },
  accepted: { label: "Accepted", color: darkTheme.blue, next: "preparing" },
  preparing: { label: "Preparing", color: darkTheme.orange, next: "out_for_delivery" },
  out_for_delivery: { label: "On Way", color: darkTheme.accent, next: "delivered" },
  delivered: { label: "Delivered", color: darkTheme.green },
  rejected: { label: "Rejected", color: darkTheme.red },
};

const resolveThemeName = () => {
  const theme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "dark";
  return theme === "light" ? "light" : "dark";
};

const themeProxy = new Proxy({}, {
  get: (_, prop) => {
    const activeTheme = themes[resolveThemeName()] || darkTheme;
    return activeTheme[prop];
  },
});

// Keep T as a live theme proxy so existing imports update with the active theme.
export const T = themeProxy;