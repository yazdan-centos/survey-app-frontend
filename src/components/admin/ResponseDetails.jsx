import { useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';
import { responseDate, responseNumber, responseRoleLabel } from '../../utils/responseDisplay';

const PAGE_SIZE = 10;

export default function ResponseDetails({ response, questions, loadingQuestions, onClose }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const numericAnswers = response.answers.filter((answer) => !answer.skipped && Number.isFinite(answer.selectedLevel));
  const skippedCount = response.answers.filter((answer) => answer.skipped).length;
  const average = numericAnswers.length ? numericAnswers.reduce((sum, answer) => sum + answer.selectedLevel, 0) / numericAnswers.length : null;
  const filtered = useMemo(() => response.answers.filter((answer) => {
    const question = questions.get(answer.questionId);
    const matchesFilter = filter === 'all' || (filter === 'skipped' ? answer.skipped : !answer.skipped);
    const term = search.trim().toLocaleLowerCase();
    return matchesFilter && [answer.questionId, question?.text, question?.code, question?.criterion]
      .some((value) => String(value ?? '').toLocaleLowerCase().includes(term));
  }), [response, questions, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const missingQuestions = response.answers.some((answer) => !questions.has(answer.questionId));

  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(response, null, 2)], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `response-${response.id}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="min-w-0 space-y-5 rounded-2xl border border-primary-200 bg-white dark:bg-slate-900 p-4 sm:p-6" aria-labelledby="response-detail-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="response-detail-title" className="font-bold text-slate-900 dark:text-slate-100">جزئیات پاسخ‌نامه</h3>
          <p dir="ltr" className="mt-1 break-all text-left text-xs text-slate-500 dark:text-slate-400">{response.id}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"><Download size={14} />دریافت فایل JSON</button>
          <button type="button" onClick={onClose} aria-label="بستن جزئیات پاسخ‌نامه" className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
      </div>
      <dl className="grid gap-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['پاسخ‌دهنده', response.respondentUsername || '—'],
          ['گروه پاسخ‌دهنده', responseRoleLabel(response.role)],
          ['تاریخ ارسال', responseDate(response.submittedAt)],
          ['آخرین ویرایش', responseDate(response.updatedAt)],
          ['تعداد پاسخ‌ها', responseNumber(response.answers.length)],
          ['پاسخ‌های عددی', responseNumber(numericAnswers.length)],
          ['بدون اطلاعات کافی', responseNumber(skippedCount)],
          ['میانگین پاسخ‌های عددی', responseNumber(average)],
        ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt><dd className="mt-1 break-words font-medium text-slate-800">{value}</dd></div>)}
      </dl>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800">اطلاعات دموگرافی</h4>
        {response.demographics.length ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {response.demographics.map((item, index) => <div key={item.id ?? `${item.fieldKey}-${index}`} className="min-w-0 rounded-lg border border-slate-100 dark:border-slate-800 p-3 text-sm"><dt className="break-words text-slate-500 dark:text-slate-400">{item.fieldKey}</dt><dd className="mt-1 break-words text-slate-800">{item.value ?? '—'}</dd></div>)}
          </dl>
        ) : <p className="text-sm text-slate-500 dark:text-slate-400">اطلاعات دموگرافی ثبت نشده است.</p>}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800">پاسخ سؤال‌ها</h4>
        <div className="mb-3 flex flex-wrap gap-3">
          <label className="min-w-0 flex-1 basis-56 text-xs text-slate-600 dark:text-slate-400">جستجوی سؤال
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="متن، کد یا شناسه سؤال" className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm" />
          </label>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <label htmlFor="response-answer-filter">نوع پاسخ</label>
            <select id="response-answer-filter" value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }} className="mt-1 block rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
              <option value="all">همه پاسخ‌ها</option><option value="answered">دارای پاسخ</option><option value="skipped">بدون اطلاعات کافی</option>
            </select>
          </div>
        </div>
        {loadingQuestions ? <p role="status" className="mb-3 text-xs text-slate-500 dark:text-slate-400">در حال دریافت متن سؤال‌ها...</p> : missingQuestions && <p className="mb-3 text-xs text-amber-700">متن برخی سؤال‌ها در دسترس نیست؛ شناسه آن‌ها نمایش داده می‌شود.</p>}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-right text-sm">
            <caption className="sr-only">پاسخ‌های ثبت‌شده</caption>
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400"><tr><th scope="col" className="px-4 py-3">سؤال</th><th scope="col" className="px-4 py-3">پاسخ ثبت‌شده</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((answer) => {
                const question = questions.get(answer.questionId);
                const level = question?.levels?.find((item) => item.levelNumber === answer.selectedLevel);
                return <tr key={answer.id ?? answer.questionId}>
                  <td className="min-w-44 px-4 py-3 text-slate-700 dark:text-slate-300"><p className="break-words">{question?.text || question?.criterion || 'شناسه سؤال'}</p><p dir="auto" className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">{question?.code || answer.questionId}</p></td>
                  <td className="min-w-36 px-4 py-3"><span className={`inline-block rounded-lg px-2 py-1 text-xs ${answer.skipped ? 'bg-amber-50 text-amber-800' : 'bg-primary-50 text-primary-800'}`}>{answer.skipped ? 'اطلاعات کافی ندارم' : answer.selectedLevel == null ? 'پاسخ ثبت نشده' : `سطح ${responseNumber(answer.selectedLevel)}`}</span>{!answer.skipped && level?.description && <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{level.description}</p>}</td>
                </tr>;
              })}
              {!filtered.length && <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">{response.answers.length ? 'پاسخی با این مشخصات یافت نشد.' : 'پاسخی ثبت نشده است.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p role="status">{responseNumber(filtered.length)} پاسخ · صفحه {responseNumber(currentPage)} از {responseNumber(pageCount)}</p>
          <div className="flex gap-3"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">قبلی</button><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">بعدی</button></div>
        </div>
      </div>
    </section>
  );
}
