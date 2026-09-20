import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, RefreshCcw } from 'lucide-react';
import { useHttp } from '../hooks/useHttp';
import * as adminSurveyService from '../services/adminSurveyService';
import { SURVEY_STATUS_FILTER_OPTIONS } from '../data/surveyStatus';
import SurveyForm from '../components/admin/SurveyForm';
import SurveyTable from '../components/admin/SurveyTable';

export default function AdminSurveysPage() {
  const request = useHttp();

  const [surveys, setSurveys] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }

  const loadSurveys = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await adminSurveyService.listSurveys(request, { status: statusFilter });
      setSurveys(Array.isArray(data) ? data : data?.items ?? []);
    } catch (error) {
      setLoadError(error.message || 'دریافت فهرست پیمایش‌ها با خطا مواجه شد.');
    } finally {
      setLoading(false);
    }
  }, [request, statusFilter]);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const visibleSurveys = useMemo(() => surveys, [surveys]);

  const handleCreateOrUpdate = async (payload) => {
    setSubmitting(true);
    try {
      if (editingSurvey) {
        const updated = await adminSurveyService.updateSurvey(request, editingSurvey.id, payload);
        setSurveys((current) => current.map((s) => (s.id === editingSurvey.id ? { ...s, ...updated } : s)));
        setNotice({ type: 'success', text: 'پیمایش با موفقیت به‌روزرسانی شد.' });
        setEditingSurvey(null);
      } else {
        const created = await adminSurveyService.createSurvey(request, payload);
        setSurveys((current) => [created, ...current]);
        setNotice({ type: 'success', text: 'پیمایش جدید به‌عنوان پیش‌نویس ایجاد شد.' });
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'ذخیره پیمایش با خطا مواجه شد.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (survey) => {
    const nextActive = survey.status !== 'active';
    setPendingId(survey.id);
    try {
      const updated = await adminSurveyService.setSurveyActive(request, survey.id, nextActive);
      setSurveys((current) =>
        current.map((s) => (s.id === survey.id ? { ...s, ...updated, status: updated?.status ?? (nextActive ? 'active' : 'inactive') } : s))
      );
      setNotice({
        type: 'success',
        text: nextActive ? `پیمایش «${survey.title}» فعال شد.` : `پیمایش «${survey.title}» غیرفعال شد.`,
      });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'تغییر وضعیت پیمایش با خطا مواجه شد.' });
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (survey) => {
    if (!window.confirm(`آیا از حذف پیمایش «${survey.title}» مطمئن هستید؟`)) return;
    setPendingId(survey.id);
    try {
      await adminSurveyService.deleteSurvey(request, survey.id);
      setSurveys((current) => current.filter((s) => s.id !== survey.id));
      if (editingSurvey?.id === survey.id) setEditingSurvey(null);
      setNotice({ type: 'success', text: 'پیمایش حذف شد.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'حذف پیمایش با خطا مواجه شد.' });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">مدیریت پیمایش‌ها</h2>
          <p className="mt-2 text-sm text-slate-500">
            پیمایش جدید بسازید، آن را برای گروه‌های پاسخ‌دهنده هدف تنظیم کنید و هر زمان لازم بود فعال یا غیرفعالش کنید.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSurveys}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
          به‌روزرسانی فهرست
        </button>
      </div>

      {notice && (
        <div
          className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${
            notice.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">فیلتر وضعیت:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
            >
              {SURVEY_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {loadError ? (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p>{loadError}</p>
                <button type="button" onClick={loadSurveys} className="mt-2 font-semibold underline">
                  تلاش مجدد
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> در حال بارگذاری پیمایش‌ها...
            </div>
          ) : (
            <SurveyTable
              surveys={visibleSurveys}
              pendingId={pendingId}
              onEdit={setEditingSurvey}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          )}
        </div>

        <SurveyForm
          editingSurvey={editingSurvey}
          onSubmit={handleCreateOrUpdate}
          onCancelEdit={() => setEditingSurvey(null)}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
