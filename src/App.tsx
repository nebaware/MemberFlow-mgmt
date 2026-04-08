import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './LandingPage';
import Registration from './Registration';
import Login from './Login';
import SuperAdminDashboard from './SuperAdminDashboard';
import OrgAdminDashboard from './OrgAdminDashboard';
import MemberDashboard from './MemberDashboard';
import PublicEventDetails from './PublicEventDetails';
import SuperAdminControlPlane from './SuperAdminControlPlane';
import PublicEvents from './PublicEvents';

const AppRoutes = () => {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-stone-400 font-black tracking-[0.5em] animate-pulse uppercase">Initiating MemberFlow...</div>
    </div>
  );

  const role = user?.role as string | undefined;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/events" element={<PublicEvents />} />
      <Route path="/events/:id" element={<PublicEventDetails />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/register/:orgSlug" element={<Registration />} />
      
      {/* Protected Dashboards */}
      <Route path="/dashboard/*" element={
        !user ? <Navigate to="/login" /> :
        role === 'member' ? <Navigate to="/member" /> :
        isSuperAdmin ? <SuperAdminControlPlane /> :
        <OrgAdminDashboard />
      } />

      <Route path="/member/*" element={
        !user ? <Navigate to="/login" /> : <MemberDashboard />
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
