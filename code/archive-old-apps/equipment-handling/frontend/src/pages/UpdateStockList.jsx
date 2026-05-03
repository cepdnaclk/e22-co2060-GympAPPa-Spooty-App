import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import "../styles/template.css";

const UpdateStockList = () => {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this equipment?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/equipment/${id}`);

      alert("Equipment deleted successfully");

      // refresh list
      setEquipment((prev) => prev.filter((item) => item.equipment_id !== id));

    } catch (error) {
      console.error(error);
      alert("Error deleting equipment");
    }
  };

  useEffect(() => {
  const fetchEquipment = async () => {
    try {
      const res = await api.get(`/equipment?search=${search}`);
      setEquipment(res.data);
    } catch (err) {
      console.error("Error fetching equipment:", err);
    }
  };

  fetchEquipment();
}, [search]);

  

  return (
    <div className="template-container">
      <div className="template-header">
        <h1>Update Stock</h1>
        <p>Select equipment to update stock</p>
      </div>

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

      

      <div className="template-section">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Total</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item.equipment_id}>
                  <td>{item.equipment_id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.total_quantity}</td>
                  <td>{item.available_quantity}</td>
                  <td>
                    <button onClick={() => navigate(`/update-stock/${item.equipment_id}`)}>
                      Update Stock
                    </button>
                    <button onClick={() => handleDelete(item.equipment_id)} style={{ backgroundColor: "red", color: "white" }}>
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
  );
};

export default UpdateStockList;