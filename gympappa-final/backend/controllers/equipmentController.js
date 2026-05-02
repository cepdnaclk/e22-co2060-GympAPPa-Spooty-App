import pool from '../utils/database.js';

/**
 * GET /api/equipment
 * Returns equipment grouped by sport with display names and quantities
 */
export const getAllEquipment = async (req, res) => {
  try {
    const query = `
      SELECT s.name as sport_name, se.id, se.display_name, se.remaining_quantity, se.total_quantity
      FROM sport_equipment se
      JOIN sports s ON se.sport_id = s.id
      ORDER BY s.name ASC, se.display_name ASC
    `;
    const result = await pool.query(query);

    const groupedBySport = {};
    result.rows.forEach((item) => {
      const sportName = item.sport_name;
      if (!groupedBySport[sportName]) {
        groupedBySport[sportName] = [];
      }
      groupedBySport[sportName].push({
        id: item.id,
        display_name: item.display_name,
        remaining_quantity: parseInt(item.remaining_quantity),
        total_quantity: parseInt(item.total_quantity),
      });
    });

    res.status(200).json(groupedBySport);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  }
};

/**
 * POST /api/equipment/request
 */
export const requestEquipment = async (req, res) => {
  const { studentId, equipment_id, quantity, pickupTime } = req.body;

  if (!studentId || !equipment_id || !quantity || !pickupTime) {
    return res.status(400).json({
      message: 'studentId, equipment_id, quantity and pickupTime are required',
    });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'quantity must be a positive integer' });
  }

  if (isNaN(Date.parse(pickupTime))) {
    return res.status(400).json({ message: 'Invalid pickup time format' });
  }

  const hour = new Date(pickupTime).getHours();
  if (hour < 8 || hour >= 20) {
    return res.status(400).json({ message: 'Pickup time must be between 8:00 AM and 8:00 PM' });
  }

  try {
    // Check active issued
    const activeQuery = `
      SELECT COUNT(*) as count FROM requested_equipment
      WHERE student_id = $1 AND status IN ('pending', 'issued', 'pending_return')
    `;
    const activeResult = await pool.query(activeQuery, [studentId]);
    if (parseInt(activeResult.rows[0].count) > 0) {
      return res.status(400).json({
        message: 'You have active equipment that must be returned before requesting new items',
      });
    }

    // Check availability
    const availQuery = 'SELECT remaining_quantity FROM sport_equipment WHERE id = $1';
    const availResult = await pool.query(availQuery, [equipment_id]);
    if (availResult.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    if (parseInt(availResult.rows[0].remaining_quantity) < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Insert request
    const insertQuery = `
      INSERT INTO requested_equipment (student_id, equipment_id, quantity, pickup_time, status)
      VALUES ($1, $2, $3, $4, 'pending') RETURNING id
    `;
    const insertResult = await pool.query(insertQuery, [studentId, equipment_id, quantity, pickupTime]);

    
    res.status(201).json({
      message: 'Equipment requested successfully',
      requestId: insertResult.rows[0].id,
    });
  } catch (error) {
    console.error('Error requesting equipment:', error);
    res.status(500).json({ message: 'Error requesting equipment', error: error.message });
  }
};

/**
 * DELETE /api/equipment/request/:requestId
 */
export const cancelRequest = async (req, res) => {
  const { requestId } = req.params;
  const studentId = req.user.userId;

  try {
    const requestQuery = 'SELECT * FROM requested_equipment WHERE id = $1 AND student_id = $2';
    const requestResult = await pool.query(requestQuery, [requestId, studentId]);
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requestResult.rows[0];
    if (request.status !== 'issued') {
      return res.status(400).json({ message: 'Cannot cancel this request' });
    }

    // Restore quantity
    const updateQuery = 'UPDATE sport_equipment SET remaining_quantity = remaining_quantity + $1 WHERE id = $2';
    await pool.query(updateQuery, [request.quantity, request.equipment_id]);

    // Delete request
    const deleteQuery = 'DELETE FROM requested_equipment WHERE id = $1';
    await pool.query(deleteQuery, [requestId]);

    res.json({ message: 'Request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ message: 'Error cancelling request', error: error.message });
  }
};

/**
 * PUT /api/equipment/:equipmentId/quantity
 */
export const updateEquipmentQuantity = async (req, res) => {
  const { equipmentId } = req.params;
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'quantity must be a non-negative integer' });
  }

  try {
    const updateQuery = 'UPDATE sport_equipment SET total_quantity = $1, remaining_quantity = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(updateQuery, [quantity, equipmentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({ message: 'Equipment quantity updated successfully' });
  } catch (error) {
    console.error('Error updating equipment quantity:', error);
    res.status(500).json({ message: 'Error updating equipment quantity', error: error.message });
  }
};

/**
 * GET /api/equipment/history/:studentId
 */
export const getStudentHistory = async (req, res) => {
  const { studentId } = req.params;

  try {
    const query = `
      SELECT re.*, se.display_name, s.name as sport_name
      FROM requested_equipment re
      JOIN sport_equipment se ON re.equipment_id = se.id
      JOIN sports s ON se.sport_id = s.id
      WHERE re.student_id = $1
      ORDER BY re.requested_at DESC
    `;
    const result = await pool.query(query, [studentId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching student history:', error);
    res.status(500).json({ message: 'Error fetching student history', error: error.message });
  }
};

/**
 * PATCH /api/equipment/request/:requestId
 */
export const initiateReturn = async (req, res) => {
  const { requestId } = req.params;
  const studentId = req.user.userId;

  try {
    const updateQuery = "UPDATE requested_equipment SET status = 'pending_return' WHERE id = $1 AND student_id = $2 AND status = 'issued' RETURNING *";
    const result = await pool.query(updateQuery, [requestId, studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found or cannot be returned' });
    }

    res.json({ message: 'Return initiated successfully' });
  } catch (error) {
    console.error('Error initiating return:', error);
    res.status(500).json({ message: 'Error initiating return', error: error.message });
  }
};

/**
 * PATCH /api/equipment/request/:requestId/return-approved
 */
export const approveReturn = async (req, res) => {
  const { requestId } = req.params;

  try {
    const requestQuery = "SELECT * FROM requested_equipment WHERE id = $1 AND status = 'pending_return'";
    const requestResult = await pool.query(requestQuery, [requestId]);
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Pending return request not found' });
    }

    const request = requestResult.rows[0];

    // Update status to returned
    const updateStatusQuery = "UPDATE requested_equipment SET status = 'returned' WHERE id = $1";
    await pool.query(updateStatusQuery, [requestId]);

    // Restore quantity
    const updateQuantityQuery = 'UPDATE sport_equipment SET remaining_quantity = remaining_quantity + $1 WHERE id = $2';
    await pool.query(updateQuantityQuery, [request.quantity, request.equipment_id]);

    res.json({ message: 'Return approved successfully' });
  } catch (error) {
    console.error('Error approving return:', error);
    res.status(500).json({ message: 'Error approving return', error: error.message });
  }
};