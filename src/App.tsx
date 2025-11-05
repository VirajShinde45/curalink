import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { ResearcherOnboarding } from './pages/researcher/ResearcherOnboarding';
import { ResearcherDashboard } from './pages/researcher/ResearcherDashboard';
import { TrialsSearchPage } from './pages/shared/TrialsSearchPage';
import { PublicationsSearchPage } from './pages/shared/PublicationsSearchPage';
import ForumPage from './pages/shared/ForumPage';
import MeetingRequestsPage from './pages/shared/MeetingRequestsPage';
import { DebugPanel } from './components/DebugPanel';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
}

function DashboardRouter() {
  const { profile, user, loading } = useAuth();
  const [waitTime, setWaitTime] = React.useState(0);
  const [showError, setShowError] = React.useState(false);
  
  React.useEffect(() => {
    // Start a timer to track how long we've been waiting
    if (user && !profile && !loading) {
      const timer = setInterval(() => {
        setWaitTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setWaitTime(0);
    }
  }, [user, profile, loading]);
  
  React.useEffect(() => {
    // Show error after 10 seconds of waiting
    if (waitTime >= 10) {
      setShowError(true);
    }
  }, [waitTime]);
  
  // Debug info for development
  React.useEffect(() => {
    if (user && !profile && !loading) {
      console.log('Debug: User authenticated but no profile found', {
        userId: user.id,
        userEmail: user.email,
        waitTime,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, profile, loading, waitTime]);
  
  if (showError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-lightest">
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-medium p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-neutral-darkest mb-2">Profile Loading Error</h2>
          <p className="text-neutral-dark mb-4">
            We're having trouble loading your profile. This might be due to:
          </p>
          <ul className="text-sm text-neutral-dark text-left mb-6 space-y-1">
            <li>• Profile creation still in progress</li>
            <li>• Network connectivity issues</li>
            <li>• Database synchronization delay</li>
          </ul>
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowError(false);
                setWaitTime(0);
                window.location.reload();
              }}
              className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-neutral-light text-neutral-darkest rounded-xl hover:bg-neutral-medium transition font-semibold"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-lightest">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-neutral-dark">Loading your profile...</p>
        {waitTime > 3 && (
          <p className="text-sm text-neutral-dark mt-2">
            Still loading... ({waitTime}s)
          </p>
        )}
        {waitTime > 6 && (
          <p className="text-xs text-neutral-dark mt-1">
            If this takes much longer, try refreshing the page.
          </p>
        )}
      </div>
    );
  }

  // Redirect to appropriate dashboard based on user type
  if (profile.user_type === 'researcher') {
    return <Navigate to="/researcher/dashboard" replace />;
  }
  
  return <Navigate to="/patient/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/signin" element={<SignInPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />

      {/* Dashboard Router */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Researcher Routes */}
      <Route
        path="/researcher/onboarding"
        element={
          <ProtectedRoute>
            <ResearcherOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/researcher/dashboard"
        element={
          <ProtectedRoute>
            <ResearcherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shared Routes (available to both user types) */}
      <Route
        path="/search/trials"
        element={
          <ProtectedRoute>
            <TrialsSearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/publications"
        element={
          <ProtectedRoute>
            <PublicationsSearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum"
        element={
          <ProtectedRoute>
            <ForumPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute>
            <MeetingRequestsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <DebugPanel />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
