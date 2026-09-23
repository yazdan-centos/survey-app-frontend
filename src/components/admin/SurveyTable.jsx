import { Loader2, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import SurveyStatusBadge from './SurveyStatusBadge';

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR').format(new Date(value));
  } catch {
    return value;
  }
}

export default function SurveyTable({ surveys, pendingId, onEdit, onToggleActive, onDelete }) {
  if (surveys.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
        هنوز هیچ پیمایشی ایجاد نشده است. از فرم سمت راست یک پیمایش جدید بسازید.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <table className="w-full text-right text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">عنوان</th>
            <th className="px-4 py-3">نسخه</th>
            <th className="px-4 py-3">تاریخ ایجاد</th>
            <th className="px-4 py-3">وضعیت</th>
            <th className="px-4 py-3">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {surveys.map((survey) => {
            const isPending = pendingId === survey.id;
            const isActive = survey.status === 'active';
            return (
              <tr key={survey.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{survey.title}</div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                  {survey.version || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                  {formatDate(survey.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <SurveyStatusBadge status={survey.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleActive(survey)}
                      disabled={isPending}
                      title={isActive ? 'غیرفعال‌سازی پیمایش' : 'فعال‌سازی پیمایش'}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                        isActive
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isActive ? (
                        <PowerOff size={14} />
                      ) : (
                        <Power size={14} />
                      )}
                      {isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(survey)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      <Pencil size={14} /> ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(survey)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={14} /> حذف
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
