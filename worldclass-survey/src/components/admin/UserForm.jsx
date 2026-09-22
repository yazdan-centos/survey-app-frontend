import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { isAdmin } from '../../utils/auth';

const inputClass = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700';

export default function UserForm({ user, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => ({
    username: user?.username ?? '',
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    password: '',
    isAdmin: Boolean(isAdmin(user)),
  }));
  const [error, setError] = useState('');

  const change = (event) => {
    const { name, value, checked, type } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!values.username.trim()) {
      setError('نام کاربری الزامی است.');
      return;
    }
    if (!user && !values.password.trim()) {
      setError('رمز عبور الزامی است.');
      return;
    }
    const payload = {
      username: values.username.trim(),
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      isAdmin: values.isAdmin,
      ...(values.password ? { password: values.password } : {}),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5" aria-labelledby="user-form-title">
      <h3 id="user-form-title" className="mb-4 font-semibold text-slate-800">
        {user ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}
      </h3>
      <fieldset disabled={submitting} className="min-w-0 space-y-4 disabled:opacity-60">
        <div>
          <label htmlFor="user-username" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">نام کاربری *</label>
          <input id="user-username" name="username" value={values.username} onChange={change} required autoComplete="off" dir="auto" className={inputClass} />
        </div>
        <div>
          <label htmlFor="user-full-name" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">نام و نام خانوادگی</label>
          <input id="user-full-name" name="fullName" value={values.fullName} onChange={change} autoComplete="off" className={inputClass} />
        </div>
        <div>
          <label htmlFor="user-email" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">ایمیل</label>
          <input id="user-email" name="email" type="email" value={values.email} onChange={change} autoComplete="off" dir="ltr" className={inputClass} />
        </div>
        <div>
          <label htmlFor="user-password" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{user ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور *'}</label>
          <input id="user-password" name="password" type="password" value={values.password} onChange={change} required={!user} autoComplete="new-password" dir="ltr" className={inputClass} aria-describedby={user ? 'user-password-help' : undefined} />
          {user && <p id="user-password-help" className="mt-1 text-xs text-slate-500 dark:text-slate-400">برای حفظ رمز عبور فعلی، این فیلد را خالی بگذارید.</p>}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" name="isAdmin" checked={values.isAdmin} onChange={change} className="h-4 w-4 accent-primary-800" />
          دسترسی مدیر سیستم
        </label>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {user ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
          </button>
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-400">انصراف</button>
        </div>
      </fieldset>
    </form>
  );
}
