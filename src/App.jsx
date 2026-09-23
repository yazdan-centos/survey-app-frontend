import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { SurveyProvider, useSurvey } from './context/SurveyContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import AdminLayout from './components/layout/AdminLayout';
import ProfilePage from './pages/ProfilePage';
import SurveyPage from './pages/SurveyPage';
import ResultsPage from './pages/ResultsPage';
import ThankYouPage from './pages/ThankYouPage';
import { DIMENSIONS } from './data/dimensions';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import AdminSurveysPage from './pages/AdminSurveysPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ResponsesPage from './pages/ResponsesPage';
import { useAuth } from './hooks/useAuth';
import { getPostLoginPath, isAdmin } from './utils/auth';

function AuthGuard() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
}

function AdminGuard() {
    const { user } = useAuth();
    return isAdmin(user) ? <Outlet /> : <Navigate to={getPostLoginPath(user)} replace />;
}

function HomePage() {
    const { user } = useAuth();
    return isAdmin(user) ? <Navigate to={getPostLoginPath(user)} replace /> : <ProfilePage />;
}

// Guards a wizard route: if the person hasn't picked a role yet, send them
// back to the profile step instead of letting them land mid-survey via URL.
function StepGuard({ requireRole, children }) {
    const { state } = useSurvey();
    if (requireRole && !state.roleId) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function AppShell() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />
            <main>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<AuthGuard />}>
                        <Route path="/" element={<HomePage />} />
                        {DIMENSIONS.map((dim) => (
                            <Route
                                key={dim.key}
                                path={`/survey/${dim.key}`}
                                element={
                                    <StepGuard requireRole>
                                        <SurveyPage dimensionKey={dim.key} />
                                    </StepGuard>
                                }
                            />
                        ))}
                        <Route
                            path="/results"
                            element={
                                <StepGuard requireRole>
                                    <ResultsPage />
                                </StepGuard>
                            }
                        />
                        <Route
                            path="/thank-you"
                            element={
                                <StepGuard requireRole>
                                    <ThankYouPage />
                                </StepGuard>
                            }
                        />
                        <Route element={<AdminGuard />}>
                            <Route element={<AdminLayout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/admin/questions" element={<AdminQuestionsPage />} />
                            <Route path="/admin/surveys" element={<AdminSurveysPage />} />
                            <Route path="/admin/users" element={<UsersPage />} />
                            <Route path="/admin/responses" element={<ResponsesPage />} />
                            <Route path="/admin/reports" element={<div className="p-8"><h2 className="text-2xl font-bold">گزارش‌گیری - به زودی</h2></div>} />
                            <Route path="/admin/settings" element={<div className="p-8"><h2 className="text-2xl font-bold">تنظیمات - به زودی</h2></div>} />
                            </Route>
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <SurveyProvider>
                        <AppShell />
                    </SurveyProvider>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}
