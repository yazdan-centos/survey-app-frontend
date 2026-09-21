import { useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, RefreshCcw } from 'lucide-react';
import RadarScoreChart from '../components/results/RadarScoreChart';
import DimensionBarChart from '../components/results/DimensionBarChart';
import LevelDistribution from '../components/results/LevelDistribution';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { scoreToLevelLabel, scoreToPercent } from '../utils/scoring';

const PAGE_SIZE = 10;
const metrics = [
  ['totalSurveys', 'کل پیمایش‌ها'],
  ['activeSurveys', 'پیمایش‌های فعال'],
  ['totalQuestions', 'کل سؤال‌ها'],
  ['totalResponses', 'پاسخ‌نامه‌های ثبت‌شده'],
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('fa-IR');
}

export default function DashboardPage() {
  const [page, setPage] = useState(0);
  const { data, loading, error, refresh } = useAdminDashboard(page, PAGE_SIZE);

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-slate-500" role="status">
        <Loader2 size={18} className="animate-spin" /> در حال دریافت نتایج همه کاربران...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p role="alert" className="text-sm">{error}</p>
          </div>
          <button type="button" onClick={refresh} className="mt-3 text-sm font-semibold underline">تلاش مجدد</button>
        </div>
      </div>
    );
  }

  const { summary, aggregate, submissions, surveys, hasAggregate, hasSubmissions } = data;
  const hasResponses = summary.totalResponses > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">داشبورد نتایج کاربران</h2>
          <p className="mt-1 text-sm text-slate-500">نمای تجمیعی پاسخ‌ها و امتیازهای ثبت‌شده توسط همه کاربران</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
          به‌روزرسانی
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([key, label]) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-primary-800">{summary[key].toLocaleString('fa-IR')}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <caption className="p-4 text-right font-semibold text-slate-900">آمار پیمایش‌ها</caption>
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {['پیمایش', 'وضعیت', 'سؤال‌ها', 'پاسخ‌نامه‌ها', 'پاسخ‌های ثبت‌شده', 'بدون اطلاعات کافی'].map((label) => (
                <th key={label} scope="col" className="whitespace-nowrap px-4 py-3">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {surveys.map((survey) => (
              <tr key={survey.id}>
                <td className="px-4 py-3">{survey.title}</td>
                <td className="px-4 py-3">{survey.active ? 'فعال' : 'غیرفعال'}</td>
                <td className="px-4 py-3">{survey.questionCount.toLocaleString('fa-IR')}</td>
                <td className="px-4 py-3">{survey.responseCount.toLocaleString('fa-IR')}</td>
                <td className="px-4 py-3">{survey.answeredCount.toLocaleString('fa-IR')}</td>
                <td className="px-4 py-3">{survey.skippedCount.toLocaleString('fa-IR')}</td>
              </tr>
            ))}
            {surveys.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">پیمایشی ثبت نشده است.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!hasResponses ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-700">هنوز پاسخ‌نامه‌ای ثبت نشده است.</p>
          <p className="mt-2 text-sm text-slate-500">پس از ثبت پاسخ‌ها، آمار این بخش به‌روزرسانی می‌شود.</p>
        </div>
      ) : (
        <>
          {hasAggregate ? (
          <>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-medium text-slate-500">میانگین کلی همه پاسخ‌دهندگان</p>
            <p className="mt-2 text-5xl font-extrabold text-primary-800">{aggregate.overallAverage.toFixed(2)}</p>
            <p className="text-sm text-slate-400">از ۴.۰۰</p>
            <p className="mt-3 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-800">
              {scoreToLevelLabel(aggregate.overallAverage)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">میانگین تجمیعی ابعاد پنج‌گانه</h3>
              <RadarScoreChart dimensionScores={aggregate.dimensions} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">مقایسه میانگین هر بُعد</h3>
              <DimensionBarChart dimensionScores={aggregate.dimensions} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">جزئیات تجمیعی ابعاد</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {aggregate.dimensions.map((dimension) => (
                <div key={dimension.key} className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: dimension.color }}>
                    <dimension.icon size={16} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{dimension.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{dimension.average.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">{scoreToPercent(dimension.average)}٪ از حداکثر امتیاز</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {dimension.answered.toLocaleString('fa-IR')} پاسخ
                    {dimension.skipped > 0 && ` · ${dimension.skipped.toLocaleString('fa-IR')} بدون اطلاعات کافی`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">توزیع سطوح انتخاب‌شده توسط همه کاربران</h3>
            <LevelDistribution distribution={aggregate.levelDistribution} />
          </div>
          </>
          ) : (
            <p role="status" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              آمار پاسخ‌نامه‌ها در جدول بالا نمایش داده می‌شود. تحلیل امتیازها هنوز در دسترس نیست.
            </p>
          )}

          {hasSubmissions && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-700">آخرین پاسخ‌نامه‌ها</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {['پاسخ‌دهنده', 'نقش', 'میانگین کل', 'تاریخ ثبت'].map((label) => (
                      <th key={label} scope="col" className="px-4 py-3">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.items.map((submission) => (
                    <tr key={submission.id ?? `${submission.respondentName}-${submission.submittedAt}`}>
                      <td className="px-4 py-3 font-medium text-slate-800">{submission.respondentName}</td>
                      <td className="px-4 py-3 text-slate-600">{submission.roleLabel}</td>
                      <td className="px-4 py-3 text-slate-600">{submission.overallAverage.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(submission.submittedAt)}</td>
                    </tr>
                  ))}
                  {submissions.items.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">پاسخی در این صفحه وجود ندارد.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
              <span>{submissions.totalItems.toLocaleString('fa-IR')} پاسخ‌نامه</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="صفحه قبل"
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  disabled={page === 0 || loading}
                  className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
                <span>صفحه {(submissions.page + 1).toLocaleString('fa-IR')} از {Math.max(1, submissions.totalPages).toLocaleString('fa-IR')}</span>
                <button
                  type="button"
                  aria-label="صفحه بعد"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page + 1 >= submissions.totalPages || loading}
                  className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}
