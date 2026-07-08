import pool from '../utils/database.js';

const VALID_STATUSES = ['Available', 'Occupied', 'Reserved', 'Blocked'];
const VALID_CROWD_LEVELS = ['Low', 'Moderate', 'High', 'Full'];

/**
 * GET /api/courts
 * Returns all courts with their latest status snapshot for the admin management view.
 */
export const getAllCourts = async (req, res) => {
  try {
    const query = `
      SELECT
        c.id,
        c.name,
        c.type,
        c.sport,
        COALESCE(latest.status, 'Available') AS status,
        latest.reason,
        latest.start_time,
        latest.end_time,
        latest.updated_by,
        latest.updated_at
      FROM courts c
      LEFT JOIN LATERAL (
        SELECT cs.status, cs.reason, cs.start_time, cs.end_time, cs.updated_by, cs.updated_at
        FROM court_status cs
        WHERE cs.court_id = c.id
        ORDER BY cs.updated_at DESC, cs.id DESC
        LIMIT 1
      ) latest ON TRUE
      ORDER BY c.type ASC, c.name ASC
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching courts:', error);
    res.status(500).json({ message: 'Error fetching courts', error: error.message });
  }
};

/**
 * PUT /api/courts/:id/status
 * Updates a court status and stores a new status record for audit purposes.
 */
export const updateCourtStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason, start_time, end_time } = req.body;
  const updatedBy = req.user?.userId || 'system';

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid court status.' });
  }

  if (!start_time) {
    return res.status(400).json({ message: 'Start time is required.' });
  }

  if (!end_time) {
    return res.status(400).json({ message: 'End time is required.' });
  }

  if (status !== 'Available' && !reason?.trim()) {
    return res.status(400).json({ message: 'Reason is required when the court is not available.' });
  }

  const startDate = new Date(start_time);
  const endDate = new Date(end_time);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return res.status(400).json({ message: 'Please use a valid date and time format.' });
  }

  if (endDate <= startDate) {
    return res.status(400).json({ message: 'End time must be after start time.' });
  }

  try {
    const courtCheck = await pool.query('SELECT id FROM courts WHERE id = $1', [id]);
    if (courtCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Court not found.' });
    }

    const insertQuery = `
      INSERT INTO court_status (court_id, status, reason, start_time, end_time, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      id,
      status,
      reason?.trim() || null,
      startDate.toISOString(),
      endDate.toISOString(),
      updatedBy,
    ]);

    res.status(200).json({
      message: 'Court status updated successfully.',
      record: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating court status:', error);
    res.status(500).json({ message: 'Error updating court status', error: error.message });
  }
};

/**
 * PUT /api/courts/:id/block
 * Creates a blocked status record for an event or maintenance window.
 */
export const blockCourt = async (req, res) => {
  const { id } = req.params;
  const { reason, start_time, end_time } = req.body;
  const updatedBy = req.user?.userId || 'system';

  if (!reason?.trim()) {
    return res.status(400).json({ message: 'Reason is required for blocking a court.' });
  }

  if (!start_time) {
    return res.status(400).json({ message: 'Start time is required.' });
  }

  if (!end_time) {
    return res.status(400).json({ message: 'End time is required.' });
  }

  const startDate = new Date(start_time);
  const endDate = new Date(end_time);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return res.status(400).json({ message: 'Please use a valid date and time format.' });
  }

  if (endDate <= startDate) {
    return res.status(400).json({ message: 'End time must be after start time.' });
  }

  try {
    const courtCheck = await pool.query('SELECT id FROM courts WHERE id = $1', [id]);
    if (courtCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Court not found.' });
    }

    const insertQuery = `
      INSERT INTO court_status (court_id, status, reason, start_time, end_time, updated_by, updated_at)
      VALUES ($1, 'Blocked', $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      id,
      reason.trim(),
      startDate.toISOString(),
      endDate.toISOString(),
      updatedBy,
    ]);

    res.status(200).json({
      message: 'Court blocked successfully.',
      record: result.rows[0],
    });
  } catch (error) {
    console.error('Error blocking court:', error);
    res.status(500).json({ message: 'Error blocking court', error: error.message });
  }
};

/**
 * PUT /api/crowd
 * Stores the latest crowd level for the gymnasium area.
 */
export const updateCrowdLevel = async (req, res) => {
  const { crowd_level } = req.body;
  const updatedBy = req.user?.userId || 'system';

  if (!crowd_level) {
    return res.status(400).json({ message: 'Crowd level is required.' });
  }

  if (!VALID_CROWD_LEVELS.includes(crowd_level)) {
    return res.status(400).json({ message: 'Invalid crowd level.' });
  }

  try {
    const insertQuery = `
      INSERT INTO gym_crowd_status (crowd_level, updated_by, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [crowd_level, updatedBy]);
    res.status(200).json({
      message: 'Crowd level updated successfully.',
      record: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating crowd level:', error);
    res.status(500).json({ message: 'Error updating crowd level', error: error.message });
  }
};

/**
 * GET /api/crowd
 * Returns the latest crowd level for the admin dashboard card.
 */
export const getCrowdLevel = async (req, res) => {
  try {
    const query = `
      SELECT crowd_level, updated_by, updated_at
      FROM gym_crowd_status
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(200).json({ crowd_level: 'Low', updated_by: null, updated_at: null });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching crowd level:', error);
    res.status(500).json({ message: 'Error fetching crowd level', error: error.message });
  }
};
