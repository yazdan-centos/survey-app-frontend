import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useHttp } from '../hooks/useHttp';
import { listSurveys } from '../services/adminSurveyService';
import { createQuestion, parseQuestionRows, QUESTION_IMPORT_HEADERS, QUESTION_ROLES } from '../services/adminQuestionService';

const emptyQuestion = { code: '', text: '', role: 'MANAGERS', levels: [] };
const inputClass = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm';
const buttonClass = 'rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';

function downloadImportTemplate() {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([QUESTION_IMPORT_HEADERS]);
  sheet['!cols'] = [16, 60, 20, 60, 16, 16].map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(workbook, sheet, 'Questions');
  const instructions = XLSX.utils.aoa_to_sheet([
    ['ستون', 'راهنما'],
    ['code / text', 'کد و متن سؤال؛ هر سطح در یک ردیف جدا با تکرار کد، متن و نقش سؤال.'],
    ['role', QUESTION_ROLES.map(({ value }) => value).join(' | ')],
    ['level_title', 'شرح سطح'],
    ['level_score / level_order', 'امتیاز یکتا برای هر سطح و ترتیب نمایش؛ هر دو عدد صحیح.'],
    ['surveyId', 'پیمایش را پیش از ورود فایل در صفحه انتخاب کنید؛ همه سؤال‌های فایل به همان پیمایش تعلق دارند.'],
    ['راهنما', 'نام و ترتیب ستون‌ها را تغییر ندهید. فقط اولین برگه خوانده می‌شود. برای سؤال بدون سطح، سه ستون سطح را خالی بگذارید.'],
  ]);
  instructions['!cols'] = [{ wch: 28 }, { wch: 110 }];
  XLSX.utils.book_append_sheet(workbook, instructions, 'Instructions');
  XLSX.writeFile(workbook, 'questions-import-template.xlsx');
}

