import { useEffect } from "react";
import { useTheme } from "./constants/ThemeContext";
import AppRoutes from "./routes/VendorAppRoutes";

function App() {
  const { resolvedMode } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedMode);
  }, [resolvedMode]);

  return <AppRoutes key={resolvedMode} />;
}

export default App;