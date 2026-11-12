import { create } from "zustand";

/** What the visitor picked. `system` follows the browser's colour scheme, live. */
export type Theme = "light" | "dark" | "system";

/** The theme in force: `system` resolved to one of the two. */
export type ResolvedTheme = "light" | "dark";

const KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * The browser-bar colour per theme: the `background` role of each theme in index.css. The inline script in
 * index.html carries the same two values; theme.test.ts keeps all three in step.
 */
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: "#faf8ff", dark: "#11131a" };

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/** The saved choice; light on a first visit, and when storage is blocked (it can throw). */
function saved(): Theme {
  try {
    const value = localStorage.getItem(KEY);
    return isTheme(value) ? value : "light";
  } catch {
    return "light";
  }
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  return theme;
}

/** Sets `data-theme` on <html> (popups portal under <body>, so it must sit above them) and the browser-bar colour. */
function apply(theme: Theme): void {
  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[resolved]);
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: saved(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // Storage is blocked (a private window): the choice lasts until the tab closes.
    }
    apply(theme);
    set({ theme });
  },
}));

/** Applies the saved theme, and follows the browser's scheme while the choice is System. Call once at start. */
export function initTheme(): void {
  apply(useTheme.getState().theme);
  window.matchMedia(DARK_QUERY).addEventListener("change", () => {
    if (useTheme.getState().theme === "system") apply("system");
  });
}
