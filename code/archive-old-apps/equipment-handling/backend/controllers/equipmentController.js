import pool from "../config/db.js";

/*
GET ALL EQUIPMENT
Supports search functionality for the Equipment List page
Example: /equipment?search=ball
*/
export const getAllEquipment = async (req, res) => {
  const { search } = req.query;

  try {
    let result;

    if (search) {
      result = await pool.query(
        `SELECT * FROM equipment 
         WHERE LOWER(name) LIKE LOWER($1)
         ORDER BY equipment_id`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM equipment ORDER BY equipment_id"
      );
    }

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching equipment" });
  }
};


/*
GET SINGLE EQUIPMENT
Used when selecting an item in Update Stock page
*/
export const getEquipmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM equipment WHERE equipment_id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching equipment" });
  }
};


/*
ADD NEW EQUIPMENT
Used in Add Stock page when creating new equipment
*/
export const addEquipment = async (req, res) => {
  const { name, category, total_quantity, available_quantity } = req.body;

  if (available_quantity > total_quantity) {
    return res.status(400).json({
      message: "Available quantity cannot exceed total quantity"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO equipment (name, category, total_quantity, available_quantity)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [name, category, total_quantity, available_quantity]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding equipment" });
  }
};


/*
UPDATE EQUIPMENT DETAILS
*/
export const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, category, total_quantity, available_quantity } = req.body;

  if (available_quantity > total_quantity) {
    return res.status(400).json({
      message: "Available quantity cannot exceed total quantity"
    });
  }

  try {
    const result = await pool.query(
      `UPDATE equipment
       SET name=$1,
           category=$2,
           total_quantity=$3,
           available_quantity=$4
       WHERE equipment_id=$5
       RETURNING *`,
      [name, category, total_quantity, available_quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating equipment" });
  }
};


/*
DELETE EQUIPMENT COMPLETELY
Used in Remove Stock page
*/
export const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM equipment WHERE equipment_id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json({ message: "Equipment deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting equipment" });
  }
};


/*
ADD STOCK
Used in Add Stock page
*/
export const addStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0" });
  }

  try {
    const result = await pool.query(
      `UPDATE equipment
       SET total_quantity = total_quantity + $1,
           available_quantity = available_quantity + $1
       WHERE equipment_id = $2
       RETURNING *`,
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding stock" });
  }
};


/*
REMOVE STOCK
Used in Remove Stock page
Prevents negative quantities
*/
export const removeStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0" });
  }

  try {

    const check = await pool.query(
      "SELECT total_quantity, available_quantity FROM equipment WHERE equipment_id=$1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    const currentTotal = check.rows[0].total_quantity;

    if (quantity > currentTotal) {
      return res.status(400).json({
        message: "Not enough stock to remove"
      });
    }

    const result = await pool.query(
      `UPDATE equipment
       SET total_quantity = total_quantity - $1,
           available_quantity = available_quantity - $1
       WHERE equipment_id = $2
       RETURNING *`,
      [quantity, id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing stock" });
  }
};