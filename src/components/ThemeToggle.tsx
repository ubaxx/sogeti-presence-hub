import { useEffect, useState } from "react";
import {
  getSavedTheme,
  initializeTheme,
  toggleTheme
} from "../services/themeService";

export default function ThemeToggle() {
  const [dark, setDark] = useState(getSavedTheme() === "dark");

  useEffect(() => {
    initializeTheme();
  }, []);

  function handleToggle() {
    const nextTheme = toggleTheme(dark ? "dark" : "light");
    setDark(nextTheme === "dark");
  }

  return (
    <div className="theme-toggle-wrapper">
      <span className="theme-label">Dark mode</span>
      <div
        aria-label="Dark mode"
        role="switch"
        aria-checked={dark}
        className={`theme-toggle ${dark ? "active" : ""}`}
        onClick={handleToggle}
      >
        <div className="toggle-knob" />
      </div>
    </div>
  );
}
