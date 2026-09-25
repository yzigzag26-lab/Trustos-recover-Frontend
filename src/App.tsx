import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './pages/Landing';
import { LoginPage, SignupPage, VerifyPage, ForgotPage, ResetPage } from './pages/Auth';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/Dashboard';
import { RecoveryPage } from './pages/Recovery';
import { AssistantPage } from './pages/Assistant';
import { VerificationPage } from './pages/Verification';
import { AccountPage } from './pages/Account';
import { InfoPage } from './pages/Info';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}
function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="route-loading" role="status"><span className="loader-mark" />Preparing your workspace…</div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
}
export default function App() {
  return <><ScrollManager /><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/verify" element={<VerifyPage />} />
    <Route path="/forgot-password" element={<ForgotPage />} />
    <Route path="/reset-password" element={<ResetPage />} />
    <Route path="/security" element={<InfoPage type="security" />} />
    <Route path="/privacy" element={<InfoPage type="privacy" />} />
    <Route path="/terms" element={<InfoPage type="terms" />} />
    <Route path="/app" element={<Protected><AppShell /></Protected>}>
      <Route index element={<DashboardPage />} />
      <Route path="recovery" element={<RecoveryPage />} />
      <Route path="assistant" element={<AssistantPage />} />
      <Route path="verification" element={<VerificationPage />} />
      <Route path="account" element={<AccountPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></>;
}
