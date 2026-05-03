import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Navigation from './components/Navigation.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EquipmentDashboard from './pages/EquipmentDashboard.jsx';
import IssueEquipment from './pages/IssueEquipment.jsx';
import ReturnEquipment from './pages/ReturnEquipment.jsx';
import MyIssuedItems from './pages/MyIssuedItems.jsx';
import ManageStock from './pages/ManageStock.jsx';
import StaffRequests from './pages/StaffRequests.jsx';
import './styles/global.css';

const getStoredUser = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

const getRoleHomePath = (role) => {
  switch (role) {
    case 'admin':
      return '/manage-equipment';
    case 'counter-staff':
      return '/pending-requests';
    case 'student':
      return '/request-equipment';
    default:
      return '/dashboard';
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={getRoleHomePath(user?.role)} replace />;
  }
  return children;
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  return token ? <Navigate to={getRoleHomePath(user?.role)} replace /> : children;
};

function App() {
  const [userProfile, setUserProfile] = useState(getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => setUserProfile(getStoredUser());
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return (
    <div className="app-shell">
      <Header userProfile={userProfile} />
      {userProfile && <Navigation role={userProfile.role} />}
      <main className="app-content">
        <Routes>
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/dashboard" element={<RoleRoute roles={['student', 'counter-staff', 'admin']}><Dashboard /></RoleRoute>} />
          <Route path="/equipment-availability" element={<RoleRoute roles={['student', 'counter-staff', 'admin']}><EquipmentDashboard /></RoleRoute>} />
          <Route path="/request-equipment" element={<RoleRoute roles={['student']}><IssueEquipment /></RoleRoute>} />
          <Route path="/return-equipment" element={<RoleRoute roles={['student']}><ReturnEquipment /></RoleRoute>} />
          <Route path="/my-issued-items" element={<RoleRoute roles={['student', 'counter-staff', 'admin']}><MyIssuedItems /></RoleRoute>} />
          <Route path="/pending-requests" element={<RoleRoute roles={['counter-staff', 'admin']}><StaffRequests /></RoleRoute>} />
          <Route path="/profile" element={<RoleRoute roles={['student', 'counter-staff', 'admin']}><Profile /></RoleRoute>} />
          <Route path="/manage-equipment" element={<RoleRoute roles={['admin', 'counter-staff']}><ManageStock /></RoleRoute>} />
          <Route path="/" element={localStorage.getItem('token') ? <Navigate to={getRoleHomePath(getStoredUser()?.role)} replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={localStorage.getItem('token') ? <Navigate to={getRoleHomePath(getStoredUser()?.role)} replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
      {userProfile && <Footer />}
    </div>
  );
}

export default App;
