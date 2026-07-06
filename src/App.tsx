import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Patients from './pages/patients/Patients';
import Appointments from './pages/appointments/Appointments';
import OPD from './pages/opd/OPD';
import IPD from './pages/ipd/IPD';
import Pharmacy from './pages/pharmacy/Pharmacy';
import Laboratory from './pages/laboratory/Laboratory';
import Radiology from './pages/radiology/Radiology';
import Billing from './pages/billing/Billing';
import Admin from './pages/admin/Admin';
import SuperModule from './pages/SuperModule';

const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <TopNav onMenuToggle={() => setCollapsed(!collapsed)} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <ShellLayout>{children}</ShellLayout> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/opd" element={<PrivateRoute><OPD /></PrivateRoute>} />
          <Route path="/ipd" element={<PrivateRoute><IPD /></PrivateRoute>} />
          <Route path="/pharmacy" element={<PrivateRoute><Pharmacy /></PrivateRoute>} />
          <Route path="/laboratory" element={<PrivateRoute><Laboratory /></PrivateRoute>} />
          <Route path="/radiology" element={<PrivateRoute><Radiology /></PrivateRoute>} />
          <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          
          {/* SuperModule catch-all for remaining minor modules */}
          <Route path="/emergency" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/emr" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/nursing" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/ot" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/beds" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/insurance" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/doctors" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/staff" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/bloodbank" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/ambulance" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/diet" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/housekeeping" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/mrd" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/crm" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><SuperModule /></PrivateRoute>} />
          <Route path="/compliance" element={<PrivateRoute><SuperModule /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;
