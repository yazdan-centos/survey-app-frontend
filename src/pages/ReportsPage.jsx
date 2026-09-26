import { useEffect, useState } from 'react';
import { BarChart3, Loader2, RefreshCcw } from 'lucide-react';
import { useHttp } from '../hooks/useHttp';
import { getSurveyReports } from '../services/reportService';
import { responseDate, responseNumber } from '../utils/responseDisplay';
import ReportCharts from '../components/admin/ReportCharts';

const panelClass = 'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900';

export default function ReportsPage() {
  const request = useHttp();
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const data = await getSurveyReports(request, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setReports(data);
          setError('');
        }
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message || 'دریافت گزارش با خطا مواجه شد.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [request, revision]);

  const refresh = () => {
    setLoading(true);
    setError('');
    setRevision((value) => value + 1);
  };
  const report = reports.find((item) => item.id === selectedId) ?? reports[0];

  return (
    <div dir="rtl" className="mx-auto min-w-0 max-w-6xl space-y-6 px-4 py-8 text-slate-800 dark:text-slate-100 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-2xl font-bold">گزارش‌گیری</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">پیمایش مورد نظر را برای بررسی آمار پاسخ‌ها و گروه‌های پاسخ‌دهنده انتخاب کنید.</p></div>
        <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"><RefreshCcw size={16} />به‌روزرسانی</button>
      </div>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><p>{error}</p><button type="button" onClick={refresh} className="mt-2 font-semibold underline">تلاش مجدد</button></div>}
      {loading ? <p role="status" className="flex items-center justify-center gap-2 py-16 text-sm"><Loader2 size={20} className="animate-spin" />در حال دریافت گزارش‌ها...</p> : !error && (
        report ? <>
          <section className={panelClass}>
            <label htmlFor="report-survey" className="mb-2 block text-sm font-semibold">انتخاب پیمایش</label>
            <select id="report-survey" value={report.id} onChange={(event) => setSelectedId(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 dark:border-slate-600 dark:bg-slate-800 sm:max-w-lg">
              {reports.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">آخرین پاسخ: {responseDate(report.lastSubmittedAt)}</p>
          </section>
          <section aria-label="خلاصه گزارش" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['questionCount', 'تعداد سؤال‌ها'], ['responseCount', 'پاسخ‌نامه‌ها'],
              ['answeredCount', 'پاسخ‌های دارای سطح'], ['skippedCount', 'بدون اطلاعات کافی'],
            ].map(([key, label]) => <div key={key} className={panelClass}><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold">{responseNumber(report[key])}</p></div>)}
          </section>
          {report.responseCount === 0 && <p role="status" className="rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800">هنوز پاسخ‌نامه‌ای برای این پیمایش ثبت نشده است.</p>}
          <ReportCharts key={report.id} report={report} />
          <section className={panelClass}>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <caption className="mb-4 text-right font-semibold">جزئیات گروه‌های پاسخ‌دهنده — {report.title}</caption>
                <thead className="bg-slate-50 dark:bg-slate-800"><tr>{['گروه پاسخ‌دهنده', 'پاسخ‌نامه‌ها', 'پاسخ‌های دارای سطح', 'بدون اطلاعات کافی'].map((label) => <th key={label} scope="col" className="whitespace-nowrap px-3 py-3">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.audiences.map((audience) => <tr key={audience.role}><th scope="row" className="px-3 py-3 font-medium">{audience.label}</th><td className="px-3 py-3">{responseNumber(audience.responseCount)}</td><td className="px-3 py-3">{responseNumber(audience.answeredCount)}</td><td className="px-3 py-3">{responseNumber(audience.skippedCount)}</td></tr>)}
                  {!report.audiences.length && <tr><td colSpan={4} className="p-6 text-center text-slate-500 dark:text-slate-400">آمار گروه‌های پاسخ‌دهنده موجود نیست.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </> : <div className={`${panelClass} py-16 text-center`}><BarChart3 size={32} className="mx-auto mb-3 text-slate-400" /><p>هنوز پیمایشی برای گزارش‌گیری ثبت نشده است.</p></div>
      )}
    </div>
  );
}
