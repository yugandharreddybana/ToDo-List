import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Timer from './components/Timer';
import Goals from './components/Goals';
import CareerCRM from './components/CareerCRM';
import HealthTracker from './components/HealthTracker';
import Analytics from './components/Analytics';
import AI from './components/AI';
import Settings from './components/Settings';
import RosterInput from './components/RosterInput';
import Onboarding from './components/Onboarding';
import { useAuthStore } from './stores/auth.store';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, refreshToken } = useAuthStore();
  const [bootstrapped, setBootstrapped] = useState(false);
  const location = useLocation();

  useEffect(() => {
    refreshToken().finally(() => setBootstrapped(true));
  }, [refreshToken]);

  if (!bootstrapped) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <PageWrapper>
                <Onboarding />
              </PageWrapper>
            )
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
                    <Route path="/tasks" element={<PageWrapper><Tasks /></PageWrapper>} />
                    <Route path="/timer" element={<PageWrapper><Timer /></PageWrapper>} />
                    <Route path="/goals" element={<PageWrapper><Goals /></PageWrapper>} />
                    <Route path="/career" element={<PageWrapper><CareerCRM /></PageWrapper>} />
                    <Route path="/health" element={<PageWrapper><HealthTracker /></PageWrapper>} />
                    <Route path="/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
                    <Route path="/ai" element={<PageWrapper><AI /></PageWrapper>} />
                    <Route path="/roster" element={<PageWrapper><RosterInput /></PageWrapper>} />
                    <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
