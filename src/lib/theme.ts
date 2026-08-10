export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "dark";

export const THEME_STORAGE_KEY = "theme";

// Runs before first paint so the stored choice is applied without a flash of
// the default theme. Kept as a string because it ships as an inline <script>.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.dataset.theme=t==="light"||t==="dark"?t:"${DEFAULT_THEME}"}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}"}})();`;

// The <html> element stays the source of truth: the inline script writes it
// before anything else runs, the stylesheet keys every themed value off it, and
// the toggle only has to flip the attribute.
export const THEME_LABELS: Record<Theme, string> = {
  light: "Light theme",
  dark: "Dark theme",
};
