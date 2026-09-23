# API URL Migration Summary

This document summarizes the changes made to align the application's API URLs with the documented endpoints in `ENDPOINTS.md`.

## Important Discovery

**Backend Implementation vs Documentation Mismatch:**

The ENDPOINTS.md file documents public-facing API endpoints, but the actual backend implementation uses different paths for admin operations:

- **Documented (ENDPOINTS.md):** `/api/v1/surveys` - Public survey endpoints
- **Actual Backend:** `/api/v1/admin/surveys` - Admin survey management

The application now maintains **both** sets of endpoints to support the actual backend implementation while staying aligned with the documentation.

## Files Modified

### 1. `src/config/api.js`

**Purpose:** Centralized API endpoint configuration

**Changes:**
- Restructured `API_PATHS` to match all documented endpoints from `ENDPOINTS.md`
- **Kept admin-specific paths** (`adminSurveys`, etc.) for actual backend compatibility
- Added public survey endpoints as documented in ENDPOINTS.md
- Added comprehensive endpoint coverage for all entities

**New API Path Structure:**

#### Questions
- `questions` - POST `/api/questions` (create)
- `exportQuestions(surveyId)` - GET `/api/questions/export?surveyId={surveyId}`
- `importQuestions(surveyId)` - POST `/api/questions/import?surveyId={surveyId}`
- `questionsBySurvey(surveyId)` - GET `/api/questions/survey/{surveyId}`

#### Survey Answers
- `surveyAnswers(responseId)` - GET/POST `/api/survey-responses/{responseId}/answers`
- `surveyAnswer(responseId, answerId)` - GET/PUT `/api/survey-responses/{responseId}/answers/{answerId}`

#### Survey Responses
- `surveyResponses` - POST `/api/survey-responses` (create)
- `surveyResponse(responseId)` - GET/PUT `/api/survey-responses/{responseId}`

#### Surveys (Public - from ENDPOINTS.md)
- `dashboard` - GET `/api/surveys/dashboard`
- `surveys` - GET/POST `/api/v1/surveys` (list/create)
- `activeSurvey` - GET `/api/v1/surveys/active`
- `survey(surveyId)` - GET/PUT/DELETE `/api/v1/surveys/{surveyId}`

#### Admin Survey Management (Actual Backend Implementation)
- `adminSurveys` - GET/POST `/api/v1/admin/surveys`
- `adminSurvey(id)` - GET/PUT/DELETE `/api/v1/admin/surveys/{id}`
- `adminSurveyActivate(id)` - POST `/api/v1/admin/surveys/{id}/activate`
- `adminSurveyDeactivate(id)` - POST `/api/v1/admin/surveys/{id}/deactivate`

#### Users
- `users` - GET/POST `/api/users` (list/create)
- `user(userId)` - GET/PUT/DELETE `/api/users/{userId}`
- `importUsers` - POST `/api/users/import`
- `searchUsers` - GET `/api/users/search`
- `syncUsersFromAD` - POST `/api/users/sync/ad`
- `userImportTemplate` - GET `/api/users/template`

#### Auth (Legacy - Not in ENDPOINTS.md)
- `login` - POST `/api/auth/login`
- `currentUser` - GET `/api/v1/auth/me`

### 2. `src/services/adminSurveyService.js`

**Purpose:** Admin survey management service layer

**Changes:**
- **No changes** - continues to use `adminSurveys` and `adminSurvey()` paths
- These paths work with the actual backend implementation at `/api/v1/admin/surveys`
- Maintained backward compatibility with existing function signatures

## Important Notes

### Endpoints Not in ENDPOINTS.md

The following endpoints are used in the application but **not documented** in `ENDPOINTS.md`:

1. **Auth endpoints:**
   - `/api/auth/login`
   - `/api/v1/auth/me`

2. **Admin survey management endpoints:**
   - `/api/v1/admin/surveys` (GET/POST)
   - `/api/v1/admin/surveys/{id}` (GET/PUT/DELETE)
   - `/api/v1/admin/surveys/{id}/activate` (POST)
   - `/api/v1/admin/surveys/{id}/deactivate` (POST)

### Why Two Sets of Survey Endpoints?

The configuration now includes both:

1. **Public endpoints** (`/api/v1/surveys`) - As documented in ENDPOINTS.md for public/user-facing operations
2. **Admin endpoints** (`/api/v1/admin/surveys`) - For authenticated admin operations (the actual backend implementation)

This dual configuration ensures the app works with the current backend while maintaining alignment with the documentation.

## Testing Recommendations

1. **Survey Management:** Test all CRUD operations for surveys (list, create, update, delete)
2. **Survey Activation:** Verify activate/deactivate functionality still works
3. **Dashboard:** Confirm dashboard data loads correctly
4. **Authentication:** Test login and current user endpoints
5. **Survey Responses:** Test creating and retrieving survey responses

## Next Steps

1. **Update ENDPOINTS.md** to document the actual admin endpoints (`/api/v1/admin/surveys`)
2. Implement services for newly added endpoints (Questions, Users, Survey Answers)
3. Clarify with backend team whether `/api/v1/surveys` should be used for public access vs admin access
4. Consider whether the public survey endpoints are needed or if all operations should go through admin endpoints
