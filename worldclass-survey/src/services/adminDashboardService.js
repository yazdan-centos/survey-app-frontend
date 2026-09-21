import { API_PATHS } from '../config/api';
import { DIMENSIONS } from '../data/dimensions';

const EMPTY_DISTRIBUTION = { 1: 0, 2: 0, 3: 0, 4: 0, skip: 0 };

function asNumber(value, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeDimensions(dimensions = []) {
  const byKey = new Map(dimensions.map((dimension) => [dimension.key, dimension]));
  return DIMENSIONS.map((definition) => {
    const dimension = byKey.get(definition.key) ?? {};
    return {
      ...definition,
      average: asNumber(dimension.average ?? dimension.score),
      answered: asNumber(dimension.answered ?? dimension.answerCount),
      total: asNumber(dimension.total ?? dimension.questionCount),
      skipped: asNumber(dimension.skipped ?? dimension.skippedCount),
    };
  });
}

function normalizeSubmission(submission) {
  const respondent = submission.respondent ?? submission.user ?? {};
  const results = submission.results ?? {};
  return {
    id: submission.id ?? submission.responseId,
    respondentName: respondent.name ?? respondent.fullName ?? respondent.username ?? respondent.email ?? 'کاربر ناشناس',
    roleLabel: respondent.roleLabel ?? submission.roleLabel ?? '—',
    submittedAt: submission.submittedAt ?? submission.createdAt ?? null,
    overallAverage: asNumber(results.overallAverage ?? submission.overallAverage),
  };
}

export function normalizeAdminDashboard(data, requestedPage, requestedPageSize) {
  if (!data || typeof data !== 'object' || !data.summary) {
    throw new Error('اطلاعات دریافتی داشبورد معتبر نیست. لطفاً دوباره تلاش کنید.');
  }
  const aggregate = data?.aggregate ?? data?.results ?? data?.analytics ?? {};
  const submissionsSource = data?.submissions ?? data?.responses ?? {};
  const submissionItems = Array.isArray(submissionsSource)
    ? submissionsSource
    : submissionsSource.items ?? submissionsSource.content ?? [];
  const totalItems = asNumber(
    submissionsSource.totalItems ?? submissionsSource.totalElements ?? data?.summary?.totalResponses,
    submissionItems.length
  );
  const pageSize = asNumber(submissionsSource.pageSize ?? submissionsSource.size, requestedPageSize);
  const page = asNumber(submissionsSource.page ?? submissionsSource.number, requestedPage);

  return {
    hasAggregate: Number.isFinite(aggregate.overallAverage)
      && Array.isArray(aggregate.dimensions ?? aggregate.dimensionScores),
    hasSubmissions: Array.isArray(data.submissions?.items ?? data.submissions?.content
      ?? data.responses?.items ?? data.responses?.content),
    surveys: Array.isArray(data.surveys) ? data.surveys.map((survey) => ({
      ...survey,
      questionCount: asNumber(survey.questionCount),
      responseCount: asNumber(survey.responseCount),
      answeredCount: asNumber(survey.answeredCount),
      skippedCount: asNumber(survey.skippedCount),
    })) : [],
    summary: {
      totalSurveys: asNumber(data?.summary?.totalSurveys),
      activeSurveys: asNumber(data?.summary?.activeSurveys),
      totalQuestions: asNumber(data?.summary?.totalQuestions),
      totalResponses: asNumber(data?.summary?.totalResponses, totalItems),
    },
    aggregate: {
      overallAverage: asNumber(aggregate.overallAverage),
      dimensions: normalizeDimensions(Array.isArray(aggregate.dimensions ?? aggregate.dimensionScores)
        ? (aggregate.dimensions ?? aggregate.dimensionScores) : []),
      levelDistribution: Object.fromEntries(Object.keys(EMPTY_DISTRIBUTION).map((level) => [
        level, asNumber((aggregate.levelDistribution ?? aggregate.distribution)?.[level]),
      ])),
    },
    submissions: {
      items: submissionItems.map(normalizeSubmission),
      page,
      pageSize,
      totalItems,
      totalPages: asNumber(submissionsSource.totalPages, pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0),
    },
  };
}

export async function getAdminDashboard(request, { page = 0, pageSize = 10, signal } = {}) {
  const query = new URLSearchParams({ page: String(page), size: String(pageSize) });
  const data = await request(`${API_PATHS.dashboard}?${query}`, { signal });
  return normalizeAdminDashboard(data, page, pageSize);
}
