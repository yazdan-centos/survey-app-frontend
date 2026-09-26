import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAdminCollection } from '../hooks/useAdminCollection';
import { criterionService, dimensionService } from '../services/adminStructureService';

const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';
const buttonClass = 'rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-50';

export default function AdminCriteriaPage() {
  const criteria = useAdminCollection(criterionService);
  const dimensions = useAdminCollection(dimensionService);
  const [searchParams, setSearchParams] = useSearchParams();
  const dimensionFilter = searchParams.get('dimensionId') || '';
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', dimensionId: dimensionFilter });
  const loading = criteria.loading || dimensions.loading;
  const loadError = criteria.loadError || dimensions.loadError;
  const disabled = loading || criteria.busy || Boolean(loadError);
  const orderedDimensions = [...dimensions.items].sort((first, second) => first.displayOrder - second.displayOrder || first.label.localeCompare(second.label, 'fa'));
  const dimensionNames = new Map(dimensions.items.map((dimension) => [dimension.id, dimension.label]));
  const visibleCriteria = criteria.items.filter((criterion) => !dimensionFilter || criterion.dimensionId === dimensionFilter)
    .sort((first, second) => first.name.localeCompare(second.name, 'fa'));
  const resetForm = () => { setEditingId(null); setForm({ name: '', dimensionId: dimensionFilter }); };
  const reload = () => { criteria.reload(); dimensions.reload(); };

  const submit = async (event) => {
    event.preventDefault();
    if (!dimensionNames.has(form.dimensionId)) return;
    if (await criteria.save(form, editingId)) {
      if (dimensionFilter && dimensionFilter !== form.dimensionId) setSearchParams({ dimensionId: form.dimensionId });
      setEditingId(null);
      setForm({ name: '', dimensionId: form.dimensionId });
    }
  };

  const remove = async (criterion) => {
    if (!window.confirm(`آیا از حذف معیار «${criterion.name}» مطمئن هستید؟`)) return;
    if (await criteria.remove(criterion.id) && editingId === criterion.id) resetForm();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-900 dark:text-slate-100 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">مدیریت معیارها</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">معیارها را ایجاد و ویرایش کنید و بُعد هر معیار را تعیین کنید. فقط معیارهای بدون سؤال قابل حذف هستند.</p>
        </div>
        <button type="button" className={buttonClass} disabled={loading || criteria.busy} onClick={reload}>به‌روزرسانی فهرست</button>
      </div>
      {criteria.notice && <p role={criteria.notice.error ? 'alert' : 'status'} className={`mt-4 rounded-lg p-3 text-sm ${criteria.notice.error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{criteria.notice.text}</p>}
      {!loading && !loadError && !dimensions.items.length && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">ابتدا یک بُعد ایجاد کنید. <Link to="/admin/dimensions" className="underline">مدیریت ابعاد</Link></p>}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <label className="mb-3 block text-sm">فیلتر بُعد
            <select value={dimensionFilter} disabled={disabled} className={inputClass} onChange={(event) => {
              const dimensionId = event.target.value;
              setSearchParams(dimensionId ? { dimensionId } : {});
              if (!editingId) setForm((current) => ({ ...current, dimensionId }));
            }}>
              <option value="">همه ابعاد</option>
              {dimensionFilter && !dimensionNames.has(dimensionFilter) && <option value={dimensionFilter}>بُعد انتخاب‌شده در دسترس نیست</option>}
              {orderedDimensions.map((dimension) => <option key={dimension.id} value={dimension.id}>{dimension.label}</option>)}
            </select>
          </label>
          {loadError ? <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">{loadError}<button type="button" disabled={criteria.busy} onClick={reload} className="mr-3 underline">تلاش مجدد</button></div>
            : loading ? <p role="status" className="p-8 text-center">در حال دریافت معیارها و ابعاد…</p>
            : !visibleCriteria.length ? <p className="rounded-2xl border border-slate-200 p-8 text-center dark:border-slate-700">معیاری برای نمایش وجود ندارد.</p>
            : <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800"><tr>{['نام معیار', 'بُعد', 'عملیات'].map((heading) => <th key={heading} scope="col" className="px-4 py-3">{heading}</th>)}</tr></thead>
                <tbody>{visibleCriteria.map((criterion) => <tr key={criterion.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{criterion.name}</td>
                  <td className="px-4 py-3">{dimensionNames.get(criterion.dimensionId) || criterion.dimensionId}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-2">
                    <button type="button" disabled={disabled} className={buttonClass} aria-label={`ویرایش ${criterion.name}`} onClick={() => { setEditingId(criterion.id); setForm({ name: criterion.name, dimensionId: criterion.dimensionId }); }}>ویرایش</button>
                    <button type="button" disabled={disabled} className={`${buttonClass} text-rose-600 dark:text-rose-400`} aria-label={`حذف ${criterion.name}`} onClick={() => remove(criterion)}>حذف</button>
                  </div></td>
                </tr>)}</tbody>
              </table>
            </div>}
        </div>
        <form onSubmit={submit} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-4 font-bold">{editingId ? 'ویرایش معیار' : 'معیار جدید'}</h3>
          <fieldset disabled={disabled || !dimensions.items.length} className="space-y-4">
            <label className="block text-sm">نام معیار<input name="name" value={form.name} required maxLength={200} className={inputClass} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="block text-sm">بُعد<select name="dimensionId" value={form.dimensionId} required className={inputClass} onChange={(event) => setForm({ ...form, dimensionId: event.target.value })}>
              <option value="">بُعد را انتخاب کنید</option>
              {form.dimensionId && !dimensionNames.has(form.dimensionId) && <option value={form.dimensionId} disabled>بُعد انتخاب‌شده در دسترس نیست</option>}
              {orderedDimensions.map((dimension) => <option key={dimension.id} value={dimension.id}>{dimension.label}</option>)}
            </select></label>
            <div className="flex gap-2">
              <button type="submit" disabled={disabled || !dimensionNames.has(form.dimensionId)} className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{criteria.busy ? 'در حال انجام…' : 'ذخیره معیار'}</button>
              {editingId && <button type="button" className={buttonClass} onClick={resetForm}>انصراف</button>}
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
