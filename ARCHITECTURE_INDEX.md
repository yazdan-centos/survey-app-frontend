# Project overview
JavaScript/JSX ESM; React 19, React Router 7, Vite 8; Persian RTL assessment/admin SPA. Tailwind 3, styled-components, React Hook Form, Recharts. Versions reflect package.json ranges.
Architecture: pages/components -> context/hooks -> injected-request services -> Axios REST backend; bundled JSON powers the respondent wizard. State uses React Context and browser storage; no Redux/store library or backend source in this project.

# File/symbol directory map
Paths below are relative to src/ unless explicitly root-qualified. `*` = default export; `out` = local imports; `in` = direct importers; `ext` = significant external imports. Dependency names retain extensions and uniquely identify entries. React and lucide-react imports are omitted throughout. `-` = none. Incoming edges are static imports, not runtime call tracing.

```text
src/
  App.jsx, main.jsx, index.css
  components/{admin,demographics,guides,layout,questionTypes,results,survey}/
  config/  context/  data/  hooks/  pages/  services/  theme/  utils/
```

```text
App.jsx -> [App*] : Provider composition, routing, authentication/admin/role guards. | out:SurveyContext.jsx,AuthContext.jsx,ThemeContext.jsx,Header.jsx,AdminLayout.jsx,ProfilePage.jsx,SurveyPage.jsx,ResultsPage.jsx,ThankYouPage.jsx,dimensions.js,AdminQuestionsPage.jsx,AdminSurveysPage.jsx,LoginPage.jsx,DashboardPage.jsx,UsersPage.jsx,ResponsesPage.jsx,useAuth.js,auth.js | in:main.jsx | ext:react-router-dom
components/admin/ResponseDetails.jsx -> [ResponseDetails*] : Read-only response details, answer search/filter/pagination, JSON download. | out:responseDisplay.js | in:ResponsesPage.jsx
components/admin/SurveyForm.jsx -> [SurveyForm*] : Create/edit survey title and version with validation. | out:- | in:AdminSurveysPage.jsx | ext:react-hook-form
components/admin/SurveyStatusBadge.jsx -> [SurveyStatusBadge*] : Render survey status metadata as a badge. | out:surveyStatus.js | in:SurveyTable.jsx
components/admin/SurveyTable.jsx -> [SurveyTable*] : Survey rows with edit, activation and deletion callbacks. | out:SurveyStatusBadge.jsx | in:AdminSurveysPage.jsx
components/admin/UserForm.jsx -> [UserForm*] : Validate user identity, password and admin-access fields. | out:auth.js | in:UsersPage.jsx
components/demographics/DemographicForm.jsx -> [DemographicForm*] : Paginated role-specific demographic form and validation. | out:demographics.js | in:ProfilePage.jsx | ext:react-hook-form
components/demographics/RoleSelector.jsx -> [RoleSelector*] : Selectable respondent-role cards; currently unreferenced. | out:roles.js | in:-
components/guides/BoardGuide.jsx -> [BoardGuide*] : Board assessment instructions; currently unreferenced. | out:- | in:- | ext:styled-components
components/guides/ManagerGuide.jsx -> [ManagerGuide*] : Assessment introduction with continue callback; used for all roles. | out:- | in:SurveyPage.jsx | ext:styled-components
components/guides/StakeholderGuide.jsx -> [StakeholderGuide*] : Stakeholder assessment instructions; currently unreferenced. | out:- | in:- | ext:styled-components
components/layout/AdminLayout.jsx -> [AdminLayout*] : Responsive admin shell, sidebar and nested route outlet. | out:AdminSidebar.jsx | in:App.jsx | ext:react-router-dom
components/layout/AdminSidebar.jsx -> [AdminSidebar*] : Admin route navigation links. | out:- | in:AdminLayout.jsx | ext:react-router-dom
components/layout/DimensionStepper.jsx -> [DimensionStepper*] : Dimension navigation and completion indicators. | out:dimensions.js,SurveyContext.jsx | in:SurveyPage.jsx
components/layout/Header.jsx -> [Header*] : Application heading, user sign-out and theme control. | out:useAuth.js,ThemeToggle.jsx | in:App.jsx
components/layout/ProgressBar.jsx -> [ProgressBar*] : Labeled survey completion percentage. | out:- | in:SurveyPage.jsx
components/layout/ThemeToggle.jsx -> [ThemeToggle*] : Light/dark mode toggle. | out:ThemeContext.jsx | in:Header.jsx
components/questionTypes/QuestionTypeRenderer.jsx -> [QuestionTypeRenderer*] : Dispatch likert, maturityLevels and text inputs; other types return null. | out:LevelCard.jsx | in:QuestionCard.jsx
components/results/DimensionBarChart.jsx -> [DimensionBarChart*] : Theme-aware dimension score bar chart. | out:ThemeContext.jsx | in:DashboardPage.jsx,ResultsPage.jsx | ext:recharts
components/results/ExportButtons.jsx -> [ExportButtons*] : Trigger results JSON and dashboard PDF downloads. | out:exportResults.js | in:ResultsPage.jsx
components/results/LevelDistribution.jsx -> [LevelDistribution*] : Display level counts and skipped-answer distribution. | out:- | in:DashboardPage.jsx,ResultsPage.jsx
components/results/RadarScoreChart.jsx -> [RadarScoreChart*] : Theme-aware dimension score radar chart. | out:ThemeContext.jsx | in:DashboardPage.jsx,ResultsPage.jsx | ext:recharts
components/survey/LevelCard.jsx -> [LevelCard*] : Selectable maturity-level card. | out:- | in:QuestionTypeRenderer.jsx
components/survey/QuestionCard.jsx -> [QuestionCard*] : Maturity-level question, optional skip and previous/next controls. | out:QuestionTypeRenderer.jsx | in:SurveyPage.jsx
config/api.js -> [API_BASE_URL, API_PATHS] : Environment-backed API origin and endpoint builders. | out:- | in:adminDashboardService.js,adminSurveyService.js,authService.js,httpService.js,responseService.js,surveyService.js,userService.js
context/AuthContext.jsx -> [AuthContext, AuthProvider] : Session-persisted token/user state and authentication actions. | out:authService.js | in:App.jsx,useAuth.js
context/SurveyContext.jsx -> [SurveyProvider, useSurvey] : Persistent survey answers, wizard navigation, completion and scoring. | out:useLocalStorage.js,dimensions.js,surveyQuestions.js,roles.js | in:App.jsx,DimensionStepper.jsx,ProfilePage.jsx,ResultsPage.jsx,SurveyPage.jsx,ThankYouPage.jsx | ext:react-router-dom
context/ThemeContext.jsx -> [ThemeProvider, useTheme] : Persistent color mode, document dark class and shared palette. | out:colors.js | in:App.jsx,ThemeToggle.jsx,DimensionBarChart.jsx,RadarScoreChart.jsx
data/demographics.js -> [getDemographicQuestions, raw*] : Lookup demographic questions by demographic group; re-export raw data. | out:demographics.json | in:DemographicForm.jsx
data/demographics.json -> [default data] : Bundled managers/board/stakeholders demographic question definitions. | out:- | in:demographics.js
data/dimensions.js -> [DIMENSIONS, getDimensionByKey] : Five ordered dimension definitions, icons and colors. | out:- | in:App.jsx,DimensionStepper.jsx,SurveyContext.jsx,surveyQuestions.js,ProfilePage.jsx,SurveyPage.jsx,adminDashboardService.js
data/questionTypes.js -> [QUESTION_TYPES, QUESTION_TYPE_OPTIONS, isKnownQuestionType] : Question-type metadata and authoring options. | out:- | in:AdminQuestionsPage.jsx
data/roles.js -> [ROLES, getRoleById] : Four respondent roles, demographic mapping and skip permissions. | out:- | in:RoleSelector.jsx,SurveyContext.jsx,ProfilePage.jsx,responseDisplay.js
data/surveyQuestions.js -> [getQuestionsByRole, getFlatQuestions, getTotalQuestionCount, raw*] : Group/flatten/count bundled questions by role; re-export raw data. | out:surveyQuestions.json,dimensions.js | in:SurveyContext.jsx
data/surveyQuestions.json -> [default data] : Bundled role-keyed maturity questions and level descriptions. | out:- | in:surveyQuestions.js
data/surveyStatus.js -> [SURVEY_STATUS, SURVEY_STATUS_FILTER_OPTIONS, getSurveyStatusMeta] : Active/inactive survey metadata and filter options. | out:- | in:SurveyStatusBadge.jsx,AdminSurveysPage.jsx
hooks/useAdminDashboard.js -> [useAdminDashboard] : Fetch paginated dashboard data with loading/error/refresh and cancellation. | out:useHttp.js,adminDashboardService.js | in:DashboardPage.jsx
hooks/useAuth.js -> [useAuth] : Consume AuthContext with provider-presence validation. | out:AuthContext.jsx | in:App.jsx,Header.jsx,useHttp.js,LoginPage.jsx,ResultsPage.jsx
hooks/useHttp.js -> [useHttp] : Bind bearer token to HTTP calls and sign out on authenticated 401. | out:useAuth.js,httpService.js | in:useAdminDashboard.js,AdminSurveysPage.jsx,ResponsesPage.jsx,ResultsPage.jsx,UsersPage.jsx
hooks/useLocalStorage.js -> [useLocalStorage] : JSON-persisted React state with setter and reset callback. | out:- | in:SurveyContext.jsx
index.css -> [-] : Tailwind layers and global light/dark form and focus styles. | out:- | in:main.jsx
main.jsx -> [-] : Mount App under React StrictMode. | out:index.css,App.jsx | in:root:index.html | ext:react-dom/client
pages/AdminQuestionsPage.jsx -> [AdminQuestionsPage*] : Local-only question drafts and XLSX/CSV import; no API persistence. | out:questionTypes.js | in:App.jsx | ext:xlsx
pages/AdminSurveysPage.jsx -> [AdminSurveysPage*] : Survey CRUD, status filtering and activation workflow. | out:useHttp.js,adminSurveyService.js,surveyStatus.js,SurveyForm.jsx,SurveyTable.jsx | in:App.jsx
pages/DashboardPage.jsx -> [DashboardPage*] : Admin totals, aggregate charts and paginated submissions. | out:RadarScoreChart.jsx,DimensionBarChart.jsx,LevelDistribution.jsx,useAdminDashboard.js,scoring.js | in:App.jsx
pages/LoginPage.jsx -> [LoginPage*] : Sign-in form and role-based landing redirect. | out:useAuth.js,auth.js | in:App.jsx | ext:react-router-dom
pages/ProfilePage.jsx -> [ProfilePage*] : Assign random role when absent and collect demographics. | out:DemographicForm.jsx,SurveyContext.jsx,roles.js,dimensions.js | in:App.jsx
pages/ResponsesPage.jsx -> [ResponsesPage*] : Response counts and UUID lookup with question-text enrichment. | out:useHttp.js,responseService.js,responseDisplay.js,ResponseDetails.jsx | in:App.jsx
pages/ResultsPage.jsx -> [ResultsPage*] : Show/export scores and submit response payload to API. | out:SurveyContext.jsx,useHttp.js,useAuth.js,surveyService.js,RadarScoreChart.jsx,DimensionBarChart.jsx,LevelDistribution.jsx,ExportButtons.jsx,scoring.js | in:App.jsx
pages/SurveyPage.jsx -> [SurveyPage*] : Per-dimension questionnaire; final next opens thank-you directly. | out:SurveyContext.jsx,dimensions.js,DimensionStepper.jsx,ProgressBar.jsx,QuestionCard.jsx,ManagerGuide.jsx | in:App.jsx
pages/ThankYouPage.jsx -> [ThankYouPage*] : Completion confirmation and survey reset. | out:SurveyContext.jsx | in:App.jsx
pages/UsersPage.jsx -> [UsersPage*] : User CRUD with local search/access filtering/pagination. | out:UserForm.jsx,useHttp.js,userService.js,auth.js | in:App.jsx
services/adminDashboardService.js -> [normalizeAdminDashboard, getAdminDashboard] : Fetch dashboard and normalize summary, aggregates and submissions. | out:api.js,dimensions.js | in:useAdminDashboard.js
services/adminSurveyService.js -> [listSurveys, createSurvey, updateSurvey, deleteSurvey, setSurveyActive] : Survey CRUD and activation via PUT; normalize/filter active status. | out:api.js | in:AdminSurveysPage.jsx
services/authService.js -> [login, getCurrentUser] : Login and current-user HTTP calls. | out:api.js,httpService.js | in:AuthContext.jsx
services/httpService.js -> [HttpError, httpRequest] : Shared Axios client, strict JSON responses, per-request bearer tokens and normalized errors. | out:api.js | in:useHttp.js,authService.js | ext:axios
services/responseService.js -> [isResponseId, getResponseOverview, getResponse, getResponseQuestions] : Validate UUIDs, load response overview/details and collect survey questions. | out:api.js | in:ResponsesPage.jsx
services/surveyService.js -> [submitSurveyResponse] : POST survey response using an injected request function. | out:api.js | in:ResultsPage.jsx
services/userService.js -> [listUsers, createUser, updateUser, deleteUser] : User CRUD and normalization of array/items/content list responses. | out:api.js | in:UsersPage.jsx
theme/colors.js -> [PRIMARY, CHARCOAL, THEME_COLORS, THEME_COLORS*] : Shared primary/charcoal palettes for context and Tailwind. | out:- | in:ThemeContext.jsx,tailwind.config.js
utils/auth.js -> [isAdmin, getPostLoginPath] : Resolve admin privileges and post-login destination. | out:- | in:App.jsx,UserForm.jsx,LoginPage.jsx,UsersPage.jsx
utils/exportResults.js -> [buildResultsPayload, downloadJson, downloadNodeAsPdf] : Build export payload and download JSON or DOM-rendered PDF. | out:- | in:ExportButtons.jsx | ext:jspdf,html2canvas
utils/responseDisplay.js -> [responseRoleLabel, responseDate, responseNumber] : Format response role, date and numeric labels. | out:roles.js | in:ResponseDetails.jsx,ResponsesPage.jsx
utils/scoring.js -> [scoreToLevelLabel, scoreToPercent] : Convert average score to performance label or percentage. | out:- | in:DashboardPage.jsx,ResultsPage.jsx
```

