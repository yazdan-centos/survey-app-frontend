import { useCallback, useEffect, useState } from 'react';
import { useHttp } from './useHttp';
import { getAdminDashboard } from '../services/adminDashboardService';

export function useAdminDashboard(page, pageSize = 10) {
  const request = useHttp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((current) => current + 1), []);

  useEffect(() => {

    const controller = new AbortController();
    setLoading(true);
    setError('');

    getAdminDashboard(request, { page, pageSize, signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message || 'دریافت نتایج کاربران با خطا مواجه شد.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, pageSize, refreshKey, request]);

  return { data, loading, error, refresh };
}
