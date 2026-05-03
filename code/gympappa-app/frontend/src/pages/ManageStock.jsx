import { useEffect, useState } from 'react';
import { equipmentAPI } from '../utils/api.js';
import '../styles/page.css';

const ManageStock = () => {
  const [equipment, setEquipment] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadEquipment = async () => {
    setError('');
    try {
      const res = await equipmentAPI.getAll();
      const list = Object.values(res.data).flat();
      setEquipment(list.map((item) => ({ ...item, editTotal: item.total_quantity, editRemaining: item.remaining_quantity })));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load equipment');
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handleChange = (id, field, value) => {
    setEquipment((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: Number(value) } : item)));
  };

  const handleSave = async (item) => {
    setSavingId(item.id);
    setMessage('');
    setError('');
    try {
      await equipmentAPI.updateEquipmentQuantity(item.id, {
        total_quantity: item.editTotal,
        remaining_quantity: item.editRemaining,
      });
      setMessage('Stock updated successfully.');
      await loadEquipment();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save changes');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page-shell">
      <h2>Manage Equipment</h2>
      <p>Update total stock and available quantity for each item.</p>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Total</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.id}>
                <td>{item.display_name}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.editTotal}
                    onChange={(e) => handleChange(item.id, 'editTotal', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.editRemaining}
                    onChange={(e) => handleChange(item.id, 'editRemaining', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    className="btn-primary"
                    disabled={savingId === item.id}
                    onClick={() => handleSave(item)}
                  >
                    {savingId === item.id ? 'Saving...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStock;
