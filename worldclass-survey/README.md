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

The frontend connects to `http://localhost:8080` by default. Copy `.env.example`
to `.env.local` to override the server URL.

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
