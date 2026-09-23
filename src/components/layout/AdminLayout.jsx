import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * AdminLayout wraps all admin pages with a responsive sidebar.
 * On mobile, the sidebar is hidden by default and toggleable.
 * On desktop (lg+), the sidebar is always visible on the left (right in RTL).
 * 
 * Note: In RTL layout, "left" in code = visual right side for users
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col lg:flex-row">
      {/* Sidebar - left side in code = right side visually in RTL */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ top: '73px' }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="بستن منو"
        >
          <X size={20} />
        </button>

        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          style={{ top: '73px' }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex-1">
        {/* Mobile menu button */}
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu size={18} />
            منوی مدیریت
          </button>
        </div>

        {/* Page content */}
        <div className="min-h-full bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
