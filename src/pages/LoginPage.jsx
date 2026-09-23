import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPostLoginPath } from '../utils/auth';

export default function LoginPage() {
  const { signIn, isAuthenticated, user } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={getPostLoginPath(user)} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(credentials);
    } catch (loginError) {
      setError(loginError.message || 'ورود انجام نشد. لطفاً اطلاعات خود را بررسی کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ورود</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">برای ادامه، وارد حساب کاربری خود شوید.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            نام کاربری
            <input
              required
              value={credentials.username}
              onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
              autoComplete="username"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            رمز عبور
            <input
              required
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}
