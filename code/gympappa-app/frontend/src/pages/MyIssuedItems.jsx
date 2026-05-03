import { useEffect, useState } from 'react';
import { equipmentAPI } from '../utils/api.js';
import '../styles/page.css';

const MyIssuedItems = () => {
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const [studentId, setStudentId] = useState(currentUser?.role === 'student' ? currentUser.userId : '');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'student') {
      loadHistory(currentUser.userId);
    }
  }, [currentUser]);

  const loadHistory = async (studentIdToLoad) => {
    setLoading(true);
    setError('');
    try {
      const res = await equipmentAPI.getHistory(studentIdToLoad);
      setHistory(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setError('Student ID is required');
      return;
    }
    await loadHistory(studentId);
  };

  return (
    <div className="page-shell">
      <h2>Issued Item History</h2>
      {currentUser?.role !== 'student' ? (
        <form className="form-card" onSubmit={handleSearch}>
          <label>
            Student ID
            <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e22018" />
          </label>
          <button className="btn-primary" type="submit">Load History</button>
        </form>
      ) : (
        <p className="note">Showing your item history for <strong>{currentUser.userId}</strong>.</p>
      )}
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && history.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Sport</th>
                <th>Equipment</th>
                <th>Qty</th>
                <th>Pickup</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td>{row.sport_name}</td>
                  <td>{row.display_name}</td>
                  <td>{row.quantity}</td>
                  <td>{new Date(row.pickup_time).toLocaleString()}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && history.length === 0 && !error && <p>No issued equipment records found.</p>}
    </div>
  );
};

export default MyIssuedItems;
