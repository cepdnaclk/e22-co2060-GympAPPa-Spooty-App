import { useState } from 'react';
import { equipmentAPI } from '../utils/api.js';
import '../styles/page.css';

const ReturnEquipment = () => {
  const [requestId, setRequestId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReturn = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!requestId) {
      setError('Request ID is required.');
      return;
    }

    try {
      const response = await equipmentAPI.initiateReturn(requestId);
      setMessage(response.data.message || 'Return marked successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to mark return.');
    }
  };

  return (
    <div className="page-shell">
      <h2>Return Equipment</h2>
      <form className="form-card" onSubmit={handleReturn}>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <label>
          Request ID
          <input value={requestId} onChange={(e) => setRequestId(e.target.value)} placeholder="123" />
        </label>
        <button className="btn-primary" type="submit">Mark as Returned</button>
      </form>
    </div>
  );
};

export default ReturnEquipment;
