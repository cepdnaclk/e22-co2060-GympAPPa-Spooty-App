import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/navigation.css';

const Navigation = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['student', 'counter-staff', 'admin'] },
    { label: 'Equipment Availability', path: '/equipment-availability', roles: ['student', 'counter-staff', 'admin'] },
    { label: 'Request Equipment', path: '/request-equipment', roles: ['student'] },
    { label: 'Issue History', path: '/my-issued-items', roles: ['student', 'counter-staff', 'admin'] },
    { label: 'Profile', path: '/profile', roles: ['student', 'counter-staff', 'admin'] },
    { label: 'Pending Requests', path: '/pending-requests', roles: ['counter-staff', 'admin'] },
    { label: 'Manage Equipment', path: '/manage-equipment', roles: ['admin', 'counter-staff'] },
  ];

  return (
    <nav className="navigation">
      <ul>
        {menuItems.filter(item => item.roles.includes(role)).map(item => (
          <li key={item.path}>
            <button
              className={location.pathname === item.path ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
