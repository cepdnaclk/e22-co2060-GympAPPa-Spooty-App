import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../utils/api';
import { validateEmail } from '../utils/helpers';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;

      if (!validateEmail(email)) {
        setError('Please use your university email (.pdn.ac.lk)');
        await signOut(auth);
        setLoading(false);
        return;
      }

      const firebaseToken = await result.user.getIdToken();
      const response = await authAPI.verifyFirebase({ firebaseToken });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('authStateChanged'));

      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Sign Up with Google</h2>
          <p>Use your university Google account to create your GympAPPa profile.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="button" 
          className="btn-google"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          <span>🔑</span> {loading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className="auth-note">
          After Google sign-in, you will go straight to your profile to set the password you will use for later logins.
        </div>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>

      <div className="auth-info">
        <div className="info-card">
          <h4>📋 Registration Requirements</h4>
          <ul>
            <li>Valid university Google account with a .pdn.ac.lk email</li>
            <li>Your profile will be created automatically on first sign-in</li>
            <li>You will set your app password from the profile page</li>
            <li>Accounts start as "Student" role</li>
          </ul>
        </div>

        <div className="info-card">
          <h4>📩 Supported Faculties</h4>
          <ul>
            <li>Faculty of Engineering</li>
            <li>Faculty of Arts</li>
            <li>Faculty of Science</li>
            <li>Faculty of Medicine</li>
            <li>Faculty of Management</li>
            <li>Faculty of Agriculture</li>
            <li>And 3 more...</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
