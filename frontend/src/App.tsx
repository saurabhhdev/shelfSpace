import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { LibraryPage } from './pages/LibraryPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { FavouritesPage } from './pages/FavouritesPage';
import { RecentlyAddedPage } from './pages/RecentlyAddedPage';
import { TrashPage } from './pages/TrashPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0E0F10] text-[#E5E5E5]">
        <div className="w-8 h-8 rounded-none bg-neutral-800 border border-white/10 flex items-center justify-center mb-3">
          <span className="w-2.5 h-2.5 rounded-none bg-[#09AE5B] shadow-[0_0_8px_#09AE5B] animate-pulse"></span>
        </div>
        <div className="text-xs font-mono tracking-wider text-neutral-400">
          Loading Shelfspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public Route Guard (Redirects away from /login or /register if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Marketing Landing Page at '/' */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<Navigate to="/#about" replace />} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:resourceId" element={<ResourceDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        <Route path="/recently-added" element={<RecentlyAddedPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
export default App;
