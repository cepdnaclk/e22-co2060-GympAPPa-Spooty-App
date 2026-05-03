import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/template.css";

const UpdateStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState("");

  const handleAddStock = async () => {
    try {
      await api.patch(`/equipment/${id}/add-stock`, {
        quantity: Number(quantity),
      });

      alert("Stock added successfully");
      navigate("/update-stock-list");
    } catch (err) {
      console.error(err);
      alert("Error adding stock");
    }
  };

  const handleRemoveStock = async () => {
    try {
      await api.patch(`/equipment/${id}/remove-stock`, {
        quantity: Number(quantity),
      });

      alert("Stock removed successfully");
      navigate("/update-stock-list");
    } catch (err) {
      console.error(err);
      alert("Error removing stock");
    }
  };

  return (
    <div className="template-container">
      <div className="template-header">
        <h1>Update Stock</h1>
        <p>Manage stock for equipment ID: {id}</p>
      </div>

      <div className="template-section" style={{ textAlign: "center" }}>
        
        <input
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ padding: "10px", marginBottom: "20px" }}
        />

        <div>
          <button
            style={{ margin: "10px", padding: "10px 20px" }}
            onClick={handleAddStock}
          >
            Add Stock
          </button>

          <button
            style={{ margin: "10px", padding: "10px 20px" }}
            onClick={handleRemoveStock}
          >
            Remove Stock
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdateStock;