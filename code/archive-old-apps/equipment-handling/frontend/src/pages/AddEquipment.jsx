import React, { useState } from "react";
import api from "../utils/api";
import "../styles/template.css";

const AddEquipment = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    total_quantity: "",
    available_quantity: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/equipment", {
        ...formData,
        total_quantity: Number(formData.total_quantity),
        available_quantity: Number(formData.available_quantity),
      });

      alert("Equipment added successfully");

      // clear form
      setFormData({
        name: "",
        category: "",
        total_quantity: "",
        available_quantity: "",
      });

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error adding equipment");
    }
  };

  return (
    <div className="template-container">
      <div className="template-header">
        <h1>Add New Equipment</h1>
        <p>Create a new equipment record</p>
      </div>

      <div className="template-section">
        <form className="template-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
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
            />
          </div>

          <div className="form-group">
            <label>Available Quantity</label>
            <input
              type="number"
              name="available_quantity"
              value={formData.available_quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit">Add Equipment</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddEquipment;