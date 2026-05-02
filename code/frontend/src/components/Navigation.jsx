import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/navigation.css';

const Navigation = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getMenuItems = () => {
    const allItems = [
      // Student/General user items
      { label: 'Dashboard', path: '/dashboard', roles: ['student', 'games-captain', 'psu', 'faculty-cordinator', 'coach', 'private-coach', 'academic-staff'] },
      { label: 'Request Equipment', path: '/request-equipment', roles: ['student', 'games-captain', 'psu', 'faculty-cordinator', 'coach', 'private-coach', 'academic-staff'] },
      { label: 'Request History', path: '/request-history', roles: ['student', 'games-captain', 'psu', 'faculty-cordinator', 'coach', 'private-coach', 'academic-staff'] },

      // Admin only items
      { label: 'Manage Equipment', path: '/manage-equipment', roles: ['admin'] },
      { label: 'Add Equipment', path: '/add-equipment', roles: ['admin'] },

      // Counter staff only items (consolidated)
      { label: 'Equipment Stock Overview', path: '/issue-equipment', roles: ['counter-staff'] },
      { label: 'Issue / Return Equipment', path: '/staff-equipment', roles: ['counter-staff'] },
      { label: 'Issued Items History', path: '/my-issued-items', roles: ['counter-staff'] },

      // Everyone sees Profile
      { label: 'Profile', path: '/profile', roles: ['student', 'games-captain', 'admin', 'counter-staff', 'psu', 'faculty-cordinator', 'coach', 'private-coach', 'academic-staff'] },
    ];

    return allItems.filter(item => item.roles.includes(role));
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
    <nav className={`navigation ${isMenuOpen ? 'active' : ''}`}>
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