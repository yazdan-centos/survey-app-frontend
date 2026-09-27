import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import logo from '../../assets/logo.png';

export default function Header() {
  const { isAuthenticated, signOut } = useAuth();

  return (
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <img src={logo} alt="لوگوی گروه مپنا" className="h-12 w-12 shrink-0 rounded-md bg-white object-contain" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
              پیمایش ارزیابی شرکت در کلاس جهانی
            </h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              معاونت سیستم‌ها و برنامه‌ریزی راهبردی
            </p>
          </div>
          <ThemeToggle className="order-last sm:order-none" />
          {isAuthenticated && (
            <button
              type="button"
              onClick={signOut}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              aria-label="خروج از حساب کاربری"
            >
              <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>خروج</span>
            </button>
          )}
        </div>
      </header>
  );
}
