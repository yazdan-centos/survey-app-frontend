import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminCollection } from '../hooks/useAdminCollection';
import { useHttp } from '../hooks/useHttp';
import {
  demographicQuestionService,
  downloadDemographicQuestionsTemplate,
  importDemographicQuestionsFile,
  KNOWN_GROUP_KEYS,
  QUESTION_TYPES,
} from '../services/adminDemographicQuestionService';

const emptyForm = { groupKey: '', question: '', type: '', displayOrder: '0', options: [''] };
const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';
const buttonClass = 'rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-50';

function typeLabel(type) {
  return QUESTION_TYPES.find((option) => option.value === (type || ''))?.label || type;
}

/**
 * Admin CRUD screen for /api/demographic-questions — the per-role profile
 * questions respondents answer on ProfilePage before starting the survey.
 * Mirrors AdminDimensionsPage/AdminCriteriaPage (list + side form, same
 * Tailwind theme tokens) and adds the backend's Excel template/import flow.
 */
export default function DemographicQuestionsPage() {
  const collection = useAdminCollection(demographicQuestionService);
  const request = useHttp();
  const [searchParams, setSearchParams] = useSearchParams();
  const groupKeyFilter = searchParams.get('groupKey') || '';
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm, groupKey: groupKeyFilter });
  const [importBusy, setImportBusy] = useState(false);
  const [importNotice, setImportNotice] = useState(null);

  const disabled = collection.loading || collection.busy || Boolean(collection.loadError);

  const knownLabels = new Map(KNOWN_GROUP_KEYS.map((group) => [group.value, group.label]));
  const groupKeysInUse = Array.from(new Set(collection.items.map((item) => item.groupKey))).sort((a, b) => a.localeCompare(b, 'fa'));
  const groupKeyOptions = Array.from(new Set([...KNOWN_GROUP_KEYS.map((group) => group.value), ...groupKeysInUse]));

  const visibleQuestions = collection.items
    .filter((item) => !groupKeyFilter || item.groupKey === groupKeyFilter)
    .sort((first, second) => first.groupKey.localeCompare(second.groupKey, 'fa') || first.displayOrder - second.displayOrder);

  const resetForm = () => { setEditingId(null); setForm({ ...emptyForm, groupKey: groupKeyFilter }); };

  const updateOption = (index, value) => setForm((current) => ({
    ...current,
    options: current.options.map((option, i) => (i === index ? value : option)),
  }));
  const addOption = () => setForm((current) => ({ ...current, options: [...current.options, ''] }));
  const removeOption = (index) => setForm((current) => ({ ...current, options: current.options.filter((_, i) => i !== index) }));

  const submit = async (event) => {
    event.preventDefault();
    const groupKey = form.groupKey.trim();
    if (await collection.save(form, editingId)) {
      if (groupKeyFilter && groupKeyFilter !== groupKey) setSearchParams({ groupKey });
      setEditingId(null);
      setForm({ ...emptyForm, groupKey: groupKeyFilter || groupKey });
    }
  };

  const edit = (question) => {
    setEditingId(question.id);
    setForm({
      groupKey: question.groupKey,
      question: question.question,
      type: question.type || '',
      displayOrder: String(question.displayOrder),
      options: question.options.length ? question.options : [''],
    });
  };

  const remove = async (question) => {
    if (!window.confirm(`آیا از حذف سؤال «${question.question}» مطمئن هستید؟`)) return;
    if (await collection.remove(question.id) && editingId === question.id) resetForm();
  };

  const handleTemplateDownload = async () => {
    setImportBusy(true);
    setImportNotice(null);
    try {
      await downloadDemographicQuestionsTemplate(request);
    } catch (error) {
      setImportNotice({ error: true, text: error.message });
    } finally {
      setImportBusy(false);
    }
  };

  const handleFileImport = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setImportBusy(true);
    setImportNotice(null);
    try {
      const imported = await importDemographicQuestionsFile(request, file);
      setImportNotice({ text: `${imported.length} سؤال با موفقیت وارد شد.` });
      collection.reload();
    } catch (error) {
      setImportNotice({ error: true, text: error.message });
    } finally {
      input.value = '';
      setImportBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-900 dark:text-slate-100 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">مدیریت سؤال‌های دموگرافی</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            سؤال‌های پیش از پیمایش را برای هر گروه پاسخ‌دهنده (مدیران، هیأت مدیره، ذی‌نفعان) مدیریت کنید.
          </p>
        </div>
        <button type="button" className={buttonClass} disabled={collection.loading || collection.busy} onClick={collection.reload}>
          به‌روزرسانی فهرست
        </button>
      </div>

      {collection.notice && (
        <p role={collection.notice.error ? 'alert' : 'status'} className={`mt-4 rounded-lg p-3 text-sm ${collection.notice.error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {collection.notice.text}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <label className="mb-3 block text-sm">
            فیلتر گروه
            <select
              value={groupKeyFilter}
              disabled={disabled}
              className={inputClass}
              onChange={(event) => {
                const groupKey = event.target.value;
                setSearchParams(groupKey ? { groupKey } : {});
                if (!editingId) setForm((current) => ({ ...current, groupKey }));
              }}
            >
              <option value="">همه گروه‌ها</option>
              {groupKeyOptions.map((key) => (
                <option key={key} value={key}>{knownLabels.get(key) || key}</option>
              ))}
            </select>
          </label>

          {collection.loadError ? (
            <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
              {collection.loadError}
              <button type="button" disabled={collection.busy} onClick={collection.reload} className="mr-3 underline">تلاش مجدد</button>
            </div>
          ) : collection.loading ? (
            <p role="status" className="p-8 text-center">در حال دریافت سؤال‌های دموگرافی…</p>
          ) : !visibleQuestions.length ? (
            <p className="rounded-2xl border border-slate-200 p-8 text-center dark:border-slate-700">سؤالی برای نمایش وجود ندارد.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {['گروه', 'سؤال', 'نوع', 'ترتیب', 'گزینه‌ها', 'عملیات'].map((heading) => (
                      <th key={heading} scope="col" className="px-4 py-3">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleQuestions.map((question) => (
                    <tr key={question.id} className="border-t border-slate-100 align-top dark:border-slate-800">
                      <td className="px-4 py-3"><span dir="ltr">{question.groupKey}</span></td>
                      <td className="max-w-sm break-words px-4 py-3 whitespace-pre-wrap">{question.question}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{typeLabel(question.type)}</td>
                      <td className="px-4 py-3">{question.displayOrder}</td>
                      <td className="max-w-xs break-words px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{question.options.join('، ')}</td>
                      <td className="px-4 py-3">
                        <div className="flex w-max flex-nowrap items-center gap-2 whitespace-nowrap">
                          <button type="button" disabled={disabled} className={buttonClass} aria-label={`ویرایش ${question.question}`} onClick={() => edit(question)}>ویرایش</button>
                          <button type="button" disabled={disabled} className={`${buttonClass} text-rose-600 dark:text-rose-400`} aria-label={`حذف ${question.question}`} onClick={() => remove(question)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <form onSubmit={submit} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 font-bold">{editingId ? 'ویرایش سؤال دموگرافی' : 'سؤال دموگرافی جدید'}</h3>
            <fieldset disabled={disabled} className="space-y-4">
              <label className="block text-sm">
                کلید گروه
                <input
                  name="groupKey"
                  dir="ltr"
                  list="demographic-group-keys"
                  value={form.groupKey}
                  required
                  maxLength={30}
                  className={inputClass}
                  onChange={(event) => setForm({ ...form, groupKey: event.target.value })}
                />
                <datalist id="demographic-group-keys">
                  {groupKeyOptions.map((key) => (
                    <option key={key} value={key}>{knownLabels.get(key) || key}</option>
                  ))}
                </datalist>
              </label>

              <label className="block text-sm">
                متن سؤال
                <textarea
                  name="question"
                  value={form.question}
                  required
                  rows={3}
                  className={inputClass}
                  onChange={(event) => setForm({ ...form, question: event.target.value })}
                />
              </label>

              <label className="block text-sm">
                نوع نمایش
                <select
                  name="type"
                  value={form.type}
                  className={inputClass}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                >
                  {QUESTION_TYPES.map((option) => (
                    <option key={option.value || 'radio'} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                ترتیب نمایش
                <input
                  name="displayOrder"
                  type="number"
                  step="1"
                  min="0"
                  value={form.displayOrder}
                  required
                  className={inputClass}
                  onChange={(event) => setForm({ ...form, displayOrder: event.target.value })}
                />
              </label>

              <div>
                <p className="text-sm font-semibold">گزینه‌ها</p>
                <div className="mt-2 space-y-2">
                  {form.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={option}
                        placeholder={`گزینه ${index + 1}`}
                        className={`${inputClass} mt-0`}
                        onChange={(event) => updateOption(index, event.target.value)}
                      />
                      {form.options.length > 1 && (
                        <button type="button" className="text-sm text-rose-600 dark:text-rose-400" onClick={() => removeOption(index)}>حذف</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="mt-2 block text-sm text-primary-800 dark:text-primary-300" onClick={addOption}>افزودن گزینه</button>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={disabled} className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {collection.busy ? 'در حال انجام…' : 'ذخیره سؤال'}
                </button>
                {editingId && <button type="button" className={buttonClass} onClick={resetForm}>انصراف</button>}
              </div>
            </fieldset>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-sm font-semibold">ورود گروهی از اکسل</h3>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              ستون‌های groupKey، question، type، displayOrder و option1 تا option13 را در فایل قالب تکمیل کنید. هر ردیف یک سؤال است.
            </p>
            <button type="button" onClick={handleTemplateDownload} disabled={importBusy} className={`${buttonClass} mt-3`}>دانلود قالب اکسل</button>
            <label className="mt-4 block text-sm">
              فایل سؤال‌های دموگرافی
              <input type="file" accept=".xlsx" disabled={importBusy} onChange={handleFileImport} className="mt-2 block w-full text-sm" />
            </label>
            {importNotice && (
              <p role={importNotice.error ? 'alert' : 'status'} className={`mt-3 text-sm ${importNotice.error ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {importNotice.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
