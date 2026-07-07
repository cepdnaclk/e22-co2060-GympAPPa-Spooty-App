import React, { useState, useEffect } from "react";
import { manageAPI } from '../utils/api';
import '../styles/template.css';

const AddEquipment = () => {
  const [sports, setSports] = useState([]);
  const [formData, setFormData] = useState({
    sport_id: "",
    display_name: "",
    total_quantity: "",
    remaining_quantity: "",
  });
  const [newSportName, setNewSportName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sportLoading, setSportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sportError, setSportError] = useState(null);
  const [sportSuccess, setSportSuccess] = useState(null);

  const fetchSports = async () => {
    try {
      const response = await manageAPI.getSports();
      setSports(response.data);
    } catch (err) {
      setError('Failed to load sports');
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const handleAddSport = async () => {
    setSportError(null); setSportSuccess(null);
    if (!newSportName.trim()) { setSportError('Please enter a sport name.'); return; }
    setSportLoading(true);
    try {
      await manageAPI.addSport(newSportName.trim());
      setSportSuccess(`✓ "${newSportName}" added successfully!`);
      setNewSportName("");
      fetchSports(); // refresh dropdown
    } catch (err) {
      setSportError(err.response?.data?.message || 'Error adding sport');
    } finally {
      setSportLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await manageAPI.add({
        ...formData,
        total_quantity: parseInt(formData.total_quantity),
        remaining_quantity: parseInt(formData.remaining_quantity),
      });
      alert("Equipment added successfully");
      setFormData({ sport_id: "", display_name: "", total_quantity: "", remaining_quantity: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error adding equipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-container">
      <div className="template-header">
        <h1>Add New Equipment</h1>
        <p>Add a new sport or add equipment to an existing sport</p>
      </div>

      <div className="template-content">

        {/* ── Add New Sport Section ── */}
        <div className="template-section" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '12px' }}>Add New Sport</h3>
          <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
            If the sport doesn't exist in the dropdown below, add it here first.
          </p>
          {sportError   && <div className="error-message"   style={{ marginBottom: '12px' }}>{sportError}</div>}
          {sportSuccess && <div className="success-message" style={{ marginBottom: '12px' }}>{sportSuccess}</div>}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="e.g. Swimming, Athletics, Netball"
              value={newSportName}
              onChange={(e) => setNewSportName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSport()}
              style={{ padding: '10px', flex: 1, maxWidth: '400px' }}
            />
            <button
              onClick={handleAddSport}
              disabled={sportLoading}
              className="btn-primary"
            >
              {sportLoading ? 'Adding...' : '+ Add Sport'}
            </button>
          </div>
        </div>

        {/* ── Add Equipment Section ── */}
        <div className="template-section">
          <h3 style={{ marginBottom: '16px' }}>Add Equipment to Sport</h3>
          <form className="template-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Sport</label>
              <select name="sport_id" value={formData.sport_id} onChange={handleChange} required>
                <option value="">Select Sport</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Equipment Name</label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="e.g. Swimming Board, Relay Baton"
                required
              />
            </div>

            <div className="form-group">
              <label>Total Quantity</label>
              <input
                type="number"
                name="total_quantity"
                value={formData.total_quantity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Remaining Quantity</label>
              <input
                type="number"
                name="remaining_quantity"
                value={formData.remaining_quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : '+ Add Equipment'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AddEquipment;