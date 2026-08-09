"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  getServerTheme,
  getTheme,
  setTheme,
  subscribeToTheme,
  THEMES,
  type Theme,
} from "@/lib/theme";

const LABELS: Record<Theme, string> = {
  light: "Light theme",
  dark: "Dark theme",
};

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);
  const toggleRef = useRef<HTMLDivElement>(null);

  // Marked ready only after hydration, so the thumb lands in place on first
  // paint instead of sliding across from the server-rendered default.
  useEffect(() => {
    toggleRef.current?.setAttribute("data-ready", "true");
  }, []);

  return (
    <div className="theme-toggle" role="group" aria-label="Theme" ref={toggleRef}>
      <span className="theme-toggle__thumb" data-position={theme} aria-hidden="true" />
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          className="theme-option"
          data-option={option}
          aria-pressed={theme === option}
          aria-label={LABELS[option]}
          title={LABELS[option]}
          onClick={() => setTheme(option)}
        >
          {option === "light" ? <SunIcon /> : <MoonIcon />}
        </button>
      ))}
    </div>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 1.8v2.6M12 19.6v2.6M22.2 12h-2.6M4.4 12H1.8M19.2 4.8l-1.9 1.9M6.7 17.3l-1.9 1.9M19.2 19.2l-1.9-1.9M6.7 6.7 4.8 4.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 14.6A8.8 8.8 0 0 1 9.4 3.5a8.8 8.8 0 1 0 11.1 11.1Z" />
    </svg>
  );
}
