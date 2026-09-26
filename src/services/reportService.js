import { getResponseOverview } from './responseService';
import { responseRoleLabel } from '../utils/responseDisplay';

function count(value) {
  const number = Number(value ?? 0);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error('آمار گزارش معتبر نیست. لطفاً دوباره تلاش کنید.');
  }
  return number;
}

export async function getSurveyReports(request, { signal } = {}) {
  const overview = await getResponseOverview(request, { signal });
  return overview.surveys.map((survey) => {
    if (survey.id === null || survey.id === undefined) {
      throw new Error('شناسه پیمایش در گزارش موجود نیست.');
    }
    return {
      id: String(survey.id),
      title: survey.title || 'پیمایش بدون عنوان',
      questionCount: count(survey.questionCount),
      responseCount: count(survey.responseCount),
      answeredCount: count(survey.answeredCount),
      skippedCount: count(survey.skippedCount),
      lastSubmittedAt: survey.lastSubmittedAt,
      audiences: (survey.audiences ?? []).map((audience) => ({
        role: audience.role,
        label: responseRoleLabel(audience.role),
        responseCount: count(audience.responseCount),
        answeredCount: count(audience.answeredCount),
        skippedCount: count(audience.skippedCount),
      })),
    };
  });
}
