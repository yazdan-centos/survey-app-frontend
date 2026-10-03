import { useEffect } from 'react';
import DemographicForm from '../components/demographics/DemographicForm';
import { useSurvey } from '../context/SurveyContext';
import { getRoleById } from '../data/roles';
import QuestionnaireStatus from '../components/survey/QuestionnaireStatus';
import ParticipatedSurveys from '../components/survey/ParticipatedSurveys';
import SurveyStatusBadge from '../components/admin/SurveyStatusBadge';
import { responseDate } from '../utils/responseDisplay';

export default function ProfilePage() {
  const { state, survey, assignmentId, activeSurveys, selectAssignment, setRole, setDemographics, goToStep, availableRoleIds, dimensionsWithQuestions, questionsLoading } = useSurvey();

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
      <>
        <QuestionnaireStatus requireRoleQuestions={Boolean(role)} allowSurveySelection>
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <div className="mb-8 text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                پیش از شروع، کمی درباره خودتان بگویید
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                پاسخ‌های شما محرمانه بوده و صرفاً برای تحلیل کلی نتایج استفاده می‌شود.
              </p>
            </div>

            {activeSurveys.length > 0 && (
                <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">پیمایش‌های اختصاص‌داده‌شده به شما</h3>
                  <ul className="space-y-3">
                    {activeSurveys.map((item) => {
                      const selected = item.assignmentId === assignmentId;
                      const isCompleted = item.assignmentStatus === 'COMPLETED';
                      const linkColorClass = isCompleted
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-[#1E90FF] dark:text-[#1E90FF]';
                      
                      return (
                          <li key={item.assignmentId}>
                            <button
                                type="button"
                                aria-pressed={selected}
                                disabled={isCompleted}
                                onClick={() => selectAssignment(item.assignmentId)}
                                className={`flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-right transition-colors ${
                                    selected
                                        ? 'border-primary-700 bg-primary-50 dark:bg-slate-800'
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                } ${
                                    isCompleted ? 'cursor-default opacity-75' : ''
                                }`}
                            >
                        <span className="min-w-0">
                          <span className={`block break-words font-semibold ${linkColorClass}`}>{item.survey.title}</span>
                          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                            نسخه {item.survey.version || '—'} · شروع: {responseDate(item.activeFrom)} · پایان: {responseDate(item.activeUntil)}
                          </span>
                        </span>
                              <SurveyStatusBadge status={item.assignmentStatus} />
                            </button>
                          </li>
                      );
                    })}
                  </ul>
                </div>
            )}

            {role && survey && (
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
        <ParticipatedSurveys />
      </>
  );
}