Root integration: `index.html` -> src/main.jsx (lang=fa, dir=rtl); `vite.config.js` -> default config (@vitejs/plugin-react); `tailwind.config.js` -> default config (theme/colors.js, class dark mode); `postcss.config.js` -> default config (tailwindcss/autoprefixer). `package.json`: dev/build/preview via Vite, lint via oxlint; test via node --test tests/*.test.js. tests/http.test.js covers HTTP, cancellation, authenticated hooks and service payloads using a local server and Vite SSR loading.

# Global state & shared utilities

- Provider order: ThemeProvider > AuthProvider > BrowserRouter > SurveyProvider > AppShell. App-local guards are not exports: AuthGuard, AdminGuard, StepGuard; HomePage dispatches admin landing.
- AuthContext/useAuth: user, accessToken, isAuthenticated, signIn/signOut/refreshUser; sessionStorage `wcs:auth:v1`. isAdmin prefers boolean user.isAdmin, otherwise ADMIN roles/ROLE_ADMIN authorities.
- SurveyContext/useSurvey: state={roleId,demographics,answers,managerGuideSeen,submittedAt}; localStorage `wcs:survey-state:v1`. Actions=setRole,setDemographics,answerQuestion,acknowledgeManagerGuide,goToStep,resetSurvey,finishSurvey. Derived=role,dimensionsWithQuestions,flatQuestions,stepOrder,isDimensionComplete,isSurveyComplete,answeredCount,progressPercent,dimensionScores,overallAverage,levelDistribution.
- Scoring resides in SurveyContext: numeric answers averaged per dimension, skip excluded; overall average is the mean of nonzero dimension averages. utils/scoring only formats labels/percentages.
- ThemeContext/useTheme: primary/charcoal palettes, mode,isDark,toggleMode,setMode; localStorage `worldclass-survey:color-mode`; initial OS preference fallback.
- useHttp -> httpRequest -> Axios; useHttp injects auth token and handles 401 sign-out. CRUD/dashboard/response services receive request as an argument; authService calls httpRequest directly. Options use Axios data/params/signal; responses unwrap data, empty bodies become null, errors retain message/status/data (network=0); cancellations retain Axios CanceledError. Default responseType=json is strict; text/blob can be requested explicitly. useAdminDashboard returns data/loading/error/refresh.
- Shared export/display: exportResults (jsPDF/html2canvas/JSON); responseDisplay (role/date/number); data/roles,dimensions,questionTypes,surveyStatus provide reusable metadata.

Routes: `/login` public; `/` profile or admin redirect; `/survey/:dimensionKey`, `/results`, `/thank-you` require auth + selected role. `/dashboard`, `/admin/{questions,surveys,users,responses,reports,settings}` require admin and use AdminLayout; reports/settings are placeholders. Dimension keys: customerFocus, resourcesCapabilities, strategicVision, valueCreation, qualityFocus.

API: origin=`VITE_API_BASE_URL` or `http://localhost:8080`; auth=`POST /api/auth/login`, `GET /api/v1/auth/me`; dashboard=`GET /api/surveys/dashboard`; surveys CRUD=`/api/v1/surveys[/{id}]`; users CRUD=`/api/users[/{id}]`; submit/detail=`POST /api/survey-responses`, `GET /api/survey-responses/{id}`; question enrichment=`GET /api/questions/survey/{surveyId}`. config/api.js also declares question/answer CRUD, import/export, active-survey and user-sync paths with no current service callers.

Navigation/integration facts: SurveyPage final next calls finishSurvey -> /thank-you, bypassing ResultsPage and its API submission. ResultsPage is separately routed. ProfilePage assigns a random role; RoleSelector is unused. ManagerGuide is shown without a role check; BoardGuide/StakeholderGuide are unused. AdminQuestionsPage drafts are component state only. singleChoice metadata exists but QuestionTypeRenderer does not render it; QuestionCard always requests maturityLevels. README submission path /api/v1/survey-responses differs from implemented /api/survey-responses; this index follows source.

Coverage: 64 source/data/style files, all exported declarations and local import edges verified against current files. Snapshot: 2026-09-23. Excludes dependencies, build output, .git, lock files, coverage, assets/images, archives and existing documentation bodies. Recheck changed files after edits; this is a static index.
