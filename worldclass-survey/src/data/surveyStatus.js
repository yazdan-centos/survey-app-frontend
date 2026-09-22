// Status metadata for admin-managed surveys (campaigns), independent from
// the respondent-facing question data in surveyQuestions.js.
export const SURVEY_STATUS = {
  draft: { label: 'پیش‌نویس', badgeClass: 'bg-slate-100 text-slate-600 ring-slate-200' },
  active: { label: 'فعال', badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  inactive: { label: 'غیرفعال', badgeClass: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

export const SURVEY_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'active', label: SURVEY_STATUS.active.label },
  { value: 'inactive', label: SURVEY_STATUS.inactive.label },
];

export function getSurveyStatusMeta(status) {
  return SURVEY_STATUS[status] || SURVEY_STATUS.draft;
}
