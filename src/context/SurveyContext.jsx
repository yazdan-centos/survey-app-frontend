import { createContext, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getRoleById, getRespondentRoleId } from '../data/roles';
import { useAuth } from '../hooks/useAuth';
import { useQuestionnaire } from '../hooks/useQuestionnaire';
import { groupSurveyQuestions, isValidQuestionAnswer } from '../services/surveyService';

const SurveyContext = createContext(null);

const STORAGE_KEY = 'wcs:survey-state:v2';

const initialState = {
  surveyId: null,
  respondentKey: null,
  roleId: null,
  demographics: {},
  answers: {},
  managerGuideSeen: false,
  submittedAt: null,
};

// Maps a logical wizard step ('profile' | dimensionKey | 'results') to a URL.
function stepToPath(step) {
  if (step === 'profile') return '/';
  if (step === 'results') return '/results';
  if (step === 'thank-you') return '/thank-you';
  return `/survey/${encodeURIComponent(step)}`;
}

export function SurveyProvider({ children }) {
  const [storedState, setStoredState, clearState] = useLocalStorage(STORAGE_KEY, initialState);
  const questionnaire = useQuestionnaire();
  const { survey, questions, respondentKey } = questionnaire;
  const { user } = useAuth();
  const authenticatedRoleId = getRespondentRoleId(user);
  const navigate = useNavigate();

  const scopeState = useCallback((previous) => previous?.surveyId === survey?.id && previous?.respondentKey === respondentKey &&
  (!authenticatedRoleId || previous.roleId === authenticatedRoleId)
      ? previous : { ...initialState, surveyId: survey?.id ?? null, respondentKey,
        roleId: authenticatedRoleId ?? (previous?.respondentKey === respondentKey ? previous.roleId : null) }, [survey?.id, respondentKey, authenticatedRoleId]);
  const scopedState = scopeState(storedState);
  const setState = useCallback((update) => setStoredState((previous) => ({
    ...update(scopeState(previous)), surveyId: survey?.id ?? null, respondentKey,
  })), [setStoredState, scopeState, survey?.id, respondentKey]);
  const role = scopedState.roleId ? getRoleById(scopedState.roleId) : null;
  const dimensionsWithQuestions = useMemo(
      () => groupSurveyQuestions(questions, scopedState.roleId),
      [questions, scopedState.roleId]
  );
  const flatQuestions = useMemo(
      () => dimensionsWithQuestions.flatMap((dimension) => dimension.questions),
      [dimensionsWithQuestions]
  );
  const answers = useMemo(() => Object.fromEntries(flatQuestions
      .filter((question) => isValidQuestionAnswer(question, scopedState.answers?.[question.id], role?.allowSkip))
      .map((question) => [question.id, scopedState.answers[question.id]])), [flatQuestions, scopedState.answers, role?.allowSkip]);
  const state = { ...scopedState, answers };

  const setRole = useCallback(
      (roleId) => {
        setState(() => ({
          ...initialState,
          roleId,
        }));
      },
      [setState]
  );

  const setDemographics = useCallback(
      (demographics) => {
        setState((prev) => ({ ...prev, demographics }));
      },
      [setState]
  );

  const answerQuestion = useCallback(
      (questionId, value) => {
        const question = flatQuestions.find((item) => item.id === questionId);
        if (!question || !isValidQuestionAnswer(question, value, role?.allowSkip)) return;
        setState((prev) => ({
          ...prev,
          answers: { ...prev.answers, [questionId]: value },
        }));
      },
      [setState, flatQuestions, role?.allowSkip]
  );

  const acknowledgeManagerGuide = useCallback(() => {
    setState((prev) => ({ ...prev, managerGuideSeen: true }));
  }, [setState]);

  const goToStep = useCallback(
      (step) => {
        if (step === 'results') {
          setState((prev) => ({ ...prev, submittedAt: prev.submittedAt ?? new Date().toISOString() }));
        }
        navigate(stepToPath(step));
      },
      [navigate, setState]
  );

  const resetSurvey = useCallback(() => {
    clearState();
    navigate('/');
  }, [clearState, navigate]);

  const finishSurvey = useCallback(() => {
    setState((prev) => ({ ...prev, submittedAt: prev.submittedAt ?? new Date().toISOString() }));
    navigate(stepToPath('thank-you'));
  }, [navigate, setState]);

  // --- Step sequencing helpers -------------------------------------------------
  const stepOrder = useMemo(
      () => ['profile', ...dimensionsWithQuestions.map((dimension) => dimension.key), 'results'],
      [dimensionsWithQuestions]
  );

  const isDimensionComplete = useCallback(
      (dimensionKey) => {
        const dim = dimensionsWithQuestions.find((d) => d.key === dimensionKey);
        if (!dim) return false;
        return dim.questions.length > 0 && dim.questions.every((question) => state.answers[question.id] !== undefined);
      },
      [dimensionsWithQuestions, state.answers]
  );

  const isSurveyComplete = useMemo(
      () => flatQuestions.length > 0 && flatQuestions.every((question) => state.answers[question.id] !== undefined),
      [flatQuestions, state.answers]
  );

  const answeredCount = useMemo(
      () => flatQuestions.filter((question) => state.answers[question.id] !== undefined).length,
      [flatQuestions, state.answers]
  );

  const progressPercent = flatQuestions.length
      ? Math.round((answeredCount / flatQuestions.length) * 100)
      : 0;

  // --- Scoring -----------------------------------------------------------------
  // Numeric answers (1-4) are averaged; 'skip' answers are excluded from the mean.
  const dimensionScores = useMemo(() => {
    return dimensionsWithQuestions.map((dim) => {
      const scored = dim.questions
          .map((question) => state.answers[question.id])
          .filter((v) => typeof v === 'number');
      const total = dim.questions.length;
      const answered = dim.questions.filter((question) => state.answers[question.id] !== undefined).length;
      const average = scored.length ? scored.reduce((a, b) => a + b, 0) / scored.length : 0;
      return {
        key: dim.key,
        label: dim.label,
        shortLabel: dim.shortLabel,
        color: dim.color,
        icon: dim.icon,
        average: Math.round(average * 100) / 100,
        answered,
        total,
        skipped: dim.questions.filter((question) => state.answers[question.id] === 'skip').length,
      };
    });
  }, [dimensionsWithQuestions, state.answers]);

  const overallAverage = useMemo(() => {
    const withData = dimensionScores.filter((d) => d.average > 0);
    if (!withData.length) return 0;
    return Math.round((withData.reduce((a, d) => a + d.average, 0) / withData.length) * 100) / 100;
  }, [dimensionScores]);

  const levelDistribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, skip: 0 };
    Object.values(state.answers).forEach((v) => {
      if (v === 'skip') dist.skip += 1;
      else if (v >= 1 && v <= 4) dist[v] += 1;
    });
    return dist;
  }, [state.answers]);

  const value = {
    state,
    role,
    survey,
    assignmentId: questionnaire.assignmentId,
    activeSurveys: questionnaire.activeSurveys,
    selectAssignment: questionnaire.selectAssignment,
    questionsLoading: questionnaire.loading,
    questionsError: questionnaire.error,
    reloadQuestions: questionnaire.reload,
    availableRoleIds: [...new Set(questions.map((question) => question.roleId))],
    dimensionsWithQuestions,
    flatQuestions,
    stepOrder,
    setRole,
    setDemographics,
    answerQuestion,
    acknowledgeManagerGuide,
    goToStep,
    resetSurvey,
    finishSurvey,
    isDimensionComplete,
    isSurveyComplete,
    answeredCount,
    progressPercent,
    dimensionScores,
    overallAverage,
    levelDistribution,
  };

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within a SurveyProvider');
  return ctx;
}