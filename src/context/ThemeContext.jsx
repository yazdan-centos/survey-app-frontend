import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { THEME_COLORS } from '../theme/colors';

const STORAGE_KEY = 'worldclass-survey:color-mode';

function getInitialMode() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * App-wide theme context. Exposes the brand color palette (extracted from
 * mapnagroup.com's contact page — see src/theme/colors.js) to any component
 * that needs raw color values rather than Tailwind utility classes, e.g.
 * inline SVG/chart fills, dynamic styles, or third-party components.
 *
 * Tailwind classes (bg-primary-700, text-charcoal-600, ...) already read
 * from the same palette via tailwind.config.js, so most components should
 * keep using those directly — reach for useTheme() only when you need the
 * hex value itself.
 *
 * It also owns the light/dark color-mode toggle: it keeps the choice in
 * localStorage, falls back to the OS preference on first load, and applies
 * the `dark` class to <html> so Tailwind's `dark:` variants take effect.
 */
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // The palette itself is static, but memoized alongside the mode state so
  // consumers don't get new object identities on every render.
  const value = useMemo(
    () => ({ ...THEME_COLORS, mode, isDark: mode === 'dark', toggleMode, setMode }),
    [mode]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