export default function AdminQuestionsPage() {
  const request = useHttp();
  const [surveys, setSurveys] = useState([]);
  const [surveyId, setSurveyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [question, setQuestion] = useState(emptyQuestion);
  const [pendingImport, setPendingImport] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    listSurveys(request, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setSurveys(data); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [request, reload]);

  const update = (key, value) => setQuestion((current) => ({ ...current, [key]: value }));
  const updateLevel = (index, key, value) => setQuestion((current) => ({ ...current,
    levels: current.levels.map((level, i) => i === index ? { ...level, [key]: value } : level),
  }));

  const addQuestion = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      await createQuestion(request, { ...question, surveyId });
      setQuestion(emptyQuestion);
      setNotice({ text: 'سؤال با موفقیت ذخیره شد.' });
    } catch (error) {
      setNotice({ error: true, text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const readWorkbook = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    setNotice(null);
    setPendingImport([]);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
      setPendingImport(parseQuestionRows(rows, surveyId));
    } catch (error) {
      setNotice({ error: true, text: error.message });
    } finally {
      input.value = '';
      setBusy(false);
    }
  };

  const saveImport = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    let saved = 0;
    try {
      for (const item of pendingImport) {
        await createQuestion(request, item);
        saved++;
      }
      setNotice({ text: `${saved} سؤال با موفقیت ذخیره شد.` });
    } catch (error) {
      setNotice({ error: true, text: `${saved} سؤال ذخیره شد؛ ذخیره سؤال «${pendingImport[saved].code}» ناموفق بود: ${error.message}` });
    } finally {
      setPendingImport((current) => current.slice(saved));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">مدیریت سؤال‌ها</h2>
      <label className="mt-5 block text-sm font-semibold" htmlFor="question-survey">پیمایش</label>
      <select id="question-survey" name="surveyId" className={`${inputClass} mt-2`} value={surveyId} disabled={loading || busy} required onChange={(event) => {
        setSurveyId(event.target.value);
        setPendingImport([]);
        setNotice(null);
      }}>
        <option value="">{loading ? 'در حال دریافت پیمایش‌ها…' : 'پیمایش را انتخاب کنید'}</option>
        {surveys.map((survey) => <option key={survey.id} value={survey.id}>{survey.title} ({survey.version})</option>)}
      </select>
      {loadError && <div className="mt-2 text-sm text-red-600" role="alert">{loadError} <button type="button" onClick={() => { setLoading(true); setLoadError(''); setReload((value) => value + 1); }}>تلاش مجدد</button></div>}
      {!loading && !loadError && !surveys.length && <p className="mt-2 text-sm">ابتدا یک پیمایش در بخش مدیریت پیمایش‌ها ایجاد کنید.</p>}
      {notice && <p role={notice.error ? 'alert' : 'status'} className={`mt-4 text-sm ${notice.error ? 'text-red-600' : 'text-green-700 dark:text-green-400'}`}>{notice.text}</p>}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={addQuestion} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <fieldset disabled={busy || !surveyId} className="space-y-4">
            <label className="block text-sm">کد سؤال<input name="code" value={question.code} onChange={(event) => update('code', event.target.value)} className={inputClass} required /></label>
            <label className="block text-sm">متن سؤال<textarea name="text" value={question.text} onChange={(event) => update('text', event.target.value)} rows={3} className={inputClass} required /></label>
            <label className="block text-sm">نقش پاسخ‌دهنده<select name="role" value={question.role} onChange={(event) => update('role', event.target.value)} className={inputClass} required>
              {QUESTION_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select></label>
            <p className="text-sm font-semibold">سطوح پاسخ (اختیاری)</p>
            {question.levels.map((level, index) => <div key={index} className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <label className="block text-sm">شرح سطح {index + 1}<textarea value={level.title} onChange={(event) => updateLevel(index, 'title', event.target.value)} className={inputClass} required /></label>
              <label className="block text-sm">امتیاز<input type="number" step="1" value={level.score} onChange={(event) => updateLevel(index, 'score', event.target.value)} className={inputClass} required /></label>
              <label className="block text-sm">ترتیب<input type="number" step="1" value={level.levelOrder} onChange={(event) => updateLevel(index, 'levelOrder', event.target.value)} className={inputClass} required /></label>
              <button type="button" className="text-sm text-red-600" onClick={() => update('levels', question.levels.filter((_, i) => i !== index))}>حذف سطح {index + 1}</button>
            </div>)}
            <button type="button" className="block text-sm text-primary-800 dark:text-primary-300" onClick={() => {
              const nextScore = Math.max(0, ...question.levels.map((level) => Number(level.score) || 0)) + 1;
              update('levels', [...question.levels, { title: '', score: nextScore, levelOrder: question.levels.length + 1 }]);
            }}>افزودن سطح</button>
            <button type="submit" disabled={busy || !surveyId} className={buttonClass}>{busy ? 'در حال پردازش…' : 'ذخیره سؤال'}</button>
          </fieldset>
        </form>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold">ورود از Excel</h3>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">همه سؤال‌ها برای پیمایش انتخاب‌شده ذخیره می‌شوند. هر سطح را در یک ردیف با کد، متن و نقش تکراری وارد کنید. نام و ترتیب ستون‌های قالب را حفظ کنید.</p>
          <button type="button" onClick={downloadImportTemplate} className={`${buttonClass} mt-3`}>دانلود قالب Excel سؤال‌ها</button>
          <label className="mt-4 block text-sm">فایل سؤال‌ها<input type="file" accept=".xlsx" disabled={busy || !surveyId} onChange={readWorkbook} className="mt-2 block w-full text-sm" /></label>
          {pendingImport.length > 0 && <>
            <p className="mt-4 text-sm">{pendingImport.length} سؤال آماده ذخیره است.</p>
            <button type="button" disabled={busy} onClick={saveImport} className={`${buttonClass} mt-3`}>ذخیره سؤال‌های فایل</button>
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-left text-xs" dir="ltr">{JSON.stringify(pendingImport, null, 2)}</pre>
          </>}
        </div>
      </div>
    </div>
  );
}
