import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../utils/api';
import '../styles/template.css';
import '../styles/equipment.css';

const normalizeRegNumber = (value = '') => value.replace(/[\s/]/g, '').toLowerCase();

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

const statusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending Approval';
    case 'issued':
      return 'Issued';
    case 'pending_return':
      return 'Return Pending';
    case 'returned':
      return 'Returned';
    case 'cancelled':
      return 'Declined';
    default:
      return status || 'Unknown';
  }
};

const statusBadge = (status) => {
  if (status === 'pending') return 'badge-info';
  if (status === 'issued') return 'badge-success';
  if (status === 'pending_return') return 'badge-danger';
  if (status === 'returned') return 'badge-success';
  if (status === 'cancelled') return 'badge-danger';
  return 'badge-info';
};

const sortRecords = (items) => {
  return [...items].sort((left, right) => {
    const regCompare = normalizeRegNumber(left.student_id).localeCompare(normalizeRegNumber(right.student_id));
    if (regCompare !== 0) return regCompare;
    return new Date(right.requested_at) - new Date(left.requested_at);
  });
};

const getEffectiveQuantity = (item) => Number(item.issued_quantity ?? item.quantity ?? 0);
const getOutstandingQuantity = (item) => Math.max(getEffectiveQuantity(item) - Number(item.returned_quantity ?? 0), 0);

