import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PoliceProvider, usePoliceData } from './context';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Personnel } from './pages/Personnel';
import { OccurrenceTypes } from './pages/OccurrenceTypes';
import { OccurrenceRegister } from './pages/OccurrenceRegister';
import { Login } from './pages/Login';
import { UserManagement } from './pages/UserManagement';

const AppRoutes: React.FC = () => {
  const { currentUser } = usePoliceData();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/peculio" element={<Personnel />} />
          <Route path="/tipos" element={<OccurrenceTypes />} />
          <Route path="/registro" element={<OccurrenceRegister />} />
          {currentUser.role === 'admin' && (
             <Route path="/usuarios" element={<UserManagement />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <PoliceProvider>
      <AppRoutes />
    </PoliceProvider>
  );
};

export default App;