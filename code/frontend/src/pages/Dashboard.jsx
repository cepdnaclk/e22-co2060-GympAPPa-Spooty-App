import React, { useEffect, useState } from 'react';
import { equipmentAPI } from '../utils/api';
import '../styles/template.css';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const statusStyle = (status) => {
  switch (status) {
    case 'pending':        return { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
    case 'issued':         return { backgroundColor: '#cce5ff', color: '#004085', border: '1px solid #b8daff' };
    case 'pending_return': return { backgroundColor: '#ffd6a5', color: '#7d4e00', border: '1px solid #ffb347' };
    case 'returned':       return { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
    case 'cancelled':      return { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
    default:               return { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'pending':        return '⏳ Pending Approval';
    case 'issued':         return '✅ Approved - Collect from staff';
    case 'pending_return': return '📦 Return to staff';
    case 'returned':       return '↩️ Returned';
    case 'cancelled':      return '🚫 Declined';
    default:               return '⏳ Pending';
  }
};

const formatTime = (isoString) => {
  return new Date(isoString).toLocaleString([], {
    year:     'numeric',
    month:    'short',
    day:      'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

const Dashboard = () => {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [toast, setToast]           = useState(null);

  const user      = getStoredUser();
  const role      = user?.role || '';
  const studentId = user?.userId || user?.user_id || '';
  const name      = user?.name || studentId;

  const fetchHistory = async () => {
    if (!studentId) {
      setError('Unable to determine your student ID. Please login again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await equipmentAPI.getHistory(studentId);
      setHistory(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'student') fetchHistory();
    else setLoading(false);
  }, []);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCancel = async (requestId) => {
    setCancelling(requestId);
    try {
      await equipmentAPI.cancelRequest(requestId);
      showToast('🚫 Request cancelled successfully.', 'success');
      fetchHistory();
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Network error. Please try again.'}`, 'error');
    } finally {
      setCancelling(null);
    }
  };

  // ── Admin Dashboard ──
  if (role === 'admin') {
    return (
      <div className="template-container">
        <div className="template-header">
          <h1>👋 Welcome, {name}</h1>
          <p>You are logged in as <strong>Admin</strong>. Use the menu to manage equipment and sports.</p>
        </div>
        <div className="template-content">
          <div className="template-section">
            <h3>Quick Actions</h3>
            <ul style={{ marginTop: '12px', lineHeight: '2', fontSize: '15px' }}>
              <li>➕ <strong>Add Equipment</strong> — Add new sports or equipment to the system</li>
              <li>⚙️ <strong>Manage Equipment</strong> — Update stock, remove equipment</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Counter Staff Dashboard ──
  if (role === 'counter-staff') {
    return (
      <div className="template-container">
        <div className="template-header">
          <h1>👋 Welcome, {name}</h1>
          <p>You are logged in as <strong>Counter Staff</strong>. Use the menu to issue and return equipment.</p>
        </div>
        <div className="template-content">
          <div className="template-section">
            <h3>Quick Actions</h3>
            <ul style={{ marginTop: '12px', lineHeight: '2', fontSize: '15px' }}>
              <li>📦 <strong>Issue Equipment</strong> — Search a student and accept their requests</li>
              <li>↩️ <strong>Return Equipment</strong> — Confirm equipment returned by students</li>
              <li>📋 <strong>My Issued Items</strong> — View all currently issued equipment</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Student Dashboard ──
  return (
    <div className="template-container">

      {toast && (
        <div style={{
          position:        'fixed',
          bottom:          '30px',
          left:            '50%',
          transform:       'translateX(-50%)',
          backgroundColor: toast.type === 'error' ? '#7b2020' : '#14532d',
          color:           'white',
          padding:         '14px 28px',
          borderRadius:    '8px',
          boxShadow:       '0 4px 12px rgba(0,0,0,0.3)',
          zIndex:          9999,
          fontSize:        '15px',
          fontWeight:      '600',
          maxWidth:        '90vw',
          textAlign:       'center',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="template-header">
        <h1>👋 Welcome, {name}</h1>
        <p>Track your equipment requests and their current status below.</p>
      </div>

      <div className="template-content">
        <div className="template-section">
          <h2 style={{ marginBottom: '20px' }}>📋 My Equipment Request History</h2>

          {loading && <p style={{ color: 'var(--color-text-light)' }}>⏳ Loading your history...</p>}
          {error   && <p style={{ color: 'var(--color-error, red)' }}>❌ {error}</p>}

          {!loading && !error && history.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '40px 20px', color: '#888',
              background: '#f8f9fa', borderRadius: '10px', border: '1px dashed #ccc',
            }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No requests yet.</p>
              <p style={{ fontSize: '14px' }}>Go to <strong>Equipment Availability</strong> to request equipment.</p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr style={{ backgroundColor: '#44A194', color: 'white' }}>
                    <th>Sport</th>
                    <th>Equipment</th>
                    <th>Qty</th>
                    <th>Pickup Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr key={item.id}>
                      <td>{item.sport_name}</td>
                      <td><strong>{item.display_name}</strong></td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td>{formatTime(item.pickup_time)}</td>
                      <td>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px',
                          fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
                          ...statusStyle(item.status),
                        }}>
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td>
                        {item.status === 'pending' ? (
                          <button
                            className="btn-small danger"
                            onClick={() => handleCancel(item.id)}
                            disabled={cancelling === item.id}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {cancelling === item.id ? '...' : '🚫 Cancel'}
                          </button>
                        ) : item.status === 'issued' ? (
                          <span style={{ color: '#004085', fontSize: '13px', fontWeight: '600' }}>
                            📦 Collect from staff
                          </span>
                        ) : item.status === 'pending_return' ? (
                          <span style={{ color: '#7d4e00', fontSize: '13px', fontWeight: '600' }}>
                            🔄 Return to staff
                          </span>
                        ) : (
                          <span style={{ color: '#aaa', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;