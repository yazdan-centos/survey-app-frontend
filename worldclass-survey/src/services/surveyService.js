import { API_PATHS } from '../config/api';

export function submitSurveyResponse(request, payload) {
  return request(API_PATHS.surveyResponses, {
    method: 'POST',
    body: payload,
  });
}
