import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Small accessible switch for toggling between light and dark color modes.
 * Persists the choice via ThemeProvider (localStorage + OS preference fallback).
 */
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleMode}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
      title={isDark ? 'حالت روشن' : 'حالت تاریک'}
      className={
        'inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:bg-slate-800 dark:hover:text-primary-400 ' +
        className
      }
    >
      {isDark ? (
        <Sun size={18} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon size={18} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}
