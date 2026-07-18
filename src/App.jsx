import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import CustomScrollbar from './components/CustomScrollbar';

import Home from './pages/Home';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const EventLive = React.lazy(() => import('./pages/EventLive'));
const Auth = React.lazy(() => import('./pages/Auth'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-theme-1 text-theme-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-4"></div>
  </div>
);

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex min-h-screen bg-theme-1 text-theme-4 font-sans">
      <CustomScrollbar />
      {!isHome && <Sidebar />}
      <div className="flex-1 relative overflow-x-hidden">
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/event/:eventId" element={<EventLive />} />
          </Routes>
        </React.Suspense>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#995F2F',
            color: '#E4D6A9',
            border: '1px solid #978F66',
          },
          success: {
            iconTheme: {
              primary: '#E4D6A9',
              secondary: '#622B14',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;
