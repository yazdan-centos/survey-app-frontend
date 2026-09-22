import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, X } from 'lucide-react';

const emptyValues = {
  title: '',
  version: '',
};

function toFormValues(survey) {
  if (!survey) return emptyValues;
  return {
    title: survey.title ?? '',
    version: survey.version ?? '',
  };
}

/**
 * Create/edit form for a survey (campaign). New surveys are always saved as
 * inactive — activation is a deliberate, separate action taken from the list
 * (see SurveyTable) so a half-finished survey never goes live by accident.
 */
export default function SurveyForm({ editingSurvey, onSubmit, onCancelEdit, submitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyValues });

  useEffect(() => {
    reset(toFormValues(editingSurvey));
  }, [editingSurvey, reset]);

  const submit = handleSubmit(async (values) => {
    const saved = await onSubmit({
      title: values.title.trim(),
      version: values.version.trim(),
    });
    if (saved && !editingSurvey) reset(emptyValues);
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
        <label htmlFor="survey-title" className="mb-1 block text-xs font-medium text-slate-600">عنوان پیمایش</label>
        <input
          id="survey-title"
          disabled={submitting}
          maxLength={200}
          {...register('title', { validate: (value) => Boolean(value.trim()) || 'عنوان الزامی است', maxLength: 200 })}
          placeholder="مثلاً: ارزیابی کلاس جهانی — سه‌ماهه سوم ۱۴۰۴"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
        />
        {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="survey-version" className="mb-1 block text-xs font-medium text-slate-600">نسخه پیمایش</label>
        <input
          id="survey-version"
          disabled={submitting}
          maxLength={50}
          {...register('version', { validate: (value) => Boolean(value.trim()) || 'نسخه الزامی است', maxLength: 50 })}
          placeholder="مثلاً: 1405-Q3"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
        />
        {errors.version && <p className="mt-1 text-xs text-rose-600">{errors.version.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {isEditing ? 'ذخیره تغییرات' : 'ایجاد پیمایش غیرفعال'}
      </button>
    </form>
  );
}
