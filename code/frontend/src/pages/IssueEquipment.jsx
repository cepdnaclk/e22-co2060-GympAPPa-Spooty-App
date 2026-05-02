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

                            <div className="issue-heading">
                                <h2 className="page-title">Equipment Stock Overview</h2>
                                <p className="page-subtitle">Current availability of all sports equipment.</p>
                            </div>
            </div>

            {/* STOCK grouped by sport — show equipment name + available count */}
            <div className="issue-section">
                <div className="issue-section-header">
                    <h3 className="issue-section-title">All Equipment — Grouped by Sport</h3>
                    <p className="issue-section-sub">List of equipment and current available counts per sport.</p>
                </div>

                {equipmentList.length === 0 ? (
                    <p style={{ color: 'var(--color-text-light)' }}>No stock data available.</p>
                ) : (
                    (() => {
                        const grouped = equipmentList.reduce((acc, item) => {
                            const sport = item.sport_name || '—';
                            acc[sport] = acc[sport] || [];
                            acc[sport].push(item);
                            return acc;
                        }, {});

                        return (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {Object.keys(grouped).map(sport => (
                                    <div key={sport} style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong>{sport}</strong>
                                            <span style={{ color: 'var(--color-text-light)' }}>{grouped[sport].length} item{grouped[sport].length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                                            {grouped[sport].map(eq => (
                                                <div key={eq.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '6px', background: 'var(--color-bg)' }}>
                                                    <div style={{ fontWeight: 600 }}>{eq.equipment_name}</div>
                                                    <div style={{ color: eq.remaining_quantity > 0 ? 'var(--color-green)' : 'var(--color-pink)' }}>{eq.remaining_quantity}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()
                )}
            </div>

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