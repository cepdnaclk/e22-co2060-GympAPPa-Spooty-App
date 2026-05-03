import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api.js';
import { DEFAULT_PROFILE_PICTURE, getRoleDisplayName } from '../utils/helpers.js';
import '../styles/profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', profilePicture: '', tel: '', personalEmail: '', district: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    authAPI.getProfile().then((res) => {
      setProfile(res.data.user);
      setFormData({
        name: res.data.user.name || '',
        profilePicture: res.data.user.profilePicture || '',
        tel: res.data.user.tel || '',
        personalEmail: res.data.user.personalEmail || '',
        district: res.data.user.district || '',
      });
    }).catch(() => {
      setError('Unable to load profile.');
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.updateProfile(formData);
      setProfile(res.data.user);
      setMessage('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile');
    }
  };

  if (!profile) {
    return <div className="page-shell"><p>Loading profile…</p></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          <p>{getRoleDisplayName(profile.role)}</p>
        </div>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="profile-grid">
          <div className="profile-sidebar">
            <img src={profile.profilePicture || DEFAULT_PROFILE_PICTURE} alt="Profile" className="profile-avatar" />
            <div className="profile-summary">
              <p><strong>User ID</strong> {profile.userId}</p>
              <p><strong>Email</strong> {profile.email}</p>
              <p><strong>Role</strong> {getRoleDisplayName(profile.role)}</p>
            </div>
          </div>
          <div className="profile-main">
            <form onSubmit={handleSubmit} className="profile-form">
              <label>
                Full Name
                <input name="name" value={formData.name} onChange={handleChange} />
              </label>
              <label>
                Phone
                <input name="tel" value={formData.tel} onChange={handleChange} />
              </label>
              <label>
                Personal Email
                <input name="personalEmail" value={formData.personalEmail} onChange={handleChange} />
              </label>
              <label>
                District
                <input name="district" value={formData.district} onChange={handleChange} />
              </label>
              <div className="profile-actions">
                <button className="btn-primary" type="submit">Save</button>
                <button className="btn-secondary" type="button" onClick={() => navigate('/dashboard')}>Back</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
