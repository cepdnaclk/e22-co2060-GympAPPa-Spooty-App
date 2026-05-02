import React, { useState, useEffect } from 'react';
import { adminAPI, equipmentAPI } from '../utils/api';
import '../styles/template.css';
import '../styles/equipment.css';

function IssueEquipment() {
    const [regNumber,     setRegNumber]     = useState('');
    const [requests,      setRequests]      = useState([]);
    const [studentId,     setStudentId]     = useState('');
    const [searchError,   setSearchError]   = useState('');
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading,       setLoading]       = useState(false);
    const [actionMsg,     setActionMsg]     = useState('');
    const [actionError,   setActionError]   = useState('');

    useEffect(() => { fetchEquipmentList() }, []);

    const fetchEquipmentList = async () => {
        try {
            const response = await adminAPI.getAllEquipment();
            setEquipmentList(response.data.equipment);
        } catch (err) { console.error('Failed to load equipment list:', err); }
    };

    const handleSearch = async () => {
        setRequests([]); setStudentId(''); setSearchError(''); setActionMsg(''); setActionError('');
        if (!regNumber.trim()) { setSearchError('Please enter a registration number.'); return }
        setLoading(true);
        try {
            const response = await adminAPI.getRequests(regNumber.trim());
            setStudentId(response.data.student_id);
            setRequests(response.data.requests);
        } catch (err) {
            setSearchError(err.response?.data?.message || 'Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId, equipmentName, quantity, available) => {
        setActionMsg(''); setActionError('');
        if (available < quantity) {
            setActionError(`Cannot accept: Only ${available} ${equipmentName}(s) available, student requested ${quantity}.`);
            return;
        }
        if (!window.confirm(`Issue ${quantity}x ${equipmentName} to ${studentId}?`)) return;
        setLoading(true);
        try {
            const response = await adminAPI.acceptRequest(requestId);
            setActionMsg(response.data.message);
            setRequests(prev => prev.filter(r => r.request_id !== requestId));
            fetchEquipmentList();
        } catch (err) {
            setActionError(err.response?.data?.message || 'Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async (requestId, equipmentName) => {
        setActionMsg(''); setActionError('');
        if (!window.confirm(`Decline request for ${equipmentName} from ${studentId}?`)) return;
        setLoading(true);
        try {
            const response = await adminAPI.declineRequest(requestId);
            setActionMsg(response.data.message);
            setRequests(prev => prev.filter(r => r.request_id !== requestId));
        } catch (err) {
            setActionError(err.response?.data?.message || 'Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (ts) => {
        if (!ts) return '—';
        return new Date(ts).toLocaleString('en-LK', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const grandTotal     = equipmentList.reduce((s, i) => s + Number(i.total_quantity),     0);
    const grandAvailable = equipmentList.reduce((s, i) => s + Number(i.remaining_quantity), 0);
    const grandIssued    = equipmentList.reduce((s, i) => s + Number(i.issued_count),        0);

    const getSportName = (item) => item.sport_name || '—';

    return (
        <div style={{ width: '100%' }}>

            {/* ══════════════════════════════════════════
                TOP SECTION — full width search area
            ══════════════════════════════════════════ */}
            <div className="issue-top-section">

                {/* Page heading */}
                <div className="issue-heading">
                    <h2 className="page-title">Issue Equipment</h2>
                    <p className="page-subtitle">
                        Search for a student by registration number to view and process their equipment requests.
                    </p>
                </div>

                {/* Search bar — wide and centered */}
                <div className="issue-search-wrap">
                    <input
                        type="text"
                        className="issue-search-input"
                        placeholder="Enter Registration Number  —  e.g.  E/22/402   |   Mgt/22/101   |   S/22/301   |   A/22/205"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="btn-primary issue-search-btn"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search Student'}
                    </button>
                </div>

                {/* Errors */}
                {searchError && (
                    <div className="error-message" style={{ marginTop: '12px' }}>{searchError}</div>
                )}
                {actionMsg && (
                    <div className="success-message" style={{ marginTop: '12px' }}>{actionMsg}</div>
                )}
                {actionError && (
                    <div className="error-message" style={{ marginTop: '12px' }}>{actionError}</div>
                )}

                {/* Student found card */}
                {studentId && (
                    <div className="student-found-bar">
                        <div className="student-avatar" style={{ width: '52px', height: '52px', fontSize: '22px' }}>
                            {studentId.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p className="student-name">{studentId}</p>
                            <p className="student-meta">
                                {requests.length > 0
                                    ? `${requests.length} pending request${requests.length !== 1 ? 's' : ''} found`
                                    : 'No pending requests'}
                            </p>
                        </div>
                        <span className="eq-badge badge-info">✓ Registered in GympAPPa</span>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                PENDING REQUESTS — full width cards
            ══════════════════════════════════════════ */}
            {requests.length > 0 && (
                <div className="issue-section">
                    <div className="issue-section-header">
                        <h3 className="issue-section-title">Pending Requests — {studentId}</h3>
                        <p className="issue-section-sub">Review and accept or decline each request below.</p>
                    </div>

                    {/* Requests in a responsive grid */}
                    <div className="requests-grid">
                        {requests.map((req) => {
                            const canIssue = Number(req.remaining_quantity) >= Number(req.quantity);
                            return (
                                <div key={req.request_id} className={`request-grid-card ${!canIssue ? 'request-no-stock' : ''}`}>

                                    {/* Equipment name + sport */}
                                    <div className="rgc-header">
                                        <p className="rgc-name">{req.equipment_name}</p>
                                        <span className="rgc-sport">{req.sport_name}</span>
                                    </div>

                                    {/* Qty row */}
                                    <div className="rgc-qty-row">
                                        <div className="rgc-qty-box">
                                            <span className="rgc-qty-num">{req.quantity}</span>
                                            <span className="rgc-qty-lbl">Requested</span>
                                        </div>
                                        <div className="rgc-qty-arrow">→</div>
                                        <div className="rgc-qty-box">
                                            <span className="rgc-qty-num" style={{ color: canIssue ? 'var(--color-green)' : 'var(--color-pink)' }}>
                                                {req.remaining_quantity}
                                            </span>
                                            <span className="rgc-qty-lbl">In Stock</span>
                                        </div>
                                    </div>

                                    {/* Requested time */}
                                    <p className="rgc-time">Requested: {formatDateTime(req.requested_at)}</p>

                                    {/* Warning if not enough stock */}
                                    {!canIssue && (
                                        <p className="rgc-warn">⚠ Not enough stock to issue</p>
                                    )}

                                    {/* Action buttons */}
                                    <div className="rgc-actions">
                                        <button
                                            className="btn-primary"
                                            style={{ flex: 1, opacity: canIssue ? 1 : 0.4 }}
                                            onClick={() => handleAccept(req.request_id, req.equipment_name, req.quantity, req.remaining_quantity)}
                                            disabled={loading || !canIssue}
                                        >
                                            ✓ Accept
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                            onClick={() => handleDecline(req.request_id, req.equipment_name)}
                                            disabled={loading}
                                        >
                                            ✗ Decline
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                STOCK OVERVIEW — full width table
            ══════════════════════════════════════════ */}
            <div className="issue-section">
                <div className="issue-section-header">
                    <h3 className="issue-section-title">Equipment Stock Overview</h3>
                    <p className="issue-section-sub">Current availability of all sports equipment.</p>
                </div>

                {/* Summary numbers */}
                <div className="stock-summary-bar">
                    <div className="stock-summary-item">
                        <span className="stock-summary-number">{grandTotal}</span>
                        <span className="stock-summary-label">Total Items</span>
                    </div>
                    <div className="stock-summary-divider" />
                    <div className="stock-summary-item">
                        <span className="stock-summary-number" style={{ color: 'var(--color-green)' }}>
                            {grandAvailable}
                        </span>
                        <span className="stock-summary-label">Available Now</span>
                    </div>
                    <div className="stock-summary-divider" />
                    <div className="stock-summary-item">
                        <span className="stock-summary-number" style={{ color: 'var(--color-pink)' }}>
                            {grandIssued}
                        </span>
                        <span className="stock-summary-label">Currently Issued</span>
                    </div>
                </div>

                {/* Table */}
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
                                <td>{getSportName(item)}</td>
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
            </div>
        </div>
    );
}

export default IssueEquipment;