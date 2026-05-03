import { useEffect, useState } from 'react';
import { equipmentAPI } from '../utils/api.js';
import '../styles/page.css';

const Dashboard = () => {
  const [equipment, setEquipment] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    equipmentAPI.getAll().then((res) => {
      setEquipment(res.data);
    }).catch((err) => {
      setError(err.response?.data?.message || 'Unable to load equipment');
    }).finally(() => setLoading(false));
  }, []);

  const roleLabel = currentUser?.role === 'admin' ? 'administrator' : currentUser?.role === 'counter-staff' ? 'counter staff' : 'student';

  return (
    <div className="page-shell">
      <h2>Dashboard</h2>
      <p>Welcome back, {currentUser?.name || 'User'}. Your role: {roleLabel}.</p>
      <p>Manage equipment requests, availability, and student history from a single app.</p>
      {loading && <p>Loading equipment...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <div className="cards-grid">
          {Object.entries(equipment).map(([sport, items]) => (
            <div key={sport} className="card-item">
              <h3>{sport}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item.id}>{item.display_name}: {item.remaining_quantity}/{item.total_quantity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
