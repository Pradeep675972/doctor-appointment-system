"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const THEME_KEY = "vitalis-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable: theme still applies for this visit */
    }
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="group grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-navy shadow-soft ring-1 ring-line transition-all duration-300 hover:-translate-y-0.5 hover:ring-brand/40 active:scale-90"
    >
      <span className="relative block h-5 w-5 transition-transform duration-700 ease-premium group-hover:rotate-45">
        {isDark ? (
          <Sun className="absolute inset-0 h-5 w-5 text-amber" aria-hidden />
        ) : (
          <Moon className="absolute inset-0 h-5 w-5 text-brand" aria-hidden />
        )}
      </span>
    </button>
  );
}
