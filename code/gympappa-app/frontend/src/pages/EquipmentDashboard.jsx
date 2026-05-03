import { useEffect, useState } from 'react';
import { equipmentAPI } from '../utils/api.js';
import '../styles/page.css';

const sampleEquipment = {
  Badminton: [
    { id: 1, display_name: 'Badminton Racket', remaining_quantity: 10, total_quantity: 10 },
    { id: 2, display_name: 'Shuttlecock', remaining_quantity: 20, total_quantity: 20 },
  ],
  Basketball: [
    { id: 3, display_name: 'Basketball', remaining_quantity: 8, total_quantity: 8 },
    { id: 4, display_name: 'Basketball Shoes', remaining_quantity: 12, total_quantity: 12 },
  ],
  Cricket: [
    { id: 5, display_name: 'Cricket Bat', remaining_quantity: 6, total_quantity: 6 },
    { id: 6, display_name: 'Cricket Ball', remaining_quantity: 10, total_quantity: 10 },
  ],
  Football: [
    { id: 7, display_name: 'Football', remaining_quantity: 10, total_quantity: 10 },
    { id: 8, display_name: 'Goalkeeper Gloves', remaining_quantity: 4, total_quantity: 4 },
  ],
  Hockey: [
    { id: 9, display_name: 'Hockey Stick', remaining_quantity: 10, total_quantity: 10 },
    { id: 10, display_name: 'Hockey Ball', remaining_quantity: 10, total_quantity: 10 },
  ],
  Netball: [
    { id: 11, display_name: 'Netball', remaining_quantity: 12, total_quantity: 12 },
    { id: 12, display_name: 'Netball Bibs', remaining_quantity: 8, total_quantity: 8 },
  ],
  Rugby: [
    { id: 13, display_name: 'Rugby Ball', remaining_quantity: 6, total_quantity: 6 },
    { id: 14, display_name: 'Rugby Jersey', remaining_quantity: 6, total_quantity: 6 },
  ],
  'Table Tennis': [
    { id: 15, display_name: 'Table Tennis Racket', remaining_quantity: 10, total_quantity: 10 },
    { id: 16, display_name: 'Table Tennis Ball', remaining_quantity: 20, total_quantity: 20 },
  ],
  Tennis: [
    { id: 17, display_name: 'Tennis Racket', remaining_quantity: 8, total_quantity: 8 },
    { id: 18, display_name: 'Tennis Ball', remaining_quantity: 20, total_quantity: 20 },
  ],
  Volleyball: [
    { id: 19, display_name: 'Volleyball', remaining_quantity: 10, total_quantity: 10 },
    { id: 20, display_name: 'Volleyball Net', remaining_quantity: 2, total_quantity: 2 },
  ],
  Baseball: [
    { id: 21, display_name: 'Baseball Bat', remaining_quantity: 6, total_quantity: 6 },
    { id: 22, display_name: 'Baseball', remaining_quantity: 10, total_quantity: 10 },
  ],
  Elle: [
    { id: 23, display_name: 'Elle Bat', remaining_quantity: 10, total_quantity: 10 },
    { id: 24, display_name: 'Elle Ball', remaining_quantity: 8, total_quantity: 8 },
  ],
};

const EquipmentDashboard = () => {
  const [equipment, setEquipment] = useState(sampleEquipment);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    equipmentAPI.getAll().then((res) => {
      const fetched = res.data || {};
      if (Object.keys(fetched).length === 0) {
        setEquipment(sampleEquipment);
      } else {
        setEquipment(fetched);
      }
    }).catch((err) => {
      setError(err.response?.data?.message || 'Unable to load availability');
      setEquipment(sampleEquipment);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <h2>Equipment Availability</h2>
      {loading && <p>Loading availability...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && Object.keys(equipment).length > 0 && (
        <div className="availability-grid">
          {Object.entries(equipment).map(([sport, items]) => (
            <section key={sport} className="availability-section">
              <h3>{sport}</h3>
              <div className="availability-list">
                {items.map((item) => (
                  <div key={item.id} className="availability-item">
                    <strong>{item.display_name}</strong>
                    <span>{item.remaining_quantity > 0 ? 'Available' : 'Unavailable'}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentDashboard;
