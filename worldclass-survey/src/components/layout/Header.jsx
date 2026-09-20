import { Factory, ListChecks, ClipboardList, LayoutDashboard } from 'lucide-react';

export default function Header() {
  return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
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
        </div>
      </header>
  );
}
