# پیمایش ارزیابی شرکت در کلاس جهانی (World-Class Assessment Survey)

An enterprise multi-step assessment wizard built with React + Vite + Tailwind CSS.
Survey content (5 dimensions × 25 criteria × 4 performance levels, across 4 respondent
roles) is extracted directly from the source workbook `پیمایش_کلاس_جهانی.xlsx` into
`src/data/surveyQuestions.json` and `src/data/demographics.json`.

## Stack
- React 19 + Vite
- Tailwind CSS (RTL, Vazirmatn font)
- React Hook Form (demographic form)
- React Router v6 (wizard routes)
- Recharts (radar + bar charts)
- jsPDF + html2canvas (PDF export)
- lucide-react (icons)

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
```

## Backend API

Login uses `POST /api/auth/login` and stores its `{ accessToken, user }` response.
The backend's boolean `user.isAdmin` determines admin navigation; when absent,
`roles` containing `ADMIN` or `authorities` containing `ROLE_ADMIN` is used.
`FACTOR_PASSWORD` does not grant admin access. Successful admin login opens
`/dashboard`, which loads `GET /api/surveys/dashboard` with the bearer token.
Other users start the survey profile step at `/`. Saved pre-login destinations
do not override these landing pages. Dashboard and admin routes require admin
status in the frontend; the backend remains responsible for API authorization.

`/admin/surveys` uses `GET`/`POST /api/v1/surveys` and
`PUT`/`DELETE /api/v1/surveys/{id}`, matching `SurveyController`. Survey fields
are `title`, `version`, and boolean `active`; status filtering is local.
Activation uses `PUT` with the existing title/version and the new `active`
value. There is no `/api/v1/admin/surveys` or dedicated activation endpoint.
The HTTP hook continues to sign out on 401 responses.

`/admin/users` provides user creation, editing, confirmed deletion, and local
search, access filtering, and pagination over `GET /api/users`. Writes use
`POST /api/users`, `PUT /api/users/{id}`, and `DELETE /api/users/{id}` through
the authenticated HTTP hook. The form assumes `id`, `username`, `fullName`,
`email`, and boolean `isAdmin` fields. Creation requires `password`; editing
omits a blank password to preserve the current one. These field assumptions
need confirmation against the backend DTO because `ENDPOINTS.md` documents
routes only. Listing accepts an array or an `items`/`content` array wrapper;
the all-users endpoint must return the complete collection for local filtering.

`/admin/responses` shows survey/audience response counts from
`GET /api/surveys/dashboard` and looks up individual responses through
`GET /api/survey-responses/{responseId}`. It follows the backend's
`SurveyResponseDetails` DTO (`id`, `role`, `respondentUsername`, `submittedAt`,
`answers`, `demographics`, and audit timestamps). Answers contain `questionId`,
`selectedLevel`, and `skipped`; demographics contain `fieldKey` and `value`.
Question text is loaded from each known survey's question endpoint, with IDs
shown when that text is unavailable. Details support answer search, filtering,
pagination, and JSON download. This is a read-only review page: the current
backend has no endpoint listing individual responses or deleting them.

`/admin/reports` provides a survey selector, summary counts, audience response
bar chart, answer-status donut chart, and an accessible audience detail table.
`reportService` uses the authenticated `GET /api/surveys/dashboard` response;
survey selection filters its `surveys` collection locally. Reports show the
available counts rather than inferred scores or trends. Refresh reloads the
report data and preserves the selection when that survey still exists.

### Development and production connections

`npm run dev` loads `.env.development`. The browser sends requests to `/api`
on the Vite server, which proxies them to `http://localhost:8080`, preserving
the full API path. Start your backend on that address before using the app.
This keeps browser requests on the same origin during development.

To use a different development backend, copy `.env.development.local.example`
to `.env.development.local` and change `DEV_API_TARGET` to its origin
(for example, `http://localhost:9090`, without `/api`). Keep
`VITE_API_BASE_URL` empty to use the proxy. Restart Vite after changing env files.
The local override is ignored by Git and is only loaded in development mode.

`npm run build` uses the existing `.env.production` settings unchanged:
`VITE_API_BASE_URL` stays empty, and the deployed server/Nginx forwards `/api`
to the production backend. Development proxy settings are not used in production.
`npm run preview` serves the production build locally; it does not provide the
production API reverse proxy. Use `npm run dev` for local backend integration.

The final submission button sends a JSON request to:

```text
POST /api/v1/survey-responses
Content-Type: application/json
Authorization: Bearer <token>   # included only when signed in
```

The payload contains the respondent role, demographics, raw criterion answers,
calculated dimension results, and submission timestamp. A `2xx` response closes
the questionnaire and opens the thank-you page. Network or API errors keep the
respondent on the results page so they can retry safely.


## Project structure

```
src/
  components/
    layout/         Header, ProgressBar, DimensionStepper
    demographics/    RoleSelector, DemographicForm
    survey/          QuestionCard, LevelCard
    results/         RadarScoreChart, DimensionBarChart, LevelDistribution, ExportButtons
  context/           SurveyContext.jsx  (global state, scoring, localStorage persistence)
  data/              roles.js, dimensions.js, surveyQuestions.js/.json, demographics.js/.json
  hooks/             useLocalStorage.js
  pages/             ProfilePage, SurveyPage, ResultsPage
  utils/             scoring.js, exportResults.js
```

## Notes / assumptions
- The source workbook offers a 5th "not enough information to assess" option for the
  Board/Customer/Supplier questionnaires (not for Managers). To honor the brief's
  explicit "4-level scoring matrix", the 4 behavioral levels are always shown as the
  primary choice; the 5th option is exposed as a separate "skip" affordance beneath the
  cards only for roles whose original questionnaire included it.
- Survey progress and answers persist to `localStorage`, so a respondent can close the
  tab and resume later.
