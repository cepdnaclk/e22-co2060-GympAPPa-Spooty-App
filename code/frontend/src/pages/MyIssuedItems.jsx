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

const getThreeMonthsAgo = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date;
};

function MyIssuedItems() {
  const [regSearch, setRegSearch] = useState('');
  const [sportSearch, setSportSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setSearchError('');
    try {
      const response = await adminAPI.getAllRequests();
      const cutoff = getThreeMonthsAgo();
      const filtered = (response.data?.requests || []).filter((item) => {
        const isReturned = item.status === 'returned';
        const requestedAt = item.requested_at ? new Date(item.requested_at) : null;
        return isReturned && requestedAt && requestedAt >= cutoff;
      });
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
    const normalizedReg = normalizeStudentId(regSearch);
    const normalizedSport = sportSearch.trim().toLowerCase();
    const normalizedEquipment = equipmentSearch.trim().toLowerCase();

    return history.filter((item) => {
      if (normalizedReg && !normalizeStudentId(item.student_id).includes(normalizedReg)) return false;
      if (normalizedSport && !String(item.sport_name || '').toLowerCase().includes(normalizedSport)) return false;
      if (normalizedEquipment && !String(item.equipment_name || '').toLowerCase().includes(normalizedEquipment)) return false;
      return true;
    });
  }, [equipmentSearch, history, regSearch, sportSearch]);

  const counts = useMemo(() => ({
    returned: history.length,
  }), [history]);

  return (
    <div style={{ width: '100%' }}>
      <div className="issue-top-section">
        <div className="issue-heading">
          <h2 className="page-title">Issued Items History</h2>
          <p className="page-subtitle">
            View returned records from the last 3 months. Filter by registration number, sport, or equipment.
          </p>
        </div>

        <div className="issue-search-wrap" style={{ flexWrap: 'wrap' }}>
          <input
            type="text"
            className="issue-search-input"
            placeholder="Filter by registration number"
            value={regSearch}
            onChange={(e) => setRegSearch(e.target.value)}
          />
          <input
            type="text"
            className="issue-search-input"
            placeholder="Filter by sport"
            value={sportSearch}
            onChange={(e) => setSportSearch(e.target.value)}
          />
          <input
            type="text"
            className="issue-search-input"
            placeholder="Filter by equipment"
            value={equipmentSearch}
            onChange={(e) => setEquipmentSearch(e.target.value)}
          />
          <button
            className="btn-secondary issue-search-btn"
            onClick={() => {
              setRegSearch('');
              setSportSearch('');
              setEquipmentSearch('');
            }}
            disabled={!regSearch && !sportSearch && !equipmentSearch}
          >
            Clear
          </button>
        </div>

        {searchError && <div className="error-message" style={{ marginTop: '12px' }}>{searchError}</div>}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {counts.returned > 0 && <span className="eq-badge badge-success">{counts.returned} Returned in last 3 months</span>}
        </div>
      </div>

      <div className="issue-section">
        <div className="issue-section-header">
          <h3 className="issue-section-title">Returned Records Log</h3>
          <p className="issue-section-sub">
            Showing {filteredHistory.length} of {history.length} returned record{history.length !== 1 ? 's' : ''} from the last 3 months.
          </p>
        </div>

        {loading ? (
          <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '32px' }}>Loading history...</p>
        ) : filteredHistory.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '32px' }}>No matching returned records found.</p>
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