

// In production: set VITE_API_BASE_URL= (empty) → Nginx proxies /api/* to Spring Boot
// In development: set VITE_API_BASE_URL=http://localhost:8080 in .env.local
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';


export const API_PATHS = {
  // Auth (not in ENDPOINTS.md but keeping for backwards compatibility)
  login: '/api/auth/login',
  currentUser: '/api/v1/auth/me',

  // Questions
  questions: '/api/questions',
  exportQuestions: (surveyId) => `/api/questions/export?surveyId=${surveyId}`,
  importQuestions: (surveyId) => `/api/questions/import?surveyId=${surveyId}`,
  questionsBySurvey: (surveyId) => `/api/questions/survey/${surveyId}`,

  dimensions: '/api/dimensions',
  dimension: (id) => `/api/dimensions/${encodeURIComponent(id)}`,
  criteria: '/api/criteria',
  criterion: (id) => `/api/criteria/${encodeURIComponent(id)}`,

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
  
  // SurveyController serves both survey listing and management on these paths.
  adminSurveys: '/api/v1/surveys',
  adminSurvey: (id) => `/api/v1/surveys/${id}`,

  // Users
  users: '/api/users',
  user: (userId) => `/api/users/${userId}`,
  importUsers: '/api/users/import',
  searchUsers: '/api/users/search',
  syncUsersFromAD: '/api/users/sync/ad',
  userImportTemplate: '/api/users/template',
};
