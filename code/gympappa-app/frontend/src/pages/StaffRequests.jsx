import { useEffect, useState } from 'react';
import { equipmentAPI } from '../utils/api.js';
import '../styles/page.css';

const StaffRequests = () => {
  const [activeTab, setActiveTab] = useState('issue');
  const [requests, setRequests] = useState([]);
  const [stock, setStock] = useState([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [studentLabel, setStudentLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await equipmentAPI.getRequests();
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load requests');
    } finally {
      setLoading(false);
    }
  };

  const loadStock = async () => {
    try {
      const res = await equipmentAPI.getAll();
      const items = Object.values(res.data).flat();
      setStock(items);
    } catch (err) {
      console.error('Unable to load stock', err);
    }
  };

  useEffect(() => {
    loadRequests();
    loadStock();
  }, []);

  const searchStudentHistory = async () => {
    setMessage('');
    setError('');
    setSearchResult([]);
    setStudentLabel('');

    if (!searchStudent) {
      setError('Enter a student ID to search.');
      return;
    }

    try {
      const res = await equipmentAPI.getHistory(searchStudent);
      setSearchResult(res.data);
      setStudentLabel(searchStudent);
      if (res.data.length === 0) {
        setMessage('No history found for this student.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setMessage('');
    setError('');
    try {
      await equipmentAPI.acceptRequest(requestId);
      setMessage('Request accepted and equipment issued.');
      await loadRequests();
      await loadStock();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to accept request.');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setMessage('');
    setError('');
    try {
      await equipmentAPI.declineRequest(requestId);
      setMessage('Request declined successfully.');
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to decline request.');
    }
  };

  return (
    <div className="page-shell staff-page-shell">
      <div className="page-tabs">
        <button
          className={activeTab === 'issue' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('issue')}
        >
          Issue Equipment
        </button>
        <button
          className={activeTab === 'return' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('return')}
        >
          Return Equipment
        </button>
        <button
          className={activeTab === 'history' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('history')}
        >
          Issue History
        </button>
      </div>

      <div className="search-card">
        <div className="search-card-row">
          <input
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            placeholder="Search student"
            className="search-input"
          />
          <button className="btn-primary search-button" type="button" onClick={searchStudentHistory}>
            Search Student
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
      </div>

      <div className="stock-overview-card">
        <div className="stock-overview-header">
          <div>
            <h3>Equipment Stock Overview</h3>
            <p>Current availability of all sports equipment.</p>
          </div>
        </div>

        <div className="inventory-grid">
          {stock.map((item) => (
            <div key={item.id} className="inventory-card">
              <div className="inventory-title">{item.display_name}</div>
              <div className="inventory-meta">
                <span>{item.remaining_quantity} available</span>
                <span>Total {item.total_quantity}</span>
              </div>
            </div>
          ))}
          {stock.length === 0 && <p>No equipment loaded.</p>}
        </div>
      </div>

      <div className="tab-panel">
        {activeTab === 'issue' && (
          <div>
            <h3 className="panel-title">Pending Issue Requests</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Equipment</th>
                    <th>Sport</th>
                    <th>Qty</th>
                    <th>Pickup</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="6">No pending requests.</td>
                    </tr>
                  )}
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.student_id}</td>
                      <td>{request.display_name}</td>
                      <td>{request.sport_name}</td>
                      <td>{request.quantity}</td>
                      <td>{new Date(request.pickup_time).toLocaleString()}</td>
                      <td className="action-cell">
                        <button className="btn-primary" onClick={() => handleAcceptRequest(request.id)}>
                          Accept
                        </button>
                        <button className="btn-secondary" onClick={() => handleDeclineRequest(request.id)}>
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'return' && (
          <div>
            <h3 className="panel-title">Return Equipment</h3>
            <p>Use the Return Equipment tab to mark issued items for return when students bring them back.</p>
            <p className="section-note">This view is mainly for counter staff to manage returning equipment. Use the dedicated return page for processing returns.</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="panel-title">Issue History</h3>
            {studentLabel && <p>Showing history for <strong>{studentLabel}</strong>.</p>}
            {!studentLabel && <p>Search for a student to see their issue history.</p>}
            {searchResult.length > 0 && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>Sport</th>
                      <th>Qty</th>
                      <th>Pickup</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResult.map((row) => (
                      <tr key={row.id}>
                        <td>{row.display_name}</td>
                        <td>{row.sport_name}</td>
                        <td>{row.quantity}</td>
                        <td>{new Date(row.pickup_time).toLocaleString()}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffRequests;
