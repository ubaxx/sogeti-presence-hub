import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="theme-toggle-wrapper">

      <span className="theme-label">
        Dark mode
      </span>

      <div
        className={`theme-toggle ${dark ? "active" : ""}`}
        onClick={() => setDark(!dark)}
      >
        <div className="toggle-knob" />
      </div>

    </div>
  );
}