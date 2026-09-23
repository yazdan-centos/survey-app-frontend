import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, FileText, Loader2, RefreshCcw, Search } from 'lucide-react';
import { useHttp } from '../hooks/useHttp';
import { getResponse, getResponseOverview, getResponseQuestions, isResponseId } from '../services/responseService';
import { responseDate, responseNumber, responseRoleLabel } from '../utils/responseDisplay';
import ResponseDetails from '../components/admin/ResponseDetails';

const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50';

export default function ResponsesPage() {
  const request = useHttp();
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');
  const [surveySearch, setSurveySearch] = useState('');
  const [responseId, setResponseId] = useState('');
  const [response, setResponse] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [questions, setQuestions] = useState(new Map());
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const overviewController = useRef(null);
  const detailController = useRef(null);
  const lookupInput = useRef(null);

  const fetchOverview = useCallback(async () => {
    overviewController.current?.abort();
    const controller = new AbortController();
    overviewController.current = controller;
    try {
      const data = await getResponseOverview(request, { signal: controller.signal });
      if (!controller.signal.aborted) setOverview(data);
    } catch (error) {
      if (!controller.signal.aborted) setOverviewError(error.message || 'دریافت آمار پاسخ‌نامه‌ها با خطا مواجه شد.');
    } finally {
      if (!controller.signal.aborted) setOverviewLoading(false);
    }
  }, [request]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Updates follow the awaited request.
    fetchOverview();
    return () => {
      overviewController.current?.abort();
      detailController.current?.abort();
    };
  }, [fetchOverview]);

  const refreshOverview = () => {
    setOverviewLoading(true);
    setOverviewError('');
    fetchOverview();
  };

  const lookup = async (event) => {
    event.preventDefault();
    detailController.current?.abort();
    setResponse(null);
    setQuestions(new Map());
    setDetailError('');
    setDetailLoading(false);
    setLoadingQuestions(false);
    const id = responseId.trim();
    if (!isResponseId(id)) {
      setDetailError('شناسه پاسخ‌نامه باید یک UUID معتبر باشد.');
      return;
    }
    const controller = new AbortController();
    detailController.current = controller;
    setDetailLoading(true);
    try {
      const data = await getResponse(request, id, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setResponse(data);
      setDetailLoading(false);
      if (data.answers.length && overview?.surveys.length) {
        setLoadingQuestions(true);
        const catalog = await getResponseQuestions(request, overview.surveys.map((survey) => survey.id), { signal: controller.signal });
        if (!controller.signal.aborted) setQuestions(catalog);
      }
    } catch (error) {
      if (!controller.signal.aborted) setDetailError(error.status === 404 ? 'پاسخ‌نامه‌ای با این شناسه یافت نشد.' : error.message || 'دریافت پاسخ‌نامه با خطا مواجه شد.');
    } finally {
      if (!controller.signal.aborted) {
        setDetailLoading(false);
        setLoadingQuestions(false);
      }
    }
  };

  const closeDetails = () => {
    detailController.current?.abort();
    setResponse(null);
    setLoadingQuestions(false);
    lookupInput.current?.focus();
  };

  const surveys = (overview?.surveys ?? []).filter((survey) => String(survey.title ?? '').toLocaleLowerCase().includes(surveySearch.trim().toLocaleLowerCase()));

  return (
    <div dir="rtl" className="mx-auto min-w-0 max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">پاسخ‌نامه‌ها</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">آمار پاسخ‌های ثبت‌شده را مرور کنید و جزئیات هر پاسخ‌نامه را با شناسه آن ببینید.</p></div>
        <button type="button" onClick={refreshOverview} disabled={overviewLoading} className={buttonClass}>{overviewLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}به‌روزرسانی آمار</button>
      </div>

      <section aria-label="جستجوی پاسخ‌نامه" className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <form onSubmit={lookup} className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-64">
            <label htmlFor="response-id" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">شناسه پاسخ‌نامه</label>
            <input ref={lookupInput} id="response-id" value={responseId} onChange={(event) => setResponseId(event.target.value)} dir="ltr" required autoComplete="off" spellCheck={false} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" aria-describedby="response-lookup-help" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
          </div>
          <button type="submit" className={buttonClass}>{detailLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}مشاهده پاسخ‌نامه</button>
        </form>
        <p id="response-lookup-help" className="mt-3 text-xs text-slate-500 dark:text-slate-400">برای مشاهده پاسخ‌ها و اطلاعات پاسخ‌دهنده، شناسه پاسخ‌نامه ثبت‌شده را وارد کنید.</p>
        {detailError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{detailError}</p>}
      </section>

      {detailLoading && <p role="status" className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 p-8 text-sm text-slate-500 dark:text-slate-400"><Loader2 size={18} className="animate-spin" />در حال دریافت پاسخ‌نامه...</p>}
      {response && <ResponseDetails key={response.id} response={response} questions={questions} loadingQuestions={loadingQuestions} onClose={closeDetails} />}

      {overviewError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><p className="flex items-start gap-2"><AlertTriangle size={18} className="shrink-0" />{overviewError}</p><button type="button" disabled={overviewLoading} onClick={refreshOverview} className="mt-2 font-semibold underline">تلاش مجدد</button></div>}
      {overviewLoading ? <p role="status" className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500 dark:text-slate-400"><Loader2 size={18} className="animate-spin" />در حال دریافت آمار...</p> : overview && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['totalResponses', 'کل پاسخ‌نامه‌ها'], ['answeredAnswers', 'پاسخ‌های دارای سطح'],
              ['skippedAnswers', 'بدون اطلاعات کافی'], ['unassignedResponses', 'پاسخ‌نامه‌های بدون پیمایش'],
            ].map(([key, label]) => <div key={key} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-primary-800">{responseNumber(overview.summary[key])}</p></div>)}
          </div>
          <section className="min-w-0 space-y-4" aria-labelledby="response-surveys-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 id="response-surveys-title" className="font-semibold text-slate-800">پاسخ‌نامه‌ها به تفکیک پیمایش</h3>
              <label className="min-w-0 text-xs text-slate-600 dark:text-slate-400">جستجوی پیمایش<input type="search" value={surveySearch} onChange={(event) => setSurveySearch(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" /></label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">در حال حاضر مرور پاسخ‌نامه‌های فردی با شناسه انجام می‌شود؛ آمار هر پیمایش در زیر آمده است.</p>
            {surveys.map((survey) => <article key={survey.id} className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><h4 className="break-words font-semibold text-slate-800">{survey.title}</h4><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">آخرین پاسخ: {responseDate(survey.lastSubmittedAt)}</p></div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">{responseNumber(survey.responseCount)} پاسخ‌نامه</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-right text-sm"><caption className="sr-only">آمار گروه‌های پاسخ‌دهنده {survey.title}</caption>
                  <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400"><tr>{['گروه پاسخ‌دهنده', 'پاسخ‌نامه‌ها', 'پاسخ‌های دارای سطح', 'بدون اطلاعات کافی'].map((label) => <th key={label} scope="col" className="whitespace-nowrap px-3 py-3">{label}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{(survey.audiences ?? []).map((audience) => <tr key={audience.role}><th scope="row" className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">{responseRoleLabel(audience.role)}</th><td className="px-3 py-3">{responseNumber(audience.responseCount)}</td><td className="px-3 py-3">{responseNumber(audience.answeredCount)}</td><td className="px-3 py-3">{responseNumber(audience.skippedCount)}</td></tr>)}</tbody>
                  <tfoot className="border-t border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"><tr><th scope="row" className="px-3 py-3">مجموع</th><td className="px-3 py-3">{responseNumber(survey.responseCount)}</td><td className="px-3 py-3">{responseNumber(survey.answeredCount)}</td><td className="px-3 py-3">{responseNumber(survey.skippedCount)}</td></tr></tfoot>
                </table>
              </div>
            </article>)}
            {!surveys.length && <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400"><FileText size={28} className="mx-auto mb-3" />{overview.surveys.length ? 'پیمایشی با این نام یافت نشد.' : 'هنوز پیمایشی ثبت نشده است.'}</div>}
          </section>
        </>
      )}
    </div>
  );
}
