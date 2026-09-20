import { Factory, ListChecks, ClipboardList, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isAdmin } from '../../utils/auth';

const adminLinks = [
  { to: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { to: '/admin/surveys', label: 'پیمایش‌ها', icon: ClipboardList },
  { to: '/admin/questions', label: 'سؤال‌ها', icon: ListChecks },
];

export default function Header() {
  const { isAuthenticated, user } = useAuth();

  return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-800 text-white">
          <Factory size={20} strokeWidth={1.75} />
        </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
              پیمایش ارزیابی شرکت در کلاس جهانی
            </h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">
              معاونت سیستم‌ها و برنامه‌ریزی راهبردی
            </p>
          </div>

          {isAuthenticated && isAdmin(user) && (
            <nav className="flex shrink-0 items-center gap-1">
              {adminLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-primary-800 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon size={14} /> {label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>
  );
}
