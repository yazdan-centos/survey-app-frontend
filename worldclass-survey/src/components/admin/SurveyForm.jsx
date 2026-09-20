import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, X } from 'lucide-react';
import { ROLES } from '../../data/roles';

const emptyValues = {
  title: '',
  description: '',
  targetRoles: [],
  startDate: '',
  endDate: '',
};

function toFormValues(survey) {
  if (!survey) return emptyValues;
  return {
    title: survey.title ?? '',
    description: survey.description ?? '',
    targetRoles: survey.targetRoles ?? [],
    startDate: survey.startDate ?? '',
    endDate: survey.endDate ?? '',
  };
}

/**
 * Create/edit form for a survey (campaign). New surveys are always saved as
 * drafts — activation is a deliberate, separate action taken from the list
 * (see SurveyTable) so a half-finished survey never goes live by accident.
 */
export default function SurveyForm({ editingSurvey, onSubmit, onCancelEdit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: emptyValues });

  useEffect(() => {
    reset(toFormValues(editingSurvey));
  }, [editingSurvey, reset]);

  const selectedRoles = watch('targetRoles') || [];

  const toggleRole = (roleId) => {
    const next = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId];
    setValue('targetRoles', next, { shouldValidate: true });
  };

  const submit = handleSubmit((values) => {
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      targetRoles: values.targetRoles,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
    });
    if (!editingSurvey) reset(emptyValues);
  });

  const isEditing = Boolean(editingSurvey);

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5" noValidate>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          {isEditing ? 'ویرایش پیمایش' : 'ایجاد پیمایش جدید'}
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
          >
            <X size={14} /> انصراف از ویرایش
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">عنوان پیمایش</label>
        <input
          {...register('title', { required: 'عنوان الزامی است' })}
          placeholder="مثلاً: ارزیابی کلاس جهانی — سه‌ماهه سوم ۱۴۰۴"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
        />
        {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">توضیحات (اختیاری)</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="یادداشت کوتاه برای تیم داخلی درباره هدف این پیمایش"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-slate-600">گروه‌های پاسخ‌دهنده هدف</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => {
            const checked = selectedRoles.includes(role.id);
            return (
              <label
                key={role.id}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  checked
                    ? 'border-primary-700 bg-primary-50 text-primary-900'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleRole(role.id)}
                />
                {role.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">تاریخ شروع</label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">تاریخ پایان</label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {isEditing ? 'ذخیره تغییرات' : 'ایجاد به‌عنوان پیش‌نویس'}
      </button>
    </form>
  );
}
