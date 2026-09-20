import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  ListChecks,
  Users,
  BarChart3,
  Settings,
  FileText,
  ChevronRight,
} from 'lucide-react';

const navigationItems = [
  {
    to: '/dashboard',
    label: 'داشبورد',
    icon: LayoutDashboard,
    description: 'نمای کلی و آمار',
  },
  {
    to: '/admin/surveys',
    label: 'مدیریت پیمایش‌ها',
    icon: ClipboardList,
    description: 'ایجاد و ویرایش پیمایش‌ها',
  },
  {
    to: '/admin/questions',
    label: 'بانک سؤالات',
    icon: ListChecks,
    description: 'مدیریت سؤالات',
  },
  {
    to: '/admin/users',
    label: 'کاربران',
    icon: Users,
    description: 'مدیریت کاربران سیستم',
  },
  {
    to: '/admin/responses',
    label: 'پاسخ‌نامه‌ها',
    icon: FileText,
    description: 'مشاهده پاسخ‌های ثبت‌شده',
  },
  {
    to: '/admin/reports',
    label: 'گزارش‌گیری',
    icon: BarChart3,
    description: 'تحلیل و گزارش‌ها',
  },
  {
    to: '/admin/settings',
    label: 'تنظیمات',
    icon: Settings,
    description: 'پیکربندی سیستم',
  },
];

export default function AdminSidebar({ onNavigate }) {
  return (
    <nav className="flex h-full flex-col overflow-y-auto p-4 pt-6 lg:pt-4">
      {/* Sidebar header */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900">پنل مدیریت</h2>
        <p className="mt-1 text-xs text-slate-500">سیستم ارزیابی کلاس جهانی</p>
      </div>

      {/* Navigation items */}
      <ul className="space-y-1">
        {navigationItems.map(({ to, label, icon: Icon, description }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ` +
                (isActive
                  ? 'bg-gradient-to-r from-primary-800 to-primary-700 text-white shadow-lg shadow-primary-800/25'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-primary-700 hover:shadow-md hover:shadow-slate-200/50')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon with scale animation on hover */}
                  <Icon
                    size={20}
                    className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ` + (isActive ? '' : 'group-hover:text-primary-700')}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Label and description */}
                  <div className="min-w-0 flex-1">
                    <div className={`truncate ` + (isActive ? 'font-bold' : '')}>{label}</div>
                    <div
                      className={`truncate text-xs transition-opacity duration-200 ` +
                        (isActive ? 'text-primary-100 opacity-90' : 'text-slate-500 opacity-0 group-hover:opacity-100')
                      }
                    >
                      {description}
                    </div>
                  </div>

                  {/* Chevron indicator for active item - ChevronRight for RTL */}
                  {isActive && (
                    <ChevronRight
                      size={16}
                      className="shrink-0 animate-pulse"
                      strokeWidth={2.5}
                    />
                  )}

                  {/* Animated border accent on left edge (visually right in RTL) */}
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all duration-200 ` +
                      (isActive
                        ? 'bg-white opacity-90'
                        : 'bg-primary-600 opacity-0 group-hover:opacity-100')
                    }
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Sidebar footer */}
      <div className="mt-auto border-t border-slate-200 pt-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">نسخه سیستم</p>
          <p className="mt-0.5 text-xs text-slate-500">1.0.0</p>
        </div>
      </div>
    </nav>
  );
}