import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../utils/api';
import '../styles/template.css';
import '../styles/equipment.css';

const normalizeStudentId = (value = '') => value.replace(/[\s/]/g, '').toLowerCase();

const sortRecords = (items) => {
  return [...items].sort((left, right) => {
    const regCompare = normalizeStudentId(left.student_id).localeCompare(normalizeStudentId(right.student_id));
    if (regCompare !== 0) return regCompare;
    return new Date(right.requested_at) - new Date(left.requested_at);
  });
};

const formatDateTime = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusBadge = (status) => {
  if (status === 'issued') return 'badge-info';
  if (status === 'pending_return') return 'badge-danger';
  if (status === 'returned') return 'badge-success';
  return 'badge-info';
};

const statusLabel = (status) => {
  if (status === 'issued') return 'Issued';
  if (status === 'pending_return') return 'Return Pending';
  if (status === 'returned') return 'Returned';
  return status || 'Unknown';
};

const getEffectiveQuantity = (item) => Number(item.issued_quantity ?? item.quantity ?? 0);

function MyIssuedItems() {
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setSearchError('');
    try {
      const response = await adminAPI.getAllRequests();
      const filtered = (response.data?.requests || []).filter((item) => ['issued', 'pending_return', 'returned'].includes(item.status));
      setHistory(sortRecords(filtered));
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Could not load issued items history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    const normalizedSearch = normalizeStudentId(searchText);

    return history.filter((item) => {
      if (filter === 'issued' && item.status !== 'issued') return false;
      if (filter === 'pending_return' && item.status !== 'pending_return') return false;
      if (filter === 'returned' && item.status !== 'returned') return false;
      if (normalizedSearch && !normalizeStudentId(item.student_id).includes(normalizedSearch)) return false;
      return true;
    });
  }, [filter, history, searchText]);

  const counts = useMemo(() => ({
    issued: history.filter((item) => item.status === 'issued').length,
    pending_return: history.filter((item) => item.status === 'pending_return').length,
    returned: history.filter((item) => item.status === 'returned').length,
  }), [history]);

  return (
    <div style={{ width: '100%' }}>
      <div className="issue-top-section">
        <div className="issue-heading">
          <h2 className="page-title">Issued Items History</h2>
          <p className="page-subtitle">
            View all issued and returned records. Search by any part of a student registration number.
          </p>
        </div>

        <div className="issue-search-wrap">
          <input
            type="text"
            className="issue-search-input"
            placeholder="Filter by registration number or student ID"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="btn-secondary issue-search-btn" onClick={() => setSearchText('')} disabled={!searchText}>
            Clear
          </button>
        </div>

        {searchError && <div className="error-message" style={{ marginTop: '12px' }}>{searchError}</div>}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {counts.issued > 0 && <span className="eq-badge badge-info">{counts.issued} Issued</span>}
          {counts.pending_return > 0 && <span className="eq-badge badge-danger">{counts.pending_return} Return Pending</span>}
          {counts.returned > 0 && <span className="eq-badge badge-success">{counts.returned} Returned</span>}
        </div>
      </div>

      <div className="issue-section">
        <div className="issue-section-header">
          <h3 className="issue-section-title">All Issued / Returned Records</h3>
          <p className="issue-section-sub">
            Showing {filteredHistory.length} of {history.length} record{history.length !== 1 ? 's' : ''}.
          </p>

          <div className="tab-bar" style={{ marginTop: '14px', marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            {[
              { key: 'ALL', label: `All (${history.length})` },
              { key: 'issued', label: `Issued (${counts.issued})` },
              { key: 'pending_return', label: `Return Pending (${counts.pending_return})` },
              { key: 'returned', label: `Returned (${counts.returned})` },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${filter === tab.key ? 'tab-active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '32px' }}>Loading history...</p>
        ) : filteredHistory.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '32px' }}>
            No matching issued or returned records found.
          </p>
        ) : (
          <table className="equipment-table stock-full-table">
            <thead>
              <tr>
                <th style={{ width: '5%', textAlign: 'center' }}>#</th>
                <th style={{ width: '15%' }}>Student ID</th>
                <th style={{ width: '22%' }}>Equipment</th>
                <th style={{ width: '15%' }}>Sport</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '18%' }}>Requested At</th>
                <th style={{ width: '18%' }}>Pickup Time</th>
                <th style={{ width: '14%', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, index) => (
                <tr key={item.request_id}>
                  <td style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>{index + 1}</td>
                  <td><strong>{item.student_id}</strong></td>
                  <td>{item.equipment_name}</td>
                  <td style={{ color: 'var(--color-text-light)', fontSize: '0.88rem' }}>{item.sport_name}</td>
                  <td style={{ textAlign: 'center' }}>{getEffectiveQuantity(item)}</td>
                  <td style={{ fontSize: '0.88rem' }}>{formatDateTime(item.requested_at)}</td>
                  <td style={{ fontSize: '0.88rem' }}>{formatDateTime(item.pickup_time)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`eq-badge ${statusBadge(item.status)}`}>{statusLabel(item.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyIssuedItems;