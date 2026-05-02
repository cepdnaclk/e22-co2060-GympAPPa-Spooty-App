import pool from "../utils/database.js";

/*
GET ALL EQUIPMENT
Supports search functionality for the Equipment List page
Example: /api/manage?search=ball
*/
export const getAllEquipment = async (req, res) => {
  const { search } = req.query;

  try {
    let result;

    if (search) {
      result = await pool.query(
        `SELECT se.*, s.name as sport_name FROM sport_equipment se
         JOIN sports s ON se.sport_id = s.id
         WHERE LOWER(se.display_name) LIKE LOWER($1)
         ORDER BY s.name, se.display_name`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query(
        `SELECT se.*, s.name as sport_name FROM sport_equipment se
         JOIN sports s ON se.sport_id = s.id
         ORDER BY s.name, se.display_name`
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
      `SELECT se.*, s.name as sport_name FROM sport_equipment se
       JOIN sports s ON se.sport_id = s.id
       WHERE se.id=$1`,
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
  const { sport_id, display_name, total_quantity, remaining_quantity } = req.body;

  if (remaining_quantity > total_quantity) {
    return res.status(400).json({
      message: "Remaining quantity cannot exceed total quantity"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO sport_equipment (sport_id, display_name, total_quantity, remaining_quantity)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [sport_id, display_name, total_quantity, remaining_quantity]
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
  const { sport_id, display_name, total_quantity, remaining_quantity } = req.body;

  if (remaining_quantity > total_quantity) {
    return res.status(400).json({
      message: "Remaining quantity cannot exceed total quantity"
    });
  }

  try {
    const result = await pool.query(
      `UPDATE sport_equipment
       SET sport_id=$1,
           display_name=$2,
           total_quantity=$3,
           remaining_quantity=$4
       WHERE id=$5
       RETURNING *`,
      [sport_id, display_name, total_quantity, remaining_quantity, id]
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
      "DELETE FROM sport_equipment WHERE id=$1 RETURNING *",
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
      `UPDATE sport_equipment
       SET total_quantity = total_quantity + $1,
           remaining_quantity = remaining_quantity + $1
       WHERE id = $2
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
      "SELECT total_quantity, remaining_quantity FROM sport_equipment WHERE id=$1",
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
      `UPDATE sport_equipment
       SET total_quantity = total_quantity - $1,
           remaining_quantity = remaining_quantity - $1
       WHERE id = $2
       RETURNING *`,
      [quantity, id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing stock" });
  }
};

/*
GET SPORTS LIST
*/
export const getSports = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sports ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sports" });
  }
};
/*
ADD NEW SPORT
*/
export const addSport = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Sport name is required" });
  }

  const formattedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

  try {
    const existing = await pool.query(
      'SELECT id FROM sports WHERE LOWER(name) = LOWER($1)',
      [formattedName]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Sport already exists" });
    }

    const result = await pool.query(
      'INSERT INTO sports (name) VALUES ($1) RETURNING *',
      [formattedName]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding sport" });
  }
};