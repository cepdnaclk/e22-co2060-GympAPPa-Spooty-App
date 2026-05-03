import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './styles/global.css';

// Placeholder Dashboard Component
const Dashboard = () => (
  <div style={{ minHeight: 'calc(100vh - 160px)', padding: '40px', textAlign: 'center' }}>
    <h1>Welcome to Dashboard</h1>
    <p>This is a template page. Your teammates will add more pages here.</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const getStoredUser = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    return null;
  }
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const storedUser = getStoredUser();
  const destination = storedUser?.needsPasswordSetup ? '/profile' : '/dashboard';

  return token ? <Navigate to={destination} replace /> : children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          // Basic token validation - check if it's a valid JWT format
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp > currentTime) {
            setIsAuthenticated(true);
            setUserProfile(JSON.parse(user));
          } else {
            // Token expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUserProfile(null);
          }
        } catch (error) {
          // Invalid token format
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUserProfile(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    };

    checkAuth();

    // Listen for storage changes from other tabs
    window.addEventListener('storage', checkAuth);

    // Also listen for custom event that we'll dispatch when registering/logging in
    window.addEventListener('authStateChanged', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {localStorage.getItem('token') && userProfile && <Header userProfile={userProfile} />}
        {localStorage.getItem('token') && userProfile && <Navigation role={userProfile?.role} />}
        
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Auth Routes - Only accessible when NOT logged in */}
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthRoute>
                  <Register />
                </AuthRoute>
              } 
            />

            {/* Protected Routes - Only accessible when logged in */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/request-equipment" 
              element={
                <ProtectedRoute>
                  <div style={{ minHeight: 'calc(100vh - 160px)', padding: '40px', textAlign: 'center' }}>
                    <h1>Request Equipment</h1>
                    <p>Equipment request functionality will be implemented here.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/equipment-list" 
              element={
                <ProtectedRoute>
                  <div style={{ minHeight: 'calc(100vh - 160px)', padding: '40px', textAlign: 'center' }}>
                    <h1>Equipment List</h1>
                    <p>Equipment list functionality will be implemented here.</p>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Default redirect */}
            <Route path="/" element={localStorage.getItem('token') ? <Navigate to={(getStoredUser()?.needsPasswordSetup ? '/profile' : '/dashboard')} replace /> : <Navigate to="/login" replace />} />
            <Route path="*" element={localStorage.getItem('token') ? <Navigate to={(getStoredUser()?.needsPasswordSetup ? '/profile' : '/dashboard')} replace /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>

        {localStorage.getItem('token') && userProfile && <Footer />}
      </div>
    </BrowserRouter>
  );
}

export default App;
