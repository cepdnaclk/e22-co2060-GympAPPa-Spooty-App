import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

const Header = ({ userProfile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authStateChanged'));
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <img src="/logo.png" alt="GympAPPa logo" className="brand-image" />
          <div>
            <h1>GympAPPa</h1>
            <p className="header-subtitle">PERA Sports & Gymnasium Management System</p>
          </div>
        </div>
        {userProfile && (
          <div className="header-actions">
            <div className="header-user">
              <div className="avatar">{userProfile.name?.charAt(0).toUpperCase() || 'U'}</div>
              <span className="user-role">{userProfile.role}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