const StaffEquipment = () => {
  const [searchText, setSearchText] = useState('');
  const [view, setView] = useState('all');
  const [records, setRecords] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionQuantities, setActionQuantities] = useState({});

  const fetchEquipment = async () => {
    try {
      const response = await adminAPI.getAllEquipment();
      setEquipmentList(response.data?.equipment || []);
    } catch {
      setEquipmentList([]);
    } finally {
      setStockLoading(false);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    setSearchError('');
    try {
      const response = await adminAPI.getAllRequests();
      setRecords(sortRecords(response.data?.requests || []));
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Could not load equipment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchRecords();
  }, []);

  const refreshAll = async () => {
    await Promise.all([fetchEquipment(), fetchRecords()]);
  };

  const equipmentById = useMemo(() => {
    return new Map(equipmentList.map((item) => [Number(item.id), item]));
  }, [equipmentList]);

  const visibleRecords = useMemo(() => {
    const normalizedSearch = normalizeRegNumber(searchText);

    return records.filter((item) => {
      if (view === 'active' && !['pending', 'issued', 'pending_return'].includes(item.status)) return false;
      if (view === 'completed' && !['returned', 'cancelled'].includes(item.status)) return false;
      if (normalizedSearch && !normalizeRegNumber(item.student_id).includes(normalizedSearch)) return false;
      return true;
    });
  }, [records, searchText, view]);

  const counts = useMemo(() => ({
    pending: records.filter((item) => item.status === 'pending').length,
    issued: records.filter((item) => item.status === 'issued').length,
    returning: records.filter((item) => item.status === 'pending_return').length,
    returned: records.filter((item) => item.status === 'returned').length,
    declined: records.filter((item) => item.status === 'cancelled').length,
  }), [records]);

  const totalItems = equipmentList.reduce((sum, item) => sum + Number(item.total_quantity || 0), 0);
  const availableItems = equipmentList.reduce((sum, item) => sum + Number(item.remaining_quantity || 0), 0);
  const issuedItems = equipmentList.reduce((sum, item) => sum + Number(item.issued_count || 0), 0);

  const getAvailableForRecord = (item) => {
    const snapshot = equipmentById.get(Number(item.sport_equipment_id));
    return Number(snapshot?.remaining_quantity ?? item.remaining_quantity ?? 0);
  };

  const getIssueInputValue = (item) => {
    const available = getAvailableForRecord(item);
    const defaultQuantity = Math.max(Math.min(Number(item.quantity || 1), available), 1);
    return Number(actionQuantities[item.request_id] ?? defaultQuantity);
  };

  const getReturnInputValue = (item) => {
    const defaultQuantity = Math.max(getOutstandingQuantity(item), 1);
    return Number(actionQuantities[item.request_id] ?? defaultQuantity);
  };

  const setActionQuantity = (requestId, nextValue) => {
    setActionQuantities((prev) => ({
      ...prev,
      [requestId]: nextValue,
    }));
  };

  const handleIssue = async (item) => {
    setActionMsg('');
    setActionError('');

    const available = getAvailableForRecord(item);
    const issueQuantity = getIssueInputValue(item);

    if (issueQuantity <= 0) {
      setActionError('Issue quantity must be greater than zero.');
      return;
    }

    if (issueQuantity > available) {
      setActionError(`Only ${available} ${item.equipment_name}(s) are available right now.`);
      return;
    }

    if (issueQuantity > Number(item.quantity || 0)) {
      setActionError(`You cannot issue more than the requested quantity (${item.quantity}).`);
      return;
    }

    if (!window.confirm(`Issue ${issueQuantity}x ${item.equipment_name} to ${item.student_id}?`)) return;

    setLoading(true);
    try {
      const response = await adminAPI.acceptRequest(item.request_id, { quantity: issueQuantity });
      setActionMsg(response.data?.message || 'Equipment issued successfully.');
      await refreshAll();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (item) => {
    setActionMsg('');
    setActionError('');

    if (!window.confirm(`Decline request for ${item.equipment_name} from ${item.student_id}?`)) return;

    setLoading(true);
    try {
      const response = await adminAPI.declineRequest(item.request_id);
      setActionMsg(response.data?.message || 'Request declined successfully.');
      await fetchRecords();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (item) => {
    setActionMsg('');
    setActionError('');

    const returnQuantity = getReturnInputValue(item);
    const outstanding = getOutstandingQuantity(item);

    if (returnQuantity <= 0) {
      setActionError('Return quantity must be greater than zero.');
      return;
    }

    if (returnQuantity > outstanding) {
      setActionError(`Only ${outstanding} ${item.equipment_name}(s) are still pending return.`);
      return;
    }

    if (!window.confirm(`Confirm return of ${returnQuantity}x ${item.equipment_name} from ${item.student_id}?`)) return;

    setLoading(true);
    try {
      const response = await adminAPI.returnEquipment(item.request_id, { quantity: returnQuantity });
      setActionMsg(response.data?.message || 'Return processed successfully.');
      await refreshAll();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="issue-top-section">
        <div className="issue-heading">
          <h2 className="page-title">Equipment Requests & Returns</h2>
          <p className="page-subtitle">
            Search by registration number fragment, then issue, decline, or return records with a quantity.
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
        {actionMsg && <div className="success-message" style={{ marginTop: '12px' }}>{actionMsg}</div>}
        {actionError && <div className="error-message" style={{ marginTop: '12px' }}>{actionError}</div>}
      </div>

      <div className="issue-section">
        <div className="issue-section-header">
          <h3 className="issue-section-title">All Request Records</h3>
          <p className="issue-section-sub">
            Showing {visibleRecords.length} of {records.length} record{records.length !== 1 ? 's' : ''}.
          </p>
          <div className="tab-bar" style={{ marginTop: '14px', marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            {[
              { key: 'all', label: `All (${records.length})` },
              { key: 'active', label: `Active (${counts.pending + counts.issued + counts.returning})` },
              { key: 'completed', label: `Completed (${counts.returned + counts.declined})` },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${view === tab.key ? 'tab-active' : ''}`}
                onClick={() => setView(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {visibleRecords.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '32px' }}>
            No matching records found.
          </p>
        ) : (
          <table className="equipment-table stock-full-table">
            <thead>
              <tr>
                <th style={{ width: '4%', textAlign: 'center' }}>#</th>
                <th style={{ width: '15%' }}>Student ID</th>
                <th style={{ width: '18%' }}>Equipment</th>
                <th style={{ width: '12%' }}>Sport</th>
                <th style={{ width: '7%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '12%' }}>Requested At</th>
                <th style={{ width: '12%' }}>Pickup Time</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Issue / Return</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Decline</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map((item, index) => {
                const available = getAvailableForRecord(item);
                const issueValue = getIssueInputValue(item);
                const returnValue = getReturnInputValue(item);
                const canIssue = item.status === 'pending' && available > 0;
                const canReturn = ['issued', 'pending_return'].includes(item.status) && getOutstandingQuantity(item) > 0;

                return (
                  <tr key={item.request_id}>
                    <td style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>{index + 1}</td>
                    <td><strong>{item.student_id}</strong></td>
                    <td>{item.equipment_name}</td>
                    <td style={{ color: 'var(--color-text-light)', fontSize: '0.88rem' }}>{item.sport_name}</td>
                    <td style={{ textAlign: 'center' }}>{item.status === 'pending' ? item.quantity : getEffectiveQuantity(item)}</td>
                    <td style={{ fontSize: '0.88rem' }}>{formatDateTime(item.requested_at)}</td>
                    <td style={{ fontSize: '0.88rem' }}>{formatDateTime(item.pickup_time)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`eq-badge ${statusBadge(item.status)}`}>{statusLabel(item.status)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max={Math.max(available, 1)}
                            value={issueValue}
                            onChange={(e) => setActionQuantity(item.request_id, e.target.value)}
                            style={{ width: '72px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                          />
                          <button className="btn-primary" onClick={() => handleIssue(item)} disabled={loading || !canIssue}>
                            Issue
                          </button>
                        </div>
                      ) : canReturn ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max={Math.max(getOutstandingQuantity(item), 1)}
                            value={returnValue}
                            onChange={(e) => setActionQuantity(item.request_id, e.target.value)}
                            style={{ width: '72px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                          />
                          <button className="btn-primary" onClick={() => handleReturn(item)} disabled={loading}>
                            Return
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.status === 'pending' ? (
                        <button className="btn-secondary" onClick={() => handleDecline(item)} disabled={loading}>
                          Decline
                        </button>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="issue-section">
        <div className="issue-section-header">
          <h3 className="issue-section-title">Equipment Stock Overview</h3>
          <p className="issue-section-sub">Real-time availability across all sports.</p>
        </div>

        <div className="stock-summary-bar">
          <div className="stock-summary-item">
            <span className="stock-summary-number">{totalItems}</span>
            <span className="stock-summary-label">Total Items</span>
          </div>
          <div className="stock-summary-divider" />
          <div className="stock-summary-item">
            <span className="stock-summary-number" style={{ color: 'var(--color-green)' }}>{availableItems}</span>
            <span className="stock-summary-label">Available Now</span>
          </div>
          <div className="stock-summary-divider" />
          <div className="stock-summary-item">
            <span className="stock-summary-number" style={{ color: 'var(--color-pink)' }}>{issuedItems}</span>
            <span className="stock-summary-label">Currently Issued</span>
          </div>
        </div>

        {stockLoading ? (
          <p>Loading stock overview...</p>
        ) : equipmentList.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)' }}>No stock data available.</p>
        ) : (
          <table className="equipment-table stock-full-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '25%' }}>Equipment</th>
                <th style={{ width: '20%' }}>Sport</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Total</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Available</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Issued</th>
                <th style={{ width: '14%', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td><strong>{item.equipment_name}</strong></td>
                  <td>{item.sport_name}</td>
                  <td style={{ textAlign: 'center' }}>{item.total_quantity}</td>
                  <td style={{ textAlign: 'center' }}>{item.remaining_quantity}</td>
                  <td style={{ textAlign: 'center' }}>{item.issued_count}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`eq-badge ${item.remaining_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {item.remaining_quantity > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaffEquipment;