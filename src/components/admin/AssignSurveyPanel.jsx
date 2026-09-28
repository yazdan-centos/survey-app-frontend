import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useHttp } from '../../hooks/useHttp';
import * as userService from '../../services/userService';
import * as surveyAssignmentService from '../../services/surveyAssignmentService';
import { responseDate } from '../../utils/responseDisplay';
import SurveyStatusBadge from './SurveyStatusBadge';

const inputClass = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700';
const normalize = (value) => String(value ?? '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLocaleLowerCase().trim();
const userLabel = (user) => user.displayName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.fullName || user.username;
const toIso = (value) => (value ? new Date(value).toISOString() : undefined);

export default function AssignSurveyPanel({ survey, onClose }) {
    const request = useHttp();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [activeFrom, setActiveFrom] = useState('');
    const [activeUntil, setActiveUntil] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [revokingId, setRevokingId] = useState(null);
    const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }
    const [assignments, setAssignments] = useState([]); // assignments returned in this session

    useEffect(() => {
        const controller = new AbortController();
        userService.listUsers(request, { signal: controller.signal })
            .then((data) => { if (!controller.signal.aborted) setUsers(data.filter((user) => user.deleted !== true)); })
            .catch((error) => { if (!controller.signal.aborted) setLoadError(error.message || 'دریافت فهرست کاربران با خطا مواجه شد.'); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [request]);

    const filteredUsers = useMemo(() => {
        const term = normalize(search);
        return users.filter((user) => [user.username, userLabel(user), user.email].some((value) => normalize(value).includes(term)));
    }, [users, search]);

    const toggleUser = (id) => setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });

    const selectAllVisible = () => setSelectedIds((current) => new Set([...current, ...filteredUsers.map((user) => user.id)]));

    const handleAssign = async (event) => {
        event.preventDefault();
        if (submitting) return;
        if (!selectedIds.size) {
            setNotice({ type: 'error', text: 'حداقل یک کاربر را انتخاب کنید.' });
            return;
        }
        if (activeFrom && activeUntil && new Date(activeUntil) < new Date(activeFrom)) {
            setNotice({ type: 'error', text: 'پایان بازه نمی‌تواند پیش از شروع آن باشد.' });
            return;
        }
        if (!window.confirm('اگر پیمایش پیش‌تر برای کاربری اختصاص داده شده باشد (حتی تکمیل یا لغو‌شده)، دوباره فعال می‌شود. ادامه می‌دهید؟')) return;
        setSubmitting(true);
        setNotice(null);
        try {
            const created = await surveyAssignmentService.assignSurveys(request, {
                userIds: [...selectedIds],
                surveyIds: [survey.id],
                activeFrom: toIso(activeFrom),
                activeUntil: toIso(activeUntil),
            });
            setAssignments(created);
            setSelectedIds(new Set());
            setNotice({ type: 'success', text: 'پیمایش برای کاربران انتخاب‌شده اختصاص داده شد.' });
        } catch (error) {
            setNotice({
                type: 'error',
                text: error.status === 404 ? 'کاربر یا پیمایش انتخاب‌شده دیگر موجود نیست.'
                    : error.status === 409 ? 'اختصاص پیمایش با داده‌های موجود تداخل دارد.'
                        : error.message || 'اختصاص پیمایش با خطا مواجه شد.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevoke = async (assignment) => {
        if (revokingId) return;
        setRevokingId(assignment.id);
        setNotice(null);
        try {
            const updated = await surveyAssignmentService.revokeAssignment(request, assignment.id);
            setAssignments((current) => current.map((item) => (item.id === assignment.id ? { ...item, ...updated } : item)));
            setNotice({ type: 'success', text: 'اختصاص پیمایش لغو شد.' });
        } catch (error) {
            setNotice({ type: 'error', text: error.status === 404 ? 'این اختصاص دیگر موجود نیست.' : error.message || 'لغو اختصاص با خطا مواجه شد.' });
        } finally {
            setRevokingId(null);
        }
    };

    return (
        <section className="rounded-2xl border border-primary-200 bg-white dark:bg-slate-900 p-5" aria-labelledby="assign-survey-title">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 id="assign-survey-title" className="font-semibold text-slate-800">اختصاص پیمایش به کاربران</h3>
                    <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{survey.title}</p>
                </div>
                <button type="button" onClick={onClose} aria-label="بستن پنل اختصاص" className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"><X size={18} /></button>
            </div>

            {survey.status !== 'active' && (
                <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">این پیمایش غیرفعال است و تا زمان فعال‌سازی برای کاربران نمایش داده نمی‌شود.</p>
            )}

            {notice && (
                <div role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${notice.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                    {notice.text}
                </div>
            )}

            <form onSubmit={handleAssign}>
                <fieldset disabled={submitting} className="min-w-0 space-y-4 disabled:opacity-60">
                    <div>
                        <label htmlFor="assign-user-search" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">جستجوی کاربر</label>
                        <input id="assign-user-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} autoComplete="off" dir="auto" className={inputClass} />
                    </div>

                    {loadError ? (
                        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{loadError}</div>
                    ) : loading ? (
                        <p role="status" className="flex items-center justify-center gap-2 p-4 text-sm text-slate-500 dark:text-slate-400"><Loader2 size={16} className="animate-spin" />در حال بارگذاری کاربران...</p>
                    ) : (
                        <div>
                            <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>{selectedIds.size.toLocaleString('fa-IR')} کاربر انتخاب شده</span>
                                <button type="button" onClick={selectAllVisible} disabled={!filteredUsers.length} className="font-semibold text-primary-800 underline disabled:opacity-50">انتخاب همه نتایج</button>
                            </div>
                            <ul className="max-h-64 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                {filteredUsers.map((user) => (
                                    <li key={user.id}>
                                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleUser(user.id)} className="h-4 w-4 rounded border-slate-300 text-primary-800" />
                                            <span className="min-w-0">
                        <span className="block break-words text-slate-800">{userLabel(user)}</span>
                        <span dir="ltr" className="block break-all text-left text-xs text-slate-500 dark:text-slate-400">{user.username}</span>
                      </span>
                                        </label>
                                    </li>
                                ))}
                                {!filteredUsers.length && <li className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">کاربری یافت نشد.</li>}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label htmlFor="assign-active-from" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">شروع بازه (اختیاری)</label>
                            <input id="assign-active-from" type="datetime-local" value={activeFrom} onChange={(event) => setActiveFrom(event.target.value)} dir="ltr" className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="assign-active-until" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">پایان بازه (اختیاری)</label>
                            <input id="assign-active-until" type="datetime-local" value={activeUntil} onChange={(event) => setActiveUntil(event.target.value)} dir="ltr" className={inputClass} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading || Boolean(loadError)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60">
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        اختصاص پیمایش
                    </button>
                </fieldset>
            </form>

            {assignments.length > 0 && (
                <div className="mt-5">
                    <h4 className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">اختصاص‌های ثبت‌شده در این نشست</h4>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        {assignments.map((assignment) => {
                            const revocable = assignment.status === 'ASSIGNED' || assignment.status === 'ACTIVE';
                            return (
                                <li key={assignment.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                                    <div className="min-w-0">
                                        <p className="break-words text-slate-800">{assignment.user ? userLabel(assignment.user) : '—'}</p>
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">شروع: {responseDate(assignment.activeFrom)} · پایان: {responseDate(assignment.activeUntil)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <SurveyStatusBadge status={assignment.status} />
                                        {revocable && (
                                            <button type="button" onClick={() => handleRevoke(assignment)} disabled={revokingId !== null} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
                                                {revokingId === assignment.id && <Loader2 size={14} className="animate-spin" />}
                                                لغو
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </section>
    );
}