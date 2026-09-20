import { createContext, useContext, useMemo } from 'react';
import { THEME_COLORS } from '../theme/colors';

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
 */
const ThemeContext = createContext(THEME_COLORS);

export function ThemeProvider({ children }) {
  // The palette is static, but memoized in case it ever becomes
  // configurable (e.g. per-tenant branding) without extra re-renders.
  const value = useMemo(() => THEME_COLORS, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
