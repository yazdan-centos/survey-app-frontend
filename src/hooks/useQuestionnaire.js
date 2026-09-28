import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useHttp } from './useHttp';
import { useLocalStorage } from './useLocalStorage';
import { isAdmin } from '../utils/auth';
import { getActiveQuestionnaire } from '../services/surveyService';

const emptyQuestions = [];
const emptyActiveSurveys = [];

export function useQuestionnaire() {
  const request = useHttp();
  const { user, accessToken, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const enabled = isAuthenticated && !isAdmin(user) &&
      (pathname === '/' || pathname.startsWith('/survey/') || pathname === '/results');
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  // Only used when several surveys are active; a single one is selected automatically.
  const [selectedAssignmentId, setSelectedAssignmentId] = useLocalStorage('wcs:selected-assignment:v1', null);

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    getActiveQuestionnaire(request, { signal: controller.signal, assignmentId: selectedAssignmentId })
        .then((data) => { if (!controller.signal.aborted) setResult({ request, revision, selectedAssignmentId, ...data }); })
        .catch((error) => {
          if (!controller.signal.aborted) setResult({ request, revision, selectedAssignmentId, error: error.status === 401
                ? 'سرور دسترسی به پیمایش‌های اختصاص‌داده‌شده را رد کرد. لطفاً به مدیر سامانه اطلاع دهید.'
                : error.message || 'دریافت سؤال‌ها ناموفق بود.' });
        });
    return () => controller.abort();
  }, [request, revision, enabled, selectedAssignmentId]);

  const current = result?.request === request && result?.revision === revision
  && result?.selectedAssignmentId === selectedAssignmentId ? result : null;
  return {
    survey: enabled ? current?.survey ?? null : null,
    assignmentId: enabled ? current?.assignmentId ?? null : null,
    activeSurveys: enabled ? current?.activeSurveys ?? emptyActiveSurveys : emptyActiveSurveys,
    selectAssignment: setSelectedAssignmentId,
    questions: enabled ? current?.questions ?? emptyQuestions : emptyQuestions,
    loading: enabled && !current,
    error: enabled ? current?.error ?? '' : '',
    respondentKey: String(user?.id ?? user?.username ?? accessToken ?? ''),
    reload: () => setRevision((value) => value + 1),
  };
}