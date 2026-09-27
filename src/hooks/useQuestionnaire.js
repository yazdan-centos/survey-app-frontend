import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useHttp } from './useHttp';
import { isAdmin } from '../utils/auth';
import { getActiveQuestionnaire } from '../services/surveyService';

const emptyQuestions = [];

export function useQuestionnaire() {
  const request = useHttp();
  const { user, accessToken, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const enabled = isAuthenticated && !isAdmin(user) &&
    (pathname === '/' || pathname.startsWith('/survey/') || pathname === '/results');
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    getActiveQuestionnaire(request, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResult({ request, revision, ...data }); })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ request, revision, error: error.message || 'دریافت سؤال‌ها ناموفق بود.' });
      });
    return () => controller.abort();
  }, [request, revision, enabled]);

  const current = result?.request === request && result?.revision === revision ? result : null;
  return {
    survey: enabled ? current?.survey ?? null : null,
    questions: enabled ? current?.questions ?? emptyQuestions : emptyQuestions,
    loading: enabled && !current,
    error: enabled ? current?.error ?? '' : '',
    respondentKey: String(user?.id ?? user?.username ?? accessToken ?? ''),
    reload: () => setRevision((value) => value + 1),
  };
}
