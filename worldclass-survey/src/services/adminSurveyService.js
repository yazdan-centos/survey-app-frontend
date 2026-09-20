import { API_PATHS } from '../config/api';

/**
 * Admin survey (campaign) management.
 * `request` is the authenticated fetcher returned by useHttp() —
 * every call here automatically carries the signed-in admin's bearer token
 * and routes 401s through AuthContext's sign-out flow.
 */

export function listSurveys(request, { status } = {}) {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  return request(`${API_PATHS.adminSurveys}${query}`, { method: 'GET' });
}

export function getSurvey(request, id) {
  return request(API_PATHS.adminSurvey(id), { method: 'GET' });
}

export function createSurvey(request, payload) {
  return request(API_PATHS.adminSurveys, {
    method: 'POST',
    body: payload,
  });
}

export function updateSurvey(request, id, payload) {
  return request(API_PATHS.adminSurvey(id), {
    method: 'PUT',
    body: payload,
  });
}

export function deleteSurvey(request, id) {
  return request(API_PATHS.adminSurvey(id), { method: 'DELETE' });
}

export function activateSurvey(request, id) {
  return request(API_PATHS.adminSurveyActivate(id), { method: 'POST' });
}

export function deactivateSurvey(request, id) {
  return request(API_PATHS.adminSurveyDeactivate(id), { method: 'POST' });
}

/** Convenience: flips whichever state the survey is currently in. */
export function setSurveyActive(request, id, isActive) {
  return isActive ? activateSurvey(request, id) : deactivateSurvey(request, id);
}
