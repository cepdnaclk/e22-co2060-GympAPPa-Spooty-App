// ============================================================
// MyIssuedItems.jsx — Issue History Page
// ============================================================

import React, { useState } from 'react'

const API_BASE = 'http://localhost:5000/api/equipment'

function MyIssuedItems() {

    const [regNumber,   setRegNumber]   = useState('')
    const [studentId,   setStudentId]   = useState('')
    const [history,     setHistory]     = useState([])
    const [filter,      setFilter]      = useState('ALL')
    const [searchError, setSearchError] = useState('')
    const [loading,     setLoading]     = useState(false)

    const handleSearch = async () => {
        setStudentId(''); setHistory([]); setSearchError('')
        if (!regNumber.trim()) { setSearchError('Please enter a registration number.'); return }
        setLoading(true)
        try {
            const encoded = encodeURIComponent(regNumber.trim())
            const res     = await fetch(`${API_BASE}/history/${encoded}`)
            const data    = await res.json()
            if (data.success) {
                setStudentId(data.student_id)
                setHistory(data.history)
                if (data.history.length === 0) setSearchError('No equipment history found for this student.')
            } else setSearchError(data.message)
        } catch { setSearchError('Could not connect to server.') }
        finally  { setLoading(false) }
    }

    const filteredHistory = history.filter(item => {
        if (filter === 'ALL')            return true
        if (filter === 'issued')         return item.status === 'issued'
        if (filter === 'pending_return') return item.status === 'pending_return'
        if (filter === 'returned')       return item.status === 'returned'
        return true
    })

    const counts = {
        issued:         history.filter(i => i.status === 'issued').length,
        pending_return: history.filter(i => i.status === 'pending_return').length,
        returned:       history.filter(i => i.status === 'returned').length,
    }

    const formatDateTime = (ts) => {
        if (!ts) return '—'
        return new Date(ts).toLocaleString('en-LK', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const statusBadge = (status) => {
        if (status === 'issued')         return 'badge-info'
        if (status === 'pending_return') return 'badge-danger'
        if (status === 'returned')       return 'badge-success'
        return 'badge-info'
    }

    const statusLabel = (status) => {
        if (status === 'issued')         return 'Pending Pickup'
        if (status === 'pending_return') return 'With Student'
        if (status === 'returned')       return 'Returned'
        return status
    }

    return (
        <div style={{ width: '100%' }}>

            {/* ── Search Section ── */}
            <div className="issue-top-section">
                <div className="issue-heading">
                    <h2 className="page-title">Issue History</h2>
                    <p className="page-subtitle">
                        View the full equipment borrowing history for any student.
                    </p>
                </div>

                <div className="issue-search-wrap">
                    <input
                        type="text"
                        className="issue-search-input"
                        placeholder="Enter Registration Number  —  e.g.  E/22/402   |   Mgt/22/101   |   S/22/301   |   A/22/205"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn-primary issue-search-btn" onClick={handleSearch} disabled={loading}>
                        {loading ? 'Loading...' : 'Search Student'}
                    </button>
                </div>

                {searchError && <div className="error-message" style={{ marginTop: '12px' }}>{searchError}</div>}

                {/* Student summary */}
                {studentId && (
                    <div className="student-found-bar">
                        <div className="student-avatar" style={{ width: '52px', height: '52px', fontSize: '22px' }}>
                            {studentId.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p className="student-name">{studentId}</p>
                            <p className="student-meta">{history.length} total record{history.length !== 1 ? 's' : ''}</p>
                        </div>
                        {/* Summary badges */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {counts.pending_return > 0 && (
                                <span className="eq-badge badge-danger">{counts.pending_return} With Student</span>
                            )}
                            {counts.returned > 0 && (
                                <span className="eq-badge badge-success">{counts.returned} Returned</span>
                            )}
                            {counts.issued > 0 && (
                                <span className="eq-badge badge-info">{counts.issued} Pending Pickup</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── History Table ── */}
            {history.length > 0 && (
                <div className="issue-section">
                    <div className="issue-section-header">
                        <h3 className="issue-section-title">Equipment History — {studentId}</h3>

                        {/* Filter tabs */}
                        <div className="tab-bar" style={{ marginTop: '14px', marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                            {[
                                { key: 'ALL',            label: `All  (${history.length})` },
                                { key: 'issued',         label: `Pending Pickup  (${counts.issued})` },
                                { key: 'pending_return', label: `With Student  (${counts.pending_return})` },
                                { key: 'returned',       label: `Returned  (${counts.returned})` },
                            ].map(tab => (
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

                    {filteredHistory.length === 0 ? (
                        <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '32px' }}>
                            No records for this filter.
                        </p>
                    ) : (
                        <table className="equipment-table stock-full-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '5%',  textAlign: 'center' }}>#</th>
                                    <th style={{ width: '22%' }}>Equipment</th>
                                    <th style={{ width: '15%' }}>Sport</th>
                                    <th style={{ width: '8%',  textAlign: 'center' }}>Qty</th>
                                    <th style={{ width: '18%' }}>Requested At</th>
                                    <th style={{ width: '18%' }}>Pickup Time</th>
                                    <th style={{ width: '14%', textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((item, index) => (
                                    <tr key={item.request_id}>
                                        <td style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>
                                            {index + 1}
                                        </td>
                                        <td><strong>{item.equipment_name}</strong></td>
                                        <td style={{ color: 'var(--color-text-light)', fontSize: '0.88rem' }}>
                                            {item.sport_name}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ fontSize: '0.88rem' }}>{formatDateTime(item.requested_at)}</td>
                                        <td style={{ fontSize: '0.88rem' }}>{formatDateTime(item.pickup_time)}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`eq-badge ${statusBadge(item.status)}`}>
                                                {statusLabel(item.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

        </div>
    )
}

export default MyIssuedItems
