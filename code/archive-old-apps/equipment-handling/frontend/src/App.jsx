import { useState, useEffect } from 'react';
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import UpdateStockList from "./pages/UpdateStockList";
import UpdateStock from "./pages/UpdateStock";
import ManageStock from "./pages/ManageStock";
import AddEquipment from "./pages/AddEquipment";
//import Login from './pages/Login';
//import Register from './pages/Register';
//import Profile from './pages/Profile';
import './styles/global.css';

// Placeholder Dashboard Component
const Dashboard = () => (
  <div style={{ minHeight: 'calc(100vh - 160px)', padding: '40px', textAlign: 'center' }}>
    <h1>Welcome to Dashboard</h1>
    <p>This is a template page. Your teammates will add more pages here.</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  //Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
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
        {localStorage.getItem('token') && userProfile && (<Header userProfile={userProfile} />)}
        {localStorage.getItem('token') && userProfile && (<Navigation role={userProfile.role} />)}
        {localStorage.getItem('token') && userProfile && <Footer />}
        
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Auth Routes - Only accessible when NOT logged in */}
            
            

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
              path="/update-stock-list" 
              element={
                <ProtectedRoute allowedRoles={["admin", "counter-staff"]}>
                  <UpdateStockList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/update-stock/:id" 
              element={
                <ProtectedRoute allowedRoles={["admin", "counter-staff"]}>
                  <UpdateStock />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/manage-stock" 
              element={
                <ProtectedRoute allowedRoles={["admin", "counter-staff"]}>
                  <ManageStock />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/add-equipment" 
              element={
                <ProtectedRoute allowedRoles={["admin", "counter-staff"]}>
                  <AddEquipment />
                </ProtectedRoute>
              } 
            />


            {/* Default redirect */}
            <Route path="/" element={localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
            <Route path="*" element={localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

          </Routes>
        </main>

        
      </div>
    </BrowserRouter>
  );
}

export default App;
