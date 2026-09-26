import { useEffect, useRef, useState } from 'react';
import { useHttp } from './useHttp';

export function useAdminCollection(service) {
  const request = useHttp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const mutationInProgress = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    service.list(request, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setItems(data); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [request, service, revision]);

  const reload = () => {
    if (mutationInProgress.current) return;
    setLoading(true);
    setLoadError('');
    setRevision((current) => current + 1);
  };

  const mutate = async (action, payload, id) => {
    if (mutationInProgress.current || loading || loadError) return false;
    mutationInProgress.current = true;
    setBusy(true);
    setNotice(null);
    try {
      if (action === 'delete') {
        await service.remove(request, id);
        setItems((current) => current.filter((item) => item.id !== id));
      } else if (id) {
        const updated = await service.update(request, id, payload);
        setItems((current) => current.map((item) => item.id === id ? updated : item));
      } else {
        const created = await service.create(request, payload);
        setItems((current) => [...current, created]);
      }
      setNotice({ text: action === 'delete' ? 'حذف با موفقیت انجام شد.' : 'ذخیره با موفقیت انجام شد.' });
      return true;
    } catch (error) {
      const conflict = action === 'delete'
        ? 'حذف ممکن نیست؛ ابتدا موارد وابسته را حذف یا منتقل کنید.'
        : 'کلید یا نام تکراری است. مقدار دیگری وارد کنید.';
      setNotice({ error: true, text: error.status === 409 ? conflict
        : error.status === 404 ? 'رکورد یا بُعد انتخاب‌شده دیگر موجود نیست. فهرست را به‌روزرسانی کنید.'
        : error.message || 'عملیات با خطا مواجه شد.' });
      return false;
    } finally {
      mutationInProgress.current = false;
      setBusy(false);
    }
  };

  return { items, loading, loadError, busy, notice, reload,
    save: (payload, id) => mutate('save', payload, id),
    remove: (id) => mutate('delete', null, id) };
}
