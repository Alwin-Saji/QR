import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EventLive from './pages/EventLive';
import Auth from './pages/Auth';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <BrowserRouter>
        <div className="flex min-h-screen bg-theme-1 text-theme-4 font-sans">
          <Sidebar />
          <div className="flex-1 w-full relative overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
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
      </BrowserRouter>
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;
