import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api.js';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ userId: '', name: '', universityEmail: '', password: '', confirmPassword: '', role: 'student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.register(formData);
      setSuccess('Registration successful! Redirecting to your home page...');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('authStateChanged'));
      const redirectTo = response.data.user?.role ? 
        (response.data.user.role === 'admin' ? '/manage-equipment' : response.data.user.role === 'counter-staff' ? '/pending-requests' : '/request-equipment') : '/dashboard';
      setTimeout(() => navigate(redirectTo), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        <p>Create a new GympAPPa account using your university email.</p>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            User ID
            <input name="userId" value={formData.userId} onChange={handleChange} placeholder="e22018" />
          </label>
          <label>
            Full Name
            <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
          </label>
          <label>
            University Email
            <input name="universityEmail" value={formData.universityEmail} onChange={handleChange} placeholder="e22018@students.pdn.ac.lk" />
          </label>
          <label>
            Register as
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="counter-staff">Counter Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} />
          </label>
          <label>
            Confirm Password
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>
        <div className="auth-divider">OR</div>
        <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default Register;
