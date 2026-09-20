export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/$/, '');

export const API_PATHS = {
  // Auth (not in ENDPOINTS.md but keeping for backwards compatibility)
  login: '/api/auth/login',
  currentUser: '/api/v1/auth/me',

  // Questions
  questions: '/api/questions',
  exportQuestions: (surveyId) => `/api/questions/export?surveyId=${surveyId}`,
  importQuestions: (surveyId) => `/api/questions/import?surveyId=${surveyId}`,
  questionsBySurvey: (surveyId) => `/api/questions/survey/${surveyId}`,

  // Survey Answers
  surveyAnswers: (responseId) => `/api/survey-responses/${responseId}/answers`,
  surveyAnswer: (responseId, answerId) => `/api/survey-responses/${responseId}/answers/${answerId}`,

  // Survey Responses
  surveyResponses: '/api/survey-responses',
  surveyResponse: (responseId) => `/api/survey-responses/${responseId}`,

  // Surveys
  dashboard: '/api/surveys/dashboard',
  surveys: '/api/v1/surveys',  // Public surveys endpoint (from ENDPOINTS.md)
  activeSurvey: '/api/v1/surveys/active',  // Get active survey (from ENDPOINTS.md)
  survey: (surveyId) => `/api/v1/surveys/${surveyId}`,  // Survey by ID (from ENDPOINTS.md)
  
  // Admin Survey Management (actual backend implementation)
  adminSurveys: '/api/v1/admin/surveys',
  adminSurvey: (id) => `/api/v1/admin/surveys/${id}`,
  adminSurveyActivate: (id) => `/api/v1/admin/surveys/${id}/activate`,
  adminSurveyDeactivate: (id) => `/api/v1/admin/surveys/${id}/deactivate`,

  // Users
  users: '/api/users',
  user: (userId) => `/api/users/${userId}`,
  importUsers: '/api/users/import',
  searchUsers: '/api/users/search',
  syncUsersFromAD: '/api/users/sync/ad',
  userImportTemplate: '/api/users/template',
};
