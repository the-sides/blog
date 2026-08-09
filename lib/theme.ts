export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "dark";

const STORAGE_KEY = "theme";

// Runs before first paint so the stored choice is applied without a flash of
// the default theme. Kept as a string because it ships as an inline <script>.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");document.documentElement.dataset.theme=t==="light"||t==="dark"?t:"${DEFAULT_THEME}"}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}"}})();`;

// The <html> element is the source of truth: the inline script writes it before
// React exists, so components subscribe to it rather than keeping a rival copy.
const listeners = new Set<() => void>();

export function subscribeToTheme(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function getServerTheme(): Theme {
  return DEFAULT_THEME;
}

export function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private-mode storage failures shouldn't break the toggle.
  }
  for (const listener of listeners) {
    listener();
  }
}
