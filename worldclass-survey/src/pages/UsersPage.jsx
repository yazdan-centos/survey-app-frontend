import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Pencil, RefreshCcw, Search, Trash2, Users } from 'lucide-react';
import UserForm from '../components/admin/UserForm';
import { useHttp } from '../hooks/useHttp';
import * as userService from '../services/userService';
import { isAdmin } from '../utils/auth';

const PAGE_SIZE = 10;
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50';
const normalize = (value) => String(value ?? '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLocaleLowerCase().trim();

export default function UsersPage() {
  const request = useHttp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [pending, setPending] = useState(null);
  const loadController = useRef(null);
  const mutationPending = useRef(false);
  const formContainer = useRef(null);

  const fetchUsers = useCallback(async () => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    try {
      const data = await userService.listUsers(request, { signal: controller.signal });
      if (!controller.signal.aborted) setUsers(data);
    } catch (error) {
      if (!controller.signal.aborted) setLoadError(error.message || 'دریافت فهرست کاربران با خطا مواجه شد.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- State updates follow the awaited API request.
    fetchUsers();
    return () => loadController.current?.abort();
  }, [fetchUsers]);

  const loadUsers = async () => {
    setLoading(true);
    setLoadError('');
    await fetchUsers();
  };

  const filteredUsers = useMemo(() => {
    const term = normalize(search);
    return users.filter((user) => {
      const matchesRole = role === 'all' || (role === 'admin' ? isAdmin(user) : !isAdmin(user));
      return matchesRole && [user.username, user.fullName, user.email].some((value) => normalize(value).includes(term));
    });
  }, [users, search, role]);
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const busy = pending !== null;

  const resetForm = () => {
    setEditingUser(null);
    setFormVersion((version) => version + 1);
  };

  const handleSave = async (payload) => {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setPending('save');
    setNotice(null);
    try {
      if (editingUser) await userService.updateUser(request, editingUser.id, payload);
      else await userService.createUser(request, payload);
      setNotice({ type: 'success', text: editingUser ? 'تغییرات کاربر ذخیره شد.' : 'کاربر جدید ایجاد شد.' });
      resetForm();
      // Reload the canonical list, including APIs that return no body after writes.
      await loadUsers();
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'ذخیره کاربر با خطا مواجه شد.' });
    } finally {
      mutationPending.current = false;
      setPending(null);
    }
  };

  const handleDelete = async (user) => {
    if (mutationPending.current || !window.confirm(`آیا از حذف کاربر «${user.fullName || user.username}» مطمئن هستید؟`)) return;
    mutationPending.current = true;
    setPending(`delete:${user.id}`);
    setNotice(null);
    try {
      await userService.deleteUser(request, user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editingUser?.id === user.id) resetForm();
      setNotice({ type: 'success', text: 'کاربر حذف شد.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'حذف کاربر با خطا مواجه شد.' });
    } finally {
      mutationPending.current = false;
      setPending(null);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormVersion((version) => version + 1);
    setNotice(null);
    formContainer.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formContainer.current?.focus({ preventScroll: true });
  };

  return (
    <div dir="rtl" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">مدیریت کاربران</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">کاربران را جستجو کنید، اطلاعات آن‌ها را ویرایش کنید و دسترسی مدیر را تنظیم کنید.</p>
        </div>
        <button type="button" onClick={loadUsers} disabled={loading || busy} className={buttonClass}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
          به‌روزرسانی فهرست
        </button>
      </div>

      {notice && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} className={`mt-4 flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm ${notice.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
          <p>{notice.text}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label="بستن پیام" className="shrink-0 font-semibold">×</button>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0" aria-label="فهرست کاربران" aria-busy={loading}>
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="min-w-0 flex-1 basis-56">
              <label htmlFor="users-search" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">جستجوی کاربران</label>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute right-3 top-3 text-slate-400" />
                <input id="users-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="نام، نام کاربری یا ایمیل" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700" />
              </div>
            </div>
            <div>
              <label htmlFor="users-role" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">نوع دسترسی</label>
              <select id="users-role" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                <option value="all">همه کاربران</option>
                <option value="admin">مدیر سیستم</option>
                <option value="user">کاربر عادی</option>
              </select>
            </div>
          </div>

          {loadError ? (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              <p className="flex items-start gap-2"><AlertTriangle size={18} className="shrink-0" />{loadError}</p>
              <button type="button" onClick={loadUsers} disabled={busy} className="mt-3 font-semibold underline disabled:opacity-50">تلاش مجدد</button>
            </div>
          ) : loading ? (
            <div role="status" className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-sm text-slate-500 dark:text-slate-400"><Loader2 size={18} className="animate-spin" />در حال بارگذاری کاربران...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              <Users size={32} className="mx-auto mb-3 text-slate-400" />
              {users.length === 0 ? 'هنوز کاربری ثبت نشده است.' : 'کاربری با این مشخصات یافت نشد.'}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <caption className="sr-only">فهرست کاربران و دسترسی‌ها</caption>
                  <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <tr>{['کاربر', 'ایمیل', 'دسترسی', 'عملیات'].map((title) => <th key={title} scope="col" className="whitespace-nowrap px-4 py-3">{title}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visibleUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3"><p className="max-w-48 break-words font-medium text-slate-800">{user.fullName || user.username || '—'}</p><p dir="auto" className="mt-1 max-w-48 break-words text-xs text-slate-500 dark:text-slate-400">{user.username}</p></td>
                        <td className="px-4 py-3"><span dir="ltr" className="inline-block max-w-48 break-all text-slate-600 dark:text-slate-400">{user.email || '—'}</span></td>
                        <td className="px-4 py-3"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs ${isAdmin(user) ? 'bg-primary-50 text-primary-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{isAdmin(user) ? 'مدیر سیستم' : 'کاربر عادی'}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleEdit(user)} disabled={busy || user.id == null} className={buttonClass} aria-label={`ویرایش ${user.username}`}><Pencil size={14} />ویرایش</button>
                            <button type="button" onClick={() => handleDelete(user)} disabled={busy || user.id == null} className={`${buttonClass} text-rose-700`} aria-label={`حذف ${user.username}`}>
                              {pending === `delete:${user.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 px-4 py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400" role="status">{filteredUsers.length.toLocaleString('fa-IR')} کاربر · صفحه {currentPage.toLocaleString('fa-IR')} از {pageCount.toLocaleString('fa-IR')}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className={buttonClass}>قبلی</button>
                  <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount} className={buttonClass}>بعدی</button>
                </div>
              </div>
            </div>
          )}
        </section>
        <div ref={formContainer} tabIndex={-1} className="min-w-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700">
          <UserForm key={formVersion} user={editingUser} submitting={busy} onSubmit={handleSave} onCancel={resetForm} />
        </div>
      </div>
    </div>
  );
}
