import pool from '../utils/database.js';

/*
export const getAllCourts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id,
              c.name,
              c.type,
              c.sport,
              cs.status,
              cs.reason,
              cs.updated_at
              cs.updated_by
       FROM courts c
       LEFT JOIN LATERAL (
         SELECT status, reason, updated_at, updated_by
         FROM court_status
         WHERE court_id = c.id
         ORDER BY updated_at DESC
         LIMIT 1
       ) cs ON true
       ORDER BY c.name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Court fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch courts', error: error.message });
  }
}; */

export const getAllCourts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id,
              c.name,
              c.location,
              c.capacity,
              s.name AS sport,
              cs.status,
              cs.reason,
              cs.updated_at
       FROM courts c
       LEFT JOIN sports s ON c.sport_id = s.id
       LEFT JOIN LATERAL (
         SELECT status, reason, updated_at
         FROM court_status
         WHERE court_id = c.id
         ORDER BY updated_at DESC
         LIMIT 1
       ) cs ON true
       ORDER BY c.name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Court fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch courts', error: error.message });
  }
};

export const updateCourtStatus = async (req, res) => {
  try {
    const courtId = parseInt(req.params.id, 10);
    const { status, reason, startTime, endTime } = req.body;
    const updatedBy = req.user?.userId || null;

    if (!courtId || !status) {
      return res.status(400).json({ message: 'Court ID and status are required' });
    }

    const result = await pool.query(
      `INSERT INTO court_status (court_id, status, reason, start_time, end_time, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [courtId, status, reason || null, startTime || new Date(), endTime || new Date(Date.now() + 3600000), updatedBy]
    );

    res.json({ message: 'Court status updated successfully', courtStatus: result.rows[0] });
  } catch (error) {
    console.error('Court status update error:', error);
    res.status(500).json({ message: 'Failed to update court status', error: error.message });
  }
};

export const blockCourt = async (req, res) => {
  try {
    const courtId = parseInt(req.params.id, 10);
    const { reason, startTime, endTime } = req.body;
    const updatedBy = req.user?.userId || null;

    if (!courtId) {
      return res.status(400).json({ message: 'Court ID is required' });
    }

    const result = await pool.query(
      `INSERT INTO court_status (court_id, status, reason, start_time, end_time, updated_by)
       VALUES ($1, 'Blocked', $2, $3, $4, $5)
       RETURNING *`,
      [courtId, reason || 'Blocked by admin', startTime || new Date(), endTime || new Date(Date.now() + 3600000), updatedBy]
    );

    res.json({ message: 'Court blocked successfully', courtStatus: result.rows[0] });
  } catch (error) {
    console.error('Block court error:', error);
    res.status(500).json({ message: 'Failed to block court', error: error.message });
  }
};

export const getCrowdLevel = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT crowd_level, updated_at
       FROM gym_crowd_status
       ORDER BY updated_at DESC
       LIMIT 1`
    );

    const crowdLevel = result.rows[0]?.crowd_level || 'Low';
    res.json({ crowd_level: crowdLevel });
  } catch (error) {
    console.error('Crowd level fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch crowd level', error: error.message });
  }
};

export const updateCrowdLevel = async (req, res) => {
  try {
    const { crowdLevel } = req.body;
    const updatedBy = req.user?.userId || null;

    if (!crowdLevel) {
      return res.status(400).json({ message: 'Crowd level is required' });
    }

    const result = await pool.query(
      `INSERT INTO gym_crowd_status (crowd_level, updated_by)
       VALUES ($1, $2)
       RETURNING *`,
      [crowdLevel, updatedBy]
    );

    res.json({ message: 'Crowd level updated successfully', crowdStatus: result.rows[0] });
  } catch (error) {
    console.error('Update crowd level error:', error);
    res.status(500).json({ message: 'Failed to update crowd level', error: error.message });
  }
};
