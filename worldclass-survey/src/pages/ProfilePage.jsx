import { useEffect, useRef } from 'react';
import DemographicForm from '../components/demographics/DemographicForm';
import { useSurvey } from '../context/SurveyContext';
import { ROLES, getRoleById } from '../data/roles';
import { DIMENSIONS } from '../data/dimensions';

export default function ProfilePage() {
  const { state, setRole, setDemographics, goToStep } = useSurvey();
  const hasAssignedRole = useRef(false);

  // TODO(auth): role selection is temporarily disabled — once LDAP
  // authentication is wired in, replace this with the role resolved from
  // the logged-in user instead of picking one at random.
  useEffect(() => {
    if (!state.roleId && !hasAssignedRole.current) {
      hasAssignedRole.current = true;
      const randomRole = ROLES[Math.floor(Math.random() * ROLES.length)];
      setRole(randomRole.id);
    }
  }, [state.roleId, setRole]);

  const handleValid = (values) => {
    setDemographics(values);
    goToStep(DIMENSIONS[0].key);
  };

  const role = state.roleId ? getRoleById(state.roleId) : null;

  return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            پیش از شروع، کمی درباره خودتان بگویید
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            پاسخ‌های شما محرمانه بوده و صرفاً برای تحلیل کلی نتایج استفاده می‌شود.
          </p>
        </div>

        {role && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">اطلاعات دموگرافی</h3>
              <DemographicForm
                  key={role.id}
                  demoKey={role.demoKey}
                  defaultValues={state.demographics}
                  onValid={handleValid}
              />
            </div>
        )}
      </div>
  );
}
