import { useState } from 'react';
import * as XLSX from 'xlsx';
import { QUESTION_TYPE_OPTIONS } from '../data/questionTypes';

const emptyQuestion = { code: '', prompt: '', type: 'likert', options: '', levels: '' };

export default function AdminQuestionsPage() {
  const [question, setQuestion] = useState(emptyQuestion);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');

  const update = (key, value) => setQuestion((current) => ({ ...current, [key]: value }));

  const addQuestion = (event) => {
    event.preventDefault();
    if (!question.code.trim() || !question.prompt.trim()) return;
    setQuestions((current) => [...current, {
      code: question.code.trim(),
      prompt: question.prompt.trim(),
      type: question.type,
      ...(question.options ? { options: question.options.split('\n').map((item) => item.trim()).filter(Boolean) } : {}),
      ...(question.levels ? { levels: question.levels.split('\n').map((item) => item.trim()).filter(Boolean) } : {}),
    }]);
    setQuestion(emptyQuestion);
    setMessage('سؤال به پیش‌نویس اضافه شد.');
  };

  const importWorkbook = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
    const imported = rows.map((row, index) => ({
      code: String(row.code || row.Code || `imported-${index + 1}`),
      prompt: String(row.prompt || row.question || row.Question || ''),
      type: String(row.type || row.questionType || 'likert'),
      options: String(row.options || '').split('|').map((item) => item.trim()).filter(Boolean),
      levels: String(row.levels || '').split('|').map((item) => item.trim()).filter(Boolean),
    })).filter((item) => item.prompt);
    setQuestions((current) => [...current, ...imported]);
    setMessage(`${imported.length} سؤال از فایل وارد شد.`);
    event.target.value = '';
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h2 className="text-2xl font-bold text-slate-900">مدیریت سؤال‌ها</h2>
      <p className="mt-2 text-sm text-slate-500">نوع سؤال را تعیین کنید؛ مجموعه‌سؤال‌های SFO و WorldClass جدا باقی می‌مانند.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={addQuestion} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <input value={question.code} onChange={(e) => update('code', e.target.value)} placeholder="کد سؤال" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <textarea value={question.prompt} onChange={(e) => update('prompt', e.target.value)} placeholder="متن سؤال" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <select value={question.type} onChange={(e) => update('type', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {QUESTION_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <textarea value={question.options} onChange={(e) => update('options', e.target.value)} placeholder="گزینه‌ها (هر گزینه در یک خط)" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea value={question.levels} onChange={(e) => update('levels', e.target.value)} placeholder="سطوح/شرح لیکرت (هر سطح در یک خط)" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white">افزودن به پیش‌نویس</button>
        </form>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <label className="block text-sm font-semibold text-slate-700">ورود از Excel</label>
          <p className="mt-2 text-xs leading-6 text-slate-500">ستون‌های پیشنهادی: code، prompt/question، type، options و levels. چند گزینه را با | جدا کنید.</p>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={importWorkbook} className="mt-4 block w-full text-sm" />
          {message && <p className="mt-4 text-sm text-primary-800">{message}</p>}
          <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-xs" dir="ltr">{JSON.stringify(questions, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
