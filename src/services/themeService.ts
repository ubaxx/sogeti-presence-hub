const THEME_KEY = "presence_theme";

export type AppTheme = "light" | "dark";

export function getSavedTheme(): AppTheme {
  const saved = localStorage.getItem(THEME_KEY);

  if (saved === "dark") {
    return "dark";
  }

  return "light";
}

export function saveTheme(theme: AppTheme): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function applyTheme(theme: AppTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.body.setAttribute("data-theme", theme);
  document.body.classList.toggle("dark", theme === "dark");
}

export function toggleTheme(current: AppTheme): AppTheme {
  const next: AppTheme = current === "dark" ? "light" : "dark";
  saveTheme(next);
  applyTheme(next);
  return next;
}

export function initializeTheme(): AppTheme {
  const theme = getSavedTheme();
  applyTheme(theme);
  return theme;
}
