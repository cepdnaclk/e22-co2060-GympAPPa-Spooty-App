import { useEffect, useState } from 'react';
import { equipmentAPI } from '../utils/api.js';
import '../styles/page.css';

const seededEquipmentFallback = [
  { id: 1, sportName: 'Badminton', display_name: 'Badminton Racket', total_quantity: 15, remaining_quantity: 15 },
  { id: 2, sportName: 'Badminton', display_name: 'Shuttlecock (tube)', total_quantity: 20, remaining_quantity: 20 },
  { id: 3, sportName: 'Basketball', display_name: 'Basketball', total_quantity: 8, remaining_quantity: 8 },
  { id: 4, sportName: 'Cricket', display_name: 'Cricket Bat', total_quantity: 8, remaining_quantity: 8 },
  { id: 5, sportName: 'Cricket', display_name: 'Cricket Ball', total_quantity: 10, remaining_quantity: 10 },
  { id: 6, sportName: 'Football', display_name: 'Football', total_quantity: 10, remaining_quantity: 10 },
  { id: 7, sportName: 'Hockey', display_name: 'Hockey Stick', total_quantity: 10, remaining_quantity: 10 },
  { id: 8, sportName: 'Hockey', display_name: 'Hockey Ball', total_quantity: 10, remaining_quantity: 10 },
  { id: 9, sportName: 'Netball', display_name: 'Netball', total_quantity: 6, remaining_quantity: 6 },
  { id: 10, sportName: 'Rugby', display_name: 'Rugby Ball', total_quantity: 5, remaining_quantity: 5 },
  { id: 11, sportName: 'Table Tennis', display_name: 'Table Tennis Bat', total_quantity: 12, remaining_quantity: 12 },
  { id: 12, sportName: 'Table Tennis', display_name: 'Table Tennis Ball', total_quantity: 30, remaining_quantity: 30 },
  { id: 13, sportName: 'Tennis', display_name: 'Tennis Racket', total_quantity: 8, remaining_quantity: 8 },
  { id: 14, sportName: 'Tennis', display_name: 'Tennis Ball', total_quantity: 20, remaining_quantity: 20 },
  { id: 15, sportName: 'Volleyball', display_name: 'Volleyball', total_quantity: 6, remaining_quantity: 6 },
  { id: 16, sportName: 'Baseball', display_name: 'Baseball Bat', total_quantity: 4, remaining_quantity: 4 },
  { id: 17, sportName: 'Baseball', display_name: 'Baseball', total_quantity: 10, remaining_quantity: 10 },
  { id: 18, sportName: 'Elle', display_name: 'Elle Bat', total_quantity: 6, remaining_quantity: 6 },
];

const IssueEquipment = () => {
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const [equipment, setEquipment] = useState(seededEquipmentFallback);
  const [studentId, setStudentId] = useState(currentUser?.role === 'student' ? currentUser.userId : '');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pickupTime, setPickupTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const equipmentOptions = equipment
    .slice()
    .sort((a, b) => {
      const sportA = a.sportName || '';
      const sportB = b.sportName || '';
      if (sportA !== sportB) return sportA.localeCompare(sportB);
      return a.display_name.localeCompare(b.display_name);
    });

  useEffect(() => {
    equipmentAPI.getAll().then((res) => {
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : Object.entries(data).flatMap(([sportName, items]) =>
            items.map((item) => ({ ...item, sportName })),
          );
      if (list.length > 0) {
        setEquipment(list);
      }
    }).catch(() => {
      setError('Unable to load equipment. Showing seeded list.');
      setEquipment(seededEquipmentFallback);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if ((!studentId && currentUser?.role !== 'student') || !selectedEquipment || quantity <= 0 || !pickupTime) {
      setError('Fill all fields before submitting.');
      return;
    }

    try {
      const requestBody = {
        equipment_id: Number(selectedEquipment),
        quantity: Number(quantity),
        pickupTime,
      };

      if (currentUser?.role !== 'student') {
        requestBody.studentId = studentId;
      }

      const response = await equipmentAPI.request(requestBody);
      setMessage(response.data.message || 'Request submitted successfully and is pending approval.');
      setSelectedEquipment('');
      setQuantity(1);
      setPickupTime('');
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.');
    }
  };

  return (
    <div className="page-shell">
      <h2>Request Equipment</h2>
      <form className="form-card" onSubmit={handleSubmit}>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        {currentUser?.role !== 'student' && (
          <label>
            Student ID
            <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e22018" />
          </label>
        )}
        {currentUser?.role === 'student' && (
          <p className="note">You are requesting equipment as <strong>{currentUser.userId}</strong>.</p>
        )}
        <label>
          Equipment
          <select value={selectedEquipment} onChange={(e) => setSelectedEquipment(e.target.value)}>
            <option value="">Select equipment</option>
            {equipmentOptions.length === 0 && <option value="">No equipment available</option>}
            {equipmentOptions.map((item) => (
              <option
                key={item.id}
                value={item.id}
                disabled={item.remaining_quantity <= 0}
              >
                {item.display_name} {item.sportName ? `(${item.sportName})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        <label>
          Pickup time
          <input type="datetime-local" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
        </label>
        <button className="btn-primary" type="submit">Submit request</button>
      </form>
    </div>
  );
};

export default IssueEquipment;
