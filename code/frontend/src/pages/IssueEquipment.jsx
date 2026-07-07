import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../utils/api';
import '../styles/template.css';
import '../styles/equipment.css';

function IssueEquipment() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        equipment: '',
        sport: '',
        total: '',
        available: '',
        status: 'all',
        returnStatus: 'all',
    });

    useEffect(() => { fetchEquipmentList() }, []);

    const fetchEquipmentList = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getAllEquipment();
            setEquipmentList(response.data.equipment || []);
        } catch (err) { console.error('Failed to load equipment list:', err); }
        finally { setLoading(false); }
    };

    const normalize = (value = '') => String(value).toLowerCase().trim();

    const visibleEquipment = useMemo(() => {
        const query = normalize(searchText);

        return [...equipmentList]
            .sort((left, right) => {
                const sportCompare = (left.sport_name || '').localeCompare(right.sport_name || '');
                if (sportCompare !== 0) return sportCompare;
                return (left.equipment_name || '').localeCompare(right.equipment_name || '');
            })
            .filter((item) => {
                const available = Number(item.remaining_quantity || 0);
                const total = Number(item.total_quantity || 0);
                const status = available > 0 ? 'available' : 'out of stock';
                const returnStatus = available >= total ? 'returned' : 'pending';

                if (query) {
                    const haystack = [
                        item.equipment_name,
                        item.sport_name,
                        item.total_quantity,
                        item.remaining_quantity,
                        status,
                        returnStatus,
                    ].join(' ');
                    if (!normalize(haystack).includes(query)) return false;
                }

                if (filters.equipment && !normalize(item.equipment_name).includes(normalize(filters.equipment))) return false;
                if (filters.sport && !normalize(item.sport_name).includes(normalize(filters.sport))) return false;
                if (filters.total && !String(total).includes(normalize(filters.total))) return false;
                if (filters.available && !String(available).includes(normalize(filters.available))) return false;
                if (filters.status !== 'all' && status !== filters.status) return false;
                if (filters.returnStatus !== 'all' && returnStatus !== filters.returnStatus) return false;

                return true;
            });
    }, [equipmentList, filters, searchText]);

    const setFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const getStatus = (item) => (Number(item.remaining_quantity || 0) > 0 ? 'Available' : 'Out of Stock');
    const getStatusKey = (item) => (Number(item.remaining_quantity || 0) > 0 ? 'available' : 'out of stock');
    const getReturnState = (item) => (Number(item.remaining_quantity || 0) >= Number(item.total_quantity || 0) ? 'Returned' : 'Pending');
    const getReturnStateKey = (item) => (Number(item.remaining_quantity || 0) >= Number(item.total_quantity || 0) ? 'returned' : 'pending');

    return (
        <div style={{ width: '100%' }}>
            <div className="issue-section">
                <div className="issue-section-header">
                    <h2 className="page-title">Equipment Stock Overview</h2>
                    <p className="issue-section-sub">All rows and columns are searchable and filterable.</p>
                </div>

                {loading ? (
                    <p style={{ color: 'var(--color-text-light)' }}>Loading stock overview...</p>
                ) : (
                    <table className="equipment-table stock-full-table" style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '4%', border: '1px solid var(--color-border)' }}>#</th>
                                <th style={{ width: '22%', border: '1px solid var(--color-border)' }}>Equipment</th>
                                <th style={{ width: '18%', border: '1px solid var(--color-border)' }}>Sport</th>
                                <th style={{ width: '10%', border: '1px solid var(--color-border)', textAlign: 'center' }}>Total</th>
                                <th style={{ width: '10%', border: '1px solid var(--color-border)', textAlign: 'center' }}>Available</th>
                                <th style={{ width: '12%', border: '1px solid var(--color-border)', textAlign: 'center' }}>Status</th>
                                <th style={{ width: '12%', border: '1px solid var(--color-border)', textAlign: 'center' }}>Return Status</th>
                            </tr>
                            <tr>
                                <th style={{ border: '1px solid var(--color-border)' }} />
                                <th style={{ border: '1px solid var(--color-border)' }}>
                                    <input className="issue-search-input" style={{ width: '97%' }} placeholder="Filter equipment" value={filters.equipment} onChange={(e) => setFilter('equipment', e.target.value)} />
                                </th>
                                <th style={{ border: '1px solid var(--color-border)' }}>
                                    <input className="issue-search-input" style={{ width: '97%' }} placeholder="Filter sport" value={filters.sport} onChange={(e) => setFilter('sport', e.target.value)} />
                                </th>
                                <th style={{ border: '1px solid var(--color-border)' }}>
                                    <input className="issue-search-input" style={{ width: '97%' }} placeholder="Filter total" value={filters.total} onChange={(e) => setFilter('total', e.target.value)} />
                                </th>
                                <th style={{ border: '1px solid var(--color-border)' }}>
                                    <input className="issue-search-input" style={{ width: '97%' }} placeholder="Filter available" value={filters.available} onChange={(e) => setFilter('available', e.target.value)} />
                                </th>
                                <th style={{ border: '1px solid var(--color-border)' }}>
                                    <select className="issue-search-input" style={{ width: '97%' }} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                                        <option value="all">All</option>
                                        <option value="available">Available</option>
                                        <option value="out of stock">Out of Stock</option>
                                    </select>
                                </th>
                                <th style={{ border: '1px solid var(--color-border)' }}>
                                    <select className="issue-search-input" style={{ width: '97%' }} value={filters.returnStatus} onChange={(e) => setFilter('returnStatus', e.target.value)}>
                                        <option value="all">All</option>
                                        <option value="returned">Returned</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleEquipment.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', border: '1px solid var(--color-border)' }}>
                                        No equipment matches the current filters.
                                    </td>
                                </tr>
                            ) : (
                                visibleEquipment.map((item, index) => {
                                    const statusKey = getStatusKey(item);
                                    const returnStateKey = getReturnStateKey(item);
                                    return (
                                        <tr key={item.id}>
                                            <td style={{ textAlign: 'center', border: '1px solid var(--color-border)' }}>{index + 1}</td>
                                            <td style={{ padding: '0px 10px', border: '1px solid var(--color-border)' }}><strong>{item.equipment_name}</strong></td>
                                            <td style={{ padding: '0px 10px', border: '1px solid var(--color-border)' }}>{item.sport_name || '—'}</td>
                                            <td style={{ textAlign: 'center', border: '1px solid var(--color-border)' }}>{item.total_quantity}</td>
                                            <td style={{ textAlign: 'center', border: '1px solid var(--color-border)' }}>{item.remaining_quantity}</td>
                                            <td style={{ textAlign: 'center', border: '1px solid var(--color-border)' }}>
                                                <span className={`eq-badge ${statusKey === 'available' ? 'badge-success' : 'badge-danger'}`}>
                                                    {getStatus(item)}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center', border: '1px solid var(--color-border)' }}>
                                                <span className={`eq-badge ${returnStateKey === 'returned' ? 'badge-success' : 'badge-danger'}`}>
                                                    {getReturnState(item)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default IssueEquipment;