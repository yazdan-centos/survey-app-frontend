import { API_PATHS } from '../config/api';

/**
 * Admin survey (campaign) management.
 * `request` is the authenticated fetcher returned by useHttp() —
 * every call here automatically carries the signed-in admin's bearer token
 * and routes 401s through AuthContext's sign-out flow.
 */

function normalizeSurvey(survey) {
  return { ...survey, status: survey.active ? 'active' : 'inactive' };
}

export async function listSurveys(request, { status, signal } = {}) {
  const data = await request(API_PATHS.adminSurveys, { method: 'GET', signal });
  if (!Array.isArray(data)) throw new Error('ساختار فهرست پیمایش‌ها معتبر نیست.');
  const surveys = data.map(normalizeSurvey);
  // The backend lists all surveys; it does not accept a status filter.
  return status && status !== 'all' ? surveys.filter((survey) => survey.status === status) : surveys;
}

export async function createSurvey(request, payload) {
  const data = await request(API_PATHS.adminSurveys, {
    method: 'POST',
    body: { title: payload.title, version: payload.version, active: false },
  });
  return normalizeSurvey(data);
}

export async function updateSurvey(request, id, payload) {
  const data = await request(API_PATHS.adminSurvey(id), {
    method: 'PUT',
    body: { title: payload.title, version: payload.version, active: payload.active },
  });
  return normalizeSurvey(data);
}

export function deleteSurvey(request, id) {
  return request(API_PATHS.adminSurvey(id), { method: 'DELETE' });
}

export function setSurveyActive(request, survey, active) {
  // UpdateSurveyRequest requires title and version even when only active changes.
  return updateSurvey(request, survey.id, { title: survey.title, version: survey.version, active });
}
