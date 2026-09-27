import { useEffect } from 'react';
import DemographicForm from '../components/demographics/DemographicForm';
import { useSurvey } from '../context/SurveyContext';
import { getRoleById } from '../data/roles';
import QuestionnaireStatus from '../components/survey/QuestionnaireStatus';

export default function ProfilePage() {
  const { state, setRole, setDemographics, goToStep, availableRoleIds, dimensionsWithQuestions, questionsLoading } = useSurvey();

  // Legacy accounts without a recognized role retain the fallback selection.
  // SurveyContext resolves authenticated roles before this effect runs.
  useEffect(() => {
    if (!state.roleId && !questionsLoading && availableRoleIds.length) {
      setRole(availableRoleIds[Math.floor(Math.random() * availableRoleIds.length)]);
    }
  }, [state.roleId, setRole, availableRoleIds, questionsLoading]);

  const handleValid = (values) => {
    if (!dimensionsWithQuestions.length) return;
    setDemographics(values);
    goToStep(dimensionsWithQuestions[0].key);
  };

  const role = state.roleId ? getRoleById(state.roleId) : null;

  return (
    <QuestionnaireStatus requireRoleQuestions={Boolean(role)}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
            پیش از شروع، کمی درباره خودتان بگویید
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            پاسخ‌های شما محرمانه بوده و صرفاً برای تحلیل کلی نتایج استفاده می‌شود.
          </p>
        </div>

        {role && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">اطلاعات دموگرافی</h3>
              <DemographicForm
                  key={role.id}
                  demoKey={role.demoKey}
                  defaultValues={state.demographics}
                  onValid={handleValid}
              />
            </div>
        )}
      </div>
    </QuestionnaireStatus>
  );
}
