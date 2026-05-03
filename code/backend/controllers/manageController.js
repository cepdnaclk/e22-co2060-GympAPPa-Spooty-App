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
const resolveEquipmentId = async (client, equipmentId, displayName) => {
  if (equipmentId !== undefined && equipmentId !== null && equipmentId !== '') {
    const parsedEquipmentId = Number(equipmentId);
    if (Number.isInteger(parsedEquipmentId) && parsedEquipmentId > 0) {
      return parsedEquipmentId;
    }
    throw new Error('Invalid equipment id');
  }

  const equipmentLookup = await client.query(
    'SELECT id FROM equipment WHERE LOWER(name) = LOWER($1)',
    [displayName]
  );

  if (equipmentLookup.rows.length > 0) {
    return equipmentLookup.rows[0].id;
  }

  const createdEquipment = await client.query(
    'INSERT INTO equipment (name) VALUES ($1) RETURNING id',
    [displayName]
  );

  return createdEquipment.rows[0].id;
};

export const addEquipment = async (req, res) => {
  const { sport_id, equipment_id, display_name, total_quantity, remaining_quantity } = req.body;

  const sportId = Number(sport_id);
  const resolvedEquipmentId = equipment_id !== undefined && equipment_id !== null && equipment_id !== ''
    ? Number(equipment_id)
    : null;
  const cleanDisplayName = typeof display_name === 'string' ? display_name.trim() : '';
  const total = Number(total_quantity);
  const remaining = Number(remaining_quantity);

  if (!Number.isInteger(sportId) || sportId <= 0) {
    return res.status(400).json({ message: 'Sport is required' });
  }

  if (!cleanDisplayName) {
    return res.status(400).json({ message: 'Equipment name is required' });
  }

  if (!Number.isInteger(total) || total <= 0) {
    return res.status(400).json({ message: 'Total quantity must be greater than 0' });
  }

  if (!Number.isInteger(remaining) || remaining < 0) {
    return res.status(400).json({ message: 'Remaining quantity must be 0 or greater' });
  }

  if (remaining > total) {
    return res.status(400).json({
      message: "Remaining quantity cannot exceed total quantity"
    });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const equipmentId = await resolveEquipmentId(client, resolvedEquipmentId, cleanDisplayName);

      const result = await client.query(
        `INSERT INTO sport_equipment (sport_id, equipment_id, display_name, total_quantity, remaining_quantity)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [sportId, Number(equipmentId), cleanDisplayName, total, remaining]
      );

      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

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
  const { sport_id, equipment_id, display_name, total_quantity, remaining_quantity } = req.body;

  const sportId = Number(sport_id);
  const resolvedEquipmentId = equipment_id !== undefined && equipment_id !== null && equipment_id !== ''
    ? Number(equipment_id)
    : null;
  const cleanDisplayName = typeof display_name === 'string' ? display_name.trim() : '';
  const total = Number(total_quantity);
  const remaining = Number(remaining_quantity);

  if (!Number.isInteger(sportId) || sportId <= 0) {
    return res.status(400).json({ message: 'Sport is required' });
  }

  if (!cleanDisplayName) {
    return res.status(400).json({ message: 'Equipment name is required' });
  }

  if (!Number.isInteger(total) || total <= 0) {
    return res.status(400).json({ message: 'Total quantity must be greater than 0' });
  }

  if (!Number.isInteger(remaining) || remaining < 0) {
    return res.status(400).json({ message: 'Remaining quantity must be 0 or greater' });
  }

  if (remaining > total) {
    return res.status(400).json({
      message: "Remaining quantity cannot exceed total quantity"
    });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const equipmentId = await resolveEquipmentId(client, resolvedEquipmentId, cleanDisplayName);

      const result = await client.query(
        `UPDATE sport_equipment
         SET sport_id=$1,
             equipment_id=$2,
             display_name=$3,
             total_quantity=$4,
             remaining_quantity=$5
         WHERE id=$6
         RETURNING *`,
        [sportId, equipmentId, cleanDisplayName, total, remaining, id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: "Equipment not found" });
      }

      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

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