import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/template.css";

const ManageStock = () => {
  const navigate = useNavigate();

  return (
    <div className="template-container">
      <div className="template-header">
        <h1>Manage Equipment</h1>
        <p>Select an operation</p>
      </div>

      <div className="template-section" style={{ textAlign: "center" }}>
        <button onClick={() => navigate("/add-equipment")}>
          Add New Equipment
        </button>

        <button onClick={() => navigate("/update-stock-list")}>
          Update Stock
        </button>
      </div>
    </div>
  );
};

export default ManageStock;