import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminCollection } from '../hooks/useAdminCollection';
import { dimensionService } from '../services/adminStructureService';

const emptyForm = { key: '', label: '', displayOrder: '0' };
const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';
const buttonClass = 'rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-50';

export default function AdminDimensionsPage() {
  const collection = useAdminCollection(dimensionService);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const disabled = collection.loading || collection.busy || Boolean(collection.loadError);
  const dimensions = [...collection.items].sort((first, second) => first.displayOrder - second.displayOrder || first.label.localeCompare(second.label, 'fa'));
  const resetForm = () => { setEditingId(null); setForm(emptyForm); };

  const submit = async (event) => {
    event.preventDefault();
    if (await collection.save(form, editingId)) resetForm();
  };

  const remove = async (dimension) => {
    if (!window.confirm(`آیا از حذف بُعد «${dimension.label}» مطمئن هستید؟`)) return;
    if (await collection.remove(dimension.id) && editingId === dimension.id) resetForm();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-900 dark:text-slate-100 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">مدیریت ابعاد</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">کلید، عنوان و ترتیب نمایش ابعاد را مدیریت کنید. فقط ابعاد بدون معیار قابل حذف هستند.</p>
        </div>
        <button type="button" className={buttonClass} disabled={collection.loading || collection.busy} onClick={collection.reload}>به‌روزرسانی فهرست</button>
      </div>
      {collection.notice && <p role={collection.notice.error ? 'alert' : 'status'} className={`mt-4 rounded-lg p-3 text-sm ${collection.notice.error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{collection.notice.text}</p>}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {collection.loadError ? <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">{collection.loadError}<button type="button" onClick={collection.reload} className="mr-3 underline">تلاش مجدد</button></div>
            : collection.loading ? <p role="status" className="p-8 text-center">در حال دریافت ابعاد…</p>
            : !dimensions.length ? <p className="rounded-2xl border border-slate-200 p-8 text-center dark:border-slate-700">هنوز بُعدی ثبت نشده است.</p>
            : <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800"><tr>{['عنوان', 'کلید', 'ترتیب نمایش', 'عملیات'].map((heading) => <th key={heading} scope="col" className="px-4 py-3">{heading}</th>)}</tr></thead>
                <tbody>{dimensions.map((dimension) => <tr key={dimension.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{dimension.label}</td>
                  <td className="px-4 py-3"><span dir="ltr">{dimension.key}</span></td>
                  <td className="px-4 py-3">{dimension.displayOrder}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-2">
                    <button type="button" disabled={disabled} className={buttonClass} aria-label={`ویرایش ${dimension.label}`} onClick={() => { setEditingId(dimension.id); setForm({ key: dimension.key, label: dimension.label, displayOrder: String(dimension.displayOrder) }); }}>ویرایش</button>
                    <button type="button" disabled={disabled} className={`${buttonClass} text-rose-600 dark:text-rose-400`} aria-label={`حذف ${dimension.label}`} onClick={() => remove(dimension)}>حذف</button>
                    <Link className="self-center text-primary-700 underline dark:text-primary-300" to={`/admin/criteria?dimensionId=${encodeURIComponent(dimension.id)}`}>معیارها</Link>
                  </div></td>
                </tr>)}</tbody>
              </table>
            </div>}
        </div>
        <form onSubmit={submit} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-4 font-bold">{editingId ? 'ویرایش بُعد' : 'بُعد جدید'}</h3>
          <fieldset disabled={disabled} className="space-y-4">
            <label className="block text-sm">کلید بُعد<input name="key" dir="ltr" value={form.key} required maxLength={80} className={inputClass} onChange={(event) => setForm({ ...form, key: event.target.value })} /></label>
            <label className="block text-sm">عنوان بُعد<input name="label" value={form.label} required maxLength={200} className={inputClass} onChange={(event) => setForm({ ...form, label: event.target.value })} /></label>
            <label className="block text-sm">ترتیب نمایش<input name="displayOrder" type="number" step="1" min="-2147483648" max="2147483647" value={form.displayOrder} required className={inputClass} onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} /></label>
            <div className="flex gap-2">
              <button type="submit" disabled={disabled} className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{collection.busy ? 'در حال انجام…' : 'ذخیره بُعد'}</button>
              {editingId && <button type="button" className={buttonClass} onClick={resetForm}>انصراف</button>}
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
