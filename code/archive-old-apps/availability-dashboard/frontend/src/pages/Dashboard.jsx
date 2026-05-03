// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';

const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
const STUDENT_ID = storedUser?.user_id || 'E/22/018';

const statusStyle = (status) => {
  switch (status) {
    case 'approved':  return { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
    case 'rejected':  return { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
    case 'cancelled': return { backgroundColor: '#e2e3e5', color: '#383d41', border: '1px solid #d6d8db' };
    default:          return { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'approved':  return '✅ Approved';
    case 'rejected':  return '❌ Rejected';
    case 'cancelled': return '🚫 Cancelled';
    default:          return '⏳ Pending';
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

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/equipment/history/${encodeURIComponent(STUDENT_ID)}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCancel = async (requestId) => {
    setCancelling(requestId);
    try {
      const res = await fetch(`/api/equipment/request/${requestId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(`❌ ${data.message}`, 'error');
        return;
      }
      showToast('🚫 Request cancelled successfully.', 'success');
      fetchHistory();
    } catch {
      showToast('❌ Network error. Please try again.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="template-container">

      {/* Toast */}
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

      {/* Welcome Section */}
      <div className="template-header">
        <h1>🏟️ Welcome to GympAPPa Spooty</h1>
        <p>Manage and request sports equipment easily. Check availability and track your requests below.</p>
      </div>

      {/* Usage History Section */}
      <div className="template-content">
        <div className="template-section">
          <h2 style={{ marginBottom: '20px' }}>📋 My Equipment Request History</h2>

          {loading && (
            <p style={{ color: 'var(--color-text-light)' }}>⏳ Loading your history...</p>
          )}

          {error && (
            <p style={{ color: 'var(--color-error, red)' }}>❌ {error}</p>
          )}

          {!loading && !error && history.length === 0 && (
            <div style={{
              textAlign:    'center',
              padding:      '40px 20px',
              color:        '#888',
              background:   '#f8f9fa',
              borderRadius: '10px',
              border:       '1px dashed #ccc',
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
                          padding:      '4px 12px',
                          borderRadius: '20px',
                          fontSize:     '13px',
                          fontWeight:   '600',
                          whiteSpace:   'nowrap',
                          ...statusStyle(item.status),
                        }}>
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td>
                        {item.status === 'issued' ? (
                          <button
                            className="btn-small danger"
                            onClick={() => handleCancel(item.id)}
                            disabled={cancelling === item.id}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {cancelling === item.id ? '...' : '🚫 Cancel'}
                          </button>
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
