import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../utils/api';
import { validateEmail } from '../utils/helpers';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.userId || !formData.password) {
        setError('Please enter both user ID and password');
        setLoading(false);
        return;
      }

      const response = await authAPI.login({
        userId: formData.userId,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Notify App component to update auth state
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Redirect based on role
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the email from Firebase
      const email = result.user.email;
      
      // Check if email has correct domain
      if (!validateEmail(email)) {
        setError('Please use your university email (.pdn.ac.lk)');
        await auth.signOut();
        return;
      }

      // Verify with backend
      const firebaseToken = await result.user.getIdToken();
      const response = await authAPI.verifyFirebase({ firebaseToken });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Notify App component to update auth state
      window.dispatchEvent(new Event('authStateChanged'));
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>GympAPPa - PERA Sports Management System</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="e.g., e22018"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <button 
          type="button" 
          className="btn-google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span>🔑</span> Sign in with Google
        </button>

        <div className="auth-footer">
          <p>Don't have an account? <a href="/register">Register here</a></p>
          <p><a href="/forgot-password">Forgot password?</a></p>
        </div>
      </div>

      <div className="auth-info">
        <div className="info-card">
          <h4>📚 User Types</h4>
          <ul>
            <li>Student</li>
            <li>Games Captain</li>
            <li>Administrator</li>
            <li>Counter Staff</li>
            <li>Faculty Coordinator</li>
          </ul>
        </div>

        <div className="info-card">
          <h4>✨ Features</h4>
          <ul>
            <li>Equipment Management</li>
            <li>Real-time Availability</li>
            <li>Request Tracking</li>
            <li>Role-based Access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
