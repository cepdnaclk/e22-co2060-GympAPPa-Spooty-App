import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/navigation.css';

const Navigation = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      { label: 'Dashboard', path: '/dashboard', roles: ['student', 'games-captain', 'admin', 'counter-staff', 'psu', 'faculty-cordinator', 'coach', 'private-coach', 'academic-staff'] },
      { label: 'Request Equipment', path: '/request-equipment', roles: ['student', 'games-captain', 'admin', 'psu', 'faculty-cordinator', 'coach', 'private-coach', 'academic-staff'] },
      { label: 'Equipment List', path: '/equipment-list', roles: ['admin', 'counter-staff'] },
      { label: 'Add/Update Equipment', path: '/manage-equipment', roles: ['admin', 'counter-staff'] },
      { label: 'Issue Equipment', path: '/issue-equipment', roles: ['counter-staff'] },
      { label: 'Return Equipment', path: '/return-equipment', roles: ['counter-staff'] },
      { label: 'My Issued Items', path: '/my-issued-items', roles: ['counter-staff'] },
      { label: 'My Profile', path: '/profile', roles: ['student', 'games-captain', 'admin', 'counter-staff', 'psu', 'faculty-cordinator', 'coach', 'private-coach', 'academic-staff'] },
    ];
    return commonItems.filter(item => item.roles.includes(role));
  };

  const menuItems = getMenuItems();

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <button className="nav-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => handleNavClick(item.path)}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
