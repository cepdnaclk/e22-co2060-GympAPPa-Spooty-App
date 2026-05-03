import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { validateEmail, extractUserIdFromEmail } from '../utils/helpers';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    university_email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
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

    // Validation
    if (!formData.university_email || !formData.password || !formData.confirmPassword || !formData.name) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.university_email)) {
      setError('Please use a valid university email (e.g., e22018@eng.pdn.ac.lk)');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        university_email: formData.university_email,
        password: formData.password,
        name: formData.name
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Notify App component to update auth state
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Show registration success and navigate to profile to complete setup
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const userId = formData.university_email ? extractUserIdFromEmail(formData.university_email) : '';

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Create Your Account</h2>
          <p>GympAPPa - PERA Sports Management System</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="university_email">University Email</label>
            <input
              type="text"
              id="university_email"
              name="university_email"
              value={formData.university_email}
              onChange={handleChange}
              placeholder="e.g., e22018@eng.pdn.ac.lk"
            />
            {formData.university_email && !validateEmail(formData.university_email) && (
              <small className="error">Please use a valid university email</small>
            )}
            {userId && (
              <small className="info">User ID will be: <strong>{userId}</strong></small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name (as in university records)</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
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
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary auth-button"
            disabled={loading || !validateEmail(formData.university_email)}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>

      <div className="auth-info">
        <div className="info-card">
          <h4>📋 Registration Requirements</h4>
          <ul>
            <li>Valid university email (.pdn.ac.lk)</li>
            <li>Your full name as in records</li>
            <li>A secure password</li>
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
