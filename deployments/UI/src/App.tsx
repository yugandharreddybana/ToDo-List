import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import Layout from './components/Layout';
import FloatingActionButton from './components/FloatingActionButton';
import { useAuthStore } from './stores/auth.store';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Tasks = lazy(() => import('./components/Tasks'));
const Timer = lazy(() => import('./components/Timer'));
const Goals = lazy(() => import('./components/Goals'));
const HealthTracker = lazy(() => import('./components/HealthTracker'));
const Analytics = lazy(() => import('./components/Analytics'));
const AI = lazy(() => import('./components/AI'));
const Settings = lazy(() => import('./components/Settings'));
const DailyPlan = lazy(() => import('./components/DailyPlan'));
const NotificationInbox = lazy(() => import('./components/NotificationInbox'));
const RosterInput = lazy(() => import('./components/RosterInput'));
const Onboarding = lazy(() => import('./components/Onboarding'));

const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ height: '100%' }}>
      {children}
    </motion.div>
  );
}

/** Redirects to /login preserving the current path so we can come back after login */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    // Save the path the user was trying to visit
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, refreshToken } = useAuthStore();
  const [bootstrapped, setBootstrapped] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken().finally(() => setBootstrapped(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bootstrapped) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#8b5cf6',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <Suspense fallback={<div role="status" style={{ padding: 24 }}>Loading…</div>}><AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              // After login, go back to where the user was (or home)
              <Navigate to={(location.state as { from?: string })?.from ?? '/'} replace />
            ) : (
              <PageWrapper><Onboarding /></PageWrapper>
            )
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <FloatingActionButton onOpenAI={() => navigate('/ai')} />
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
                    <Route path="/tasks" element={<PageWrapper><Tasks /></PageWrapper>} />
                    <Route path="/timer" element={<PageWrapper><Timer /></PageWrapper>} />
                    <Route path="/goals" element={<PageWrapper><Goals /></PageWrapper>} />
                    <Route path="/health" element={<PageWrapper><HealthTracker /></PageWrapper>} />
                    <Route path="/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
                    <Route path="/ai" element={<PageWrapper><AI /></PageWrapper>} />
                    <Route path="/roster" element={<PageWrapper><RosterInput /></PageWrapper>} />
                    <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
                    <Route path="/plan" element={<PageWrapper><DailyPlan /></PageWrapper>} />
                    <Route path="/notifications" element={<PageWrapper><NotificationInbox /></PageWrapper>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence></Suspense>
  );
}
