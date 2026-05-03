// ============================================================
// ReturnEquipment.jsx — Return Equipment Page (Staff View)
// ============================================================

import React, { useState } from 'react'

const API_BASE = 'http://localhost:5000/api/equipment'

function ReturnEquipment() {

    const [regNumber,   setRegNumber]   = useState('')
    const [studentId,   setStudentId]   = useState('')
    const [items,       setItems]       = useState([])
    const [searchError, setSearchError] = useState('')
    const [loading,     setLoading]     = useState(false)
    const [successMsg,  setSuccessMsg]  = useState('')
    const [returnError, setReturnError] = useState('')

    const handleSearch = async () => {
        setStudentId(''); setItems([]); setSearchError(''); setSuccessMsg(''); setReturnError('')
        if (!regNumber.trim()) { setSearchError('Please enter a registration number.'); return }
        setLoading(true)
        try {
            const encoded = encodeURIComponent(regNumber.trim())
            const res     = await fetch(`${API_BASE}/pending-return/${encoded}`)
            const data    = await res.json()
            if (data.success) { setStudentId(data.student_id); setItems(data.items) }
            else setSearchError(data.message)
        } catch { setSearchError('Could not connect to server.') }
        finally  { setLoading(false) }
    }

    const handleReturn = async (requestId, equipmentName) => {
        setSuccessMsg(''); setReturnError('')
        if (!window.confirm(`Confirm return of: ${equipmentName}?`)) return
        setLoading(true)
        try {
            const res  = await fetch(`${API_BASE}/return/${requestId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
            const data = await res.json()
            if (data.success) { setSuccessMsg(data.message); setItems(prev => prev.filter(i => i.request_id !== requestId)) }
            else setReturnError(data.message)
        } catch { setReturnError('Could not connect to server.') }
        finally  { setLoading(false) }
    }

    const formatDateTime = (ts) => {
        if (!ts) return '—'
        return new Date(ts).toLocaleString('en-LK', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div style={{ width: '100%' }}>

            {/* ── Search Section ── */}
            <div className="issue-top-section">
                <div className="issue-heading">
                    <h2 className="page-title">Return Equipment</h2>
                    <p className="page-subtitle">
                        Enter the student's registration number to process their equipment return.
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
                        {loading ? 'Searching...' : 'Search Student'}
                    </button>
                </div>

                {searchError && <div className="error-message"  style={{ marginTop: '12px' }}>{searchError}</div>}
                {successMsg  && <div className="success-message" style={{ marginTop: '12px' }}>{successMsg}</div>}
                {returnError && <div className="error-message"  style={{ marginTop: '12px' }}>{returnError}</div>}

                {/* Student found */}
                {studentId && (
                    <div className="student-found-bar">
                        <div className="student-avatar" style={{ width: '52px', height: '52px', fontSize: '22px' }}>
                            {studentId.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p className="student-name">{studentId}</p>
                            <p className="student-meta">
                                {items.length > 0
                                    ? `${items.length} item${items.length !== 1 ? 's' : ''} to return`
                                    : 'No items pending return'}
                            </p>
                        </div>
                        <span className="eq-badge badge-danger">{items.length} Pending Return</span>
                    </div>
                )}
            </div>

            {/* ── Items to Return — grid of cards ── */}
            {items.length > 0 && (
                <div className="issue-section">
                    <div className="issue-section-header">
                        <h3 className="issue-section-title">Items to Return — {studentId}</h3>
                        <p className="issue-section-sub">
                            Click Return to confirm the student has handed back the equipment.
                        </p>
                    </div>

                    <div className="requests-grid">
                        {items.map((item) => (
                            <div key={item.request_id} className="request-grid-card">

                                {/* Header */}
                                <div className="rgc-header">
                                    <p className="rgc-name">{item.equipment_name}</p>
                                    <span className="rgc-sport">{item.sport_name}</span>
                                </div>

                                {/* Quantity */}
                                <div className="rgc-qty-row">
                                    <div className="rgc-qty-box">
                                        <span className="rgc-qty-num" style={{ color: 'var(--color-pink)' }}>
                                            {item.quantity}
                                        </span>
                                        <span className="rgc-qty-lbl">Qty to Return</span>
                                    </div>
                                    <div className="rgc-qty-arrow">↩</div>
                                    <div className="rgc-qty-box">
                                        <span className="rgc-qty-num" style={{ color: 'var(--color-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {formatDateTime(item.requested_at)}
                                        </span>
                                        <span className="rgc-qty-lbl">Issued At</span>
                                    </div>
                                </div>

                                {/* Return button */}
                                <div className="rgc-actions">
                                    <button
                                        className="btn-primary"
                                        style={{ flex: 1 }}
                                        onClick={() => handleReturn(item.request_id, item.equipment_name)}
                                        disabled={loading}
                                    >
                                        ✓ Confirm Return
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}

export default ReturnEquipment
