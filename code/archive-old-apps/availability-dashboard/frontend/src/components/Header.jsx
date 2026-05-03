import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.PNG';
import '../styles/header.css';

const DEFAULT_PROFILE_IMAGE = 'https://ui-avatars.com/api/?name=User&background=0D8A4E&color=fff';

const Header = ({ userProfile }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authStateChanged'));
    navigate('/login');
  };

  const profileImage = userProfile?.profilePicture || DEFAULT_PROFILE_IMAGE;

  const handleImgError = (e) => {
    e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
  };

  return (
    <header className="header">
      <div className="header-container">
        <img src={logo} alt="GympAPPa Logo" className="header-logo" />
        <div className="logo">
          <h1>GympAPPa</h1>
          <p className="tagline">PERA Sports and Gymnasium Management System</p>
        </div>
        <div className="logo-spacer"></div>
        <div className="header-right">
          <div className="user-section">
            <button onClick={handleLogout} className="btn-logout">Logout</button>
            <img
              src={profileImage}
              alt="Profile"
              className="profile-pic"
              onClick={handleProfileClick}
              title="Click to view profile"
              onError={handleImgError}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;