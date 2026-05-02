import React, { useEffect, useState } from "react";
import { manageAPI } from '../utils/api';
import '../styles/template.css';

const ManageEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await manageAPI.getAll(search);
      setEquipment(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [search]);

  const handleAddStock = async (id, name) => {
    const quantity = prompt(`Add stock for ${name}. Enter quantity:`);
    if (!quantity || isNaN(quantity) || quantity <= 0) return;

    try {
      await manageAPI.addStock(id, parseInt(quantity));
      alert('Stock added successfully');
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding stock');
    }
  };

  const handleRemoveStock = async (id, name) => {
    const quantity = prompt(`Remove stock for ${name}. Enter quantity:`);
    if (!quantity || isNaN(quantity) || quantity <= 0) return;

    try {
      await manageAPI.removeStock(id, parseInt(quantity));
      alert('Stock removed successfully');
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing stock');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await manageAPI.delete(id);
      alert('Equipment deleted successfully');
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting equipment');
    }
  };

  if (loading) return <div className="template-container"><p>Loading equipment...</p></div>;
  if (error) return <div className="template-container"><p>Error: {error}</p></div>;

  return (
    <div className="template-container">
      <div className="template-header">
        <h1>Manage Equipment</h1>
        <p>View and manage equipment stock</p>
      </div>

      <div className="template-content">
        <div className="template-section">
          <input
            type="text"
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              marginBottom: "20px",
              padding: "10px",
              width: "300px"
            }}
          />

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Sport</th>
                  <th>Total</th>
                  <th>Remaining</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.display_name}</td>
                    <td>{item.sport_name}</td>
                    <td>{item.total_quantity}</td>
                    <td>{item.remaining_quantity}</td>
                    <td>
                      <button onClick={() => handleAddStock(item.id, item.display_name)}>
                        Add Stock
                      </button>
                      <button onClick={() => handleRemoveStock(item.id, item.display_name)}>
                        Remove Stock
                      </button>
                      <button onClick={() => handleDelete(item.id, item.display_name)} style={{ backgroundColor: "red", color: "white" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEquipment;