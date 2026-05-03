import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, firebaseReady, firebaseError } from '../config/firebase.js';
import { authAPI } from '../utils/api.js';
import { validateEmail } from '../utils/helpers.js';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('authStateChanged'));
      const redirectTo = response.data.user?.role ? 
        (response.data.user.role === 'admin' ? '/manage-equipment' : response.data.user.role === 'counter-staff' ? '/pending-requests' : '/request-equipment') : '/dashboard';
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      if (!validateEmail(email)) {
        setError('Please use your university email (.pdn.ac.lk)');
        setLoading(false);
        return;
      }
      const firebaseToken = await result.user.getIdToken();
      const response = await authAPI.verifyFirebase({ firebaseToken });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('authStateChanged'));
      const redirectTo = response.data.user?.role ? 
        (response.data.user.role === 'admin' ? '/manage-equipment' : response.data.user.role === 'counter-staff' ? '/pending-requests' : '/request-equipment') : '/dashboard';
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>GympAPPa Sign In</h2>
        <p>Access equipment management and availability tools.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            User ID
            <input name="userId" value={formData.userId} onChange={handleChange} placeholder="e22018" />
          </label>
          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        {firebaseReady ? (
          <>
            <div className="auth-divider">OR</div>
            <button className="btn-secondary" onClick={handleGoogleLogin} disabled={loading}>
              Continue with Google
            </button>
          </>
        ) : (
          <div className="auth-info">
            Google login is disabled because Firebase is not configured. Please add your Firebase config values to `frontend/.env`.
          </div>
        )}
        {firebaseError && (
          <div className="auth-error">
            Firebase initialization error: {firebaseError.message}
          </div>
        )}
        <p className="auth-caption">
          Don&apos;t have an account? <Link to="/register" className="link-button">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
