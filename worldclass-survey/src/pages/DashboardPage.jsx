import { useEffect, useState } from 'react';
import { useHttp } from '../hooks/useHttp';
import { API_PATHS } from '../config/api';
import {NavLink} from "react-router-dom";

const metrics = [
  ['totalSurveys', 'کل پیمایش‌ها'],
  ['activeSurveys', 'پیمایش‌های فعال'],
  ['totalQuestions', 'کل سؤال‌ها'],
  ['totalResponses', 'پاسخ‌نامه‌های ثبت‌شده'],
];

export default function DashboardPage() {
  const request = useHttp();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    request(API_PATHS.dashboard, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'دریافت اطلاعات داشبورد با خطا مواجه شد.');
        }
      });
    return () => controller.abort();
  }, [request, attempt]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <h2 className="text-2xl font-bold text-slate-900">داشبورد</h2>
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-white p-5">
          <p role="alert" className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-primary-800 underline"
            onClick={() => {
              setError('');
              setAttempt((current) => current + 1);
            }}
          >
            تلاش مجدد

          </button>
        </div>
      ) : !data ? (
        <p role="status" className="text-sm text-slate-500">در حال دریافت اطلاعات...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([key, label]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold text-primary-800">
                  {data.summary[key].toLocaleString('fa-IR')}
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-right text-sm">
              <caption className="p-4 text-right font-semibold text-slate-900">آمار پیمایش‌ها</caption>
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {['پیمایش', 'وضعیت', 'سؤال‌ها', 'پاسخ‌نامه‌ها'].map((label) => (
                    <th key={label} scope="col" className="px-4 py-3">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.surveys.map((survey) => (
                  <tr key={survey.id}>
                    <td className="px-4 py-3">{survey.title}</td>
                    <td className="px-4 py-3">{survey.active ? 'فعال' : 'غیرفعال'}</td>
                    <td className="px-4 py-3">{survey.questionCount.toLocaleString('fa-IR')}</td>
                    <td className="px-4 py-3">{survey.responseCount.toLocaleString('fa-IR')}</td>
                  </tr>
                ))}
                {data.surveys.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">پیمایشی ثبت نشده است.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
