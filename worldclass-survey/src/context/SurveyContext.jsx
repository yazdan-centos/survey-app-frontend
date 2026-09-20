import { createContext, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DIMENSIONS } from '../data/dimensions';
import { getQuestionsByRole, getFlatQuestions } from '../data/surveyQuestions';
import { getRoleById } from '../data/roles';

const SurveyContext = createContext(null);

const STORAGE_KEY = 'wcs:survey-state:v1';

const initialState = {
  roleId: null,
  demographics: {},
  answers: {}, // { [questionCode]: 1 | 2 | 3 | 4 | 'skip' }
  submittedAt: null,
};

// Maps a logical wizard step ('profile' | dimensionKey | 'results') to a URL.
function stepToPath(step) {
  if (step === 'profile') return '/';
  if (step === 'results') return '/results';
  if (step === 'thank-you') return '/thank-you';
  return `/survey/${step}`;
}

export function SurveyProvider({ children }) {
  const [state, setState, clearState] = useLocalStorage(STORAGE_KEY, initialState);
  const navigate = useNavigate();

  const role = state.roleId ? getRoleById(state.roleId) : null;
  const dimensionsWithQuestions = useMemo(
    () => (state.roleId ? getQuestionsByRole(state.roleId) : []),
    [state.roleId]
  );
  const flatQuestions = useMemo(
    () => (state.roleId ? getFlatQuestions(state.roleId) : []),
    [state.roleId]
  );

  const setRole = useCallback(
    (roleId) => {
      setState((prev) => ({
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
    (code, value) => {
      setState((prev) => ({
        ...prev,
        answers: { ...prev.answers, [code]: value },
      }));
    },
    [setState]
  );

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
    navigate(stepToPath('thank-you'));
  }, [navigate]);

  // --- Step sequencing helpers -------------------------------------------------
  const stepOrder = useMemo(
    () => ['profile', ...DIMENSIONS.map((d) => d.key), 'results'],
    []
  );

  const isDimensionComplete = useCallback(
    (dimensionKey) => {
      const dim = dimensionsWithQuestions.find((d) => d.key === dimensionKey);
      if (!dim) return false;
      return dim.questions.every((q) => state.answers[q.code] !== undefined);
    },
    [dimensionsWithQuestions, state.answers]
  );

  const isSurveyComplete = useMemo(
    () => flatQuestions.length > 0 && flatQuestions.every((q) => state.answers[q.code] !== undefined),
    [flatQuestions, state.answers]
  );

  const answeredCount = useMemo(
    () => flatQuestions.filter((q) => state.answers[q.code] !== undefined).length,
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
        .map((q) => state.answers[q.code])
        .filter((v) => typeof v === 'number');
      const total = dim.questions.length;
      const answered = dim.questions.filter((q) => state.answers[q.code] !== undefined).length;
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
        skipped: dim.questions.filter((q) => state.answers[q.code] === 'skip').length,
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
    dimensionsWithQuestions,
    flatQuestions,
    stepOrder,
    setRole,
    setDemographics,
    answerQuestion,
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
