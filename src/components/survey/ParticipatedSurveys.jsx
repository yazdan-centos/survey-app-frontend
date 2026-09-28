import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useHttp } from '../../hooks/useHttp';
import { checkSurveyResultsAccess, getParticipatedSurveys } from '../../services/surveyService';
import { getResponse, getResponseQuestions } from '../../services/responseService';
import { responseDate } from '../../utils/responseDisplay';
import ResponseDetails from '../admin/ResponseDetails';

const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50';

// History of surveys the signed-in user has already submitted a response for.
export default function ParticipatedSurveys() {
    const request = useHttp();
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState(null);
    const [pendingId, setPendingId] = useState(null);
    const [viewError, setViewError] = useState('');
    const [detail, setDetail] = useState(null); // { response, questions, loadingQuestions }
    const viewController = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        getParticipatedSurveys(request, { signal: controller.signal })
            .then((items) => { if (!controller.signal.aborted) setResult({ request, revision, items }); })
            .catch((error) => {
                if (!controller.signal.aborted) setResult({ request, revision, items: [], error: error.message || 'دریافت سوابق پیمایش‌ها با خطا مواجه شد.' });
            });
        return () => controller.abort();
    }, [request, revision]);

    useEffect(() => () => viewController.current?.abort(), []);

    const current = result?.request === request && result?.revision === revision ? result : null;

    // The results endpoint only validates access; the answers themselves come from
    // the same response lookup the app already uses for response details.
    const viewResults = async (item) => {
        viewController.current?.abort();
        const controller = new AbortController();
        viewController.current = controller;
        setPendingId(item.responseId);
        setViewError('');
        setDetail(null);
        try {
            await checkSurveyResultsAccess(request, item.survey.id, { signal: controller.signal });
            const response = await getResponse(request, item.responseId, { signal: controller.signal });
            if (controller.signal.aborted) return;
            setDetail({ response, questions: new Map(), loadingQuestions: response.answers.length > 0 });
            if (response.answers.length) {
                const questions = await getResponseQuestions(request, [item.survey.id], { signal: controller.signal });
                if (!controller.signal.aborted) setDetail({ response, questions, loadingQuestions: false });
            }
        } catch (error) {
            if (controller.signal.aborted) return;
            setViewError(error.status === 403
                ? 'شما به نتایج این پیمایش دسترسی ندارید.'
                : error.status === 404
                    ? 'پیمایش یا پاسخ‌نامه موردنظر یافت نشد.'
                    : error.message || 'دریافت نتایج با خطا مواجه شد.');
            setDetail(null);
        } finally {
            if (!controller.signal.aborted) setPendingId(null);
        }
    };

    const closeDetails = () => {
        viewController.current?.abort();
        setDetail(null);
        setPendingId(null);
    };

    if (!current) return null;

    if (current.error) {
        return (
            <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    <p className="flex items-start gap-2"><AlertTriangle size={18} className="shrink-0" />{current.error}</p>
                    <button type="button" onClick={() => setRevision((value) => value + 1)} className="mt-2 font-semibold underline">تلاش مجدد</button>
                </div>
            </div>
        );
    }

    if (!current.items.length) return null;

    return (
        <div className="mx-auto max-w-3xl space-y-4 px-4 pb-8 sm:px-6">
            <section aria-labelledby="participated-surveys-title" className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
                <h3 id="participated-surveys-title" className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">پیمایش‌های تکمیل‌شده</h3>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {current.items.map((item) => (
                        <li key={item.responseId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                                <p className="break-words font-medium text-slate-900 dark:text-slate-100">{item.survey?.title || '—'}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    نسخه {item.survey?.version || '—'} · تاریخ ارسال: {responseDate(item.submittedAt)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => viewResults(item)}
                                disabled={!item.survey?.id || pendingId !== null}
                                className={buttonClass}
                            >
                                {pendingId === item.responseId && <Loader2 size={14} className="animate-spin" />}
                                مشاهده نتایج
                            </button>
                        </li>
                    ))}
                </ul>
                {viewError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{viewError}</p>}
            </section>
            {detail && (
                <ResponseDetails
                    key={detail.response.id}
                    response={detail.response}
                    questions={detail.questions}
                    loadingQuestions={detail.loadingQuestions}
                    onClose={closeDetails}
                />
            )}
        </div>
    );
}