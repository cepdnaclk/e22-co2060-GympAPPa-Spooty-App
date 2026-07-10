import pool from '../utils/database.js';
import { isRequestExpired, isBookingTimeAllowed, SPORTS } from '../utils/partnerFinderUtils.js';

const normalizeStatus = (status = '') => String(status).trim().toLowerCase();

const buildRequestPayload = (request) => {
  let sessionEnded = false;
  if (request.date && (request.end_time || request.start_time)) {
    const dateOnly = String(request.date).substring(0, 10);
    const timeToUse = request.end_time || request.start_time;
    const endDateTime = new Date(`${dateOnly}T${timeToUse}`);
    sessionEnded = new Date() > endDateTime;
  }

  return {
    id: request.id,
    userId: request.user_id,
    studentName: request.student_name,
    registrationNumber: request.registration_number,
    sport: request.sport,
    date: request.date ? String(request.date).substring(0, 10) : null,
    startTime: request.start_time,
    endTime: request.end_time,
    venue: request.venue,
    skillLevel: request.skill_level,
    genderPreference: request.gender_preference,
    notes: request.notes,
    status: request.status,
    createdAt: request.created_at,
    isExpired: Boolean(request.is_expired),
    sessionEnded,
    canJoin: request.can_join,
    isOwner: Boolean(request.is_owner),
    joinStatus: request.join_status || null,
    matchedWith: request.matched_with || null,
    partnerName: request.partner_name || request.matched_with || null,
    partnerRegistrationNumber: request.partner_registration_number || null,
    partnerDetails: request.partner_details || null,
  };
};

const buildNotificationPayload = (notification) => ({
  ...notification,
  created_at: notification.created_at,
});

const clearObsoleteNotifications = async (poolClient, requestId) => {
  await poolClient.query(
    'DELETE FROM notifications WHERE related_request = $1 AND type IN ($2, $3, $4, $5, $6)',
    [requestId, 'join_request', 'request_accepted', 'request_rejected', 'match_confirmed', 'match_cancelled']
  );
};

const ensurePartnerFinderTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_chats (
      id SERIAL PRIMARY KEY,
      request_id INT NOT NULL UNIQUE,
      user1_id VARCHAR(20) NOT NULL,
      user2_id VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES partner_requests(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS partner_messages (
      id SERIAL PRIMARY KEY,
      chat_id INT NOT NULL,
      sender_id VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES partner_chats(id) ON DELETE CASCADE
    );
  `);
};

const ensurePartnerChat = async (requestId, currentUserId) => {
  await ensurePartnerFinderTables();

  const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1', [requestId]);
  const request = requestResult.rows[0];
  if (!request) return { request: null, chat: null };

  const joinResult = await pool.query(
    "SELECT requester_id FROM partner_join_requests WHERE request_id = $1 AND status = 'matched' ORDER BY created_at DESC LIMIT 1",
    [requestId]
  );
  const partnerId = joinResult.rows[0]?.requester_id;

  if (!partnerId || (currentUserId !== request.user_id && currentUserId !== partnerId)) {
    return { request, chat: null };
  }

  const existingChat = await pool.query('SELECT * FROM partner_chats WHERE request_id = $1', [requestId]);
  if (existingChat.rows[0]) {
    return { request, chat: existingChat.rows[0] };
  }

  const chatResult = await pool.query(
    'INSERT INTO partner_chats (request_id, user1_id, user2_id) VALUES ($1, $2, $3) RETURNING *',
    [requestId, request.user_id, partnerId]
  );

  return { request, chat: chatResult.rows[0] };
};

const ensureRequestState = async (poolClient, requestId) => {
  const result = await poolClient.query('SELECT * FROM partner_requests WHERE id = $1', [requestId]);
  const request = result.rows[0];
  if (!request) return null;

  const now = new Date();
  const expired = isRequestExpired(request.date, request.start_time, now);

  if (expired && request.status !== 'closed' && request.status !== 'matched') {
    await poolClient.query("UPDATE partner_requests SET status = 'expired' WHERE id = $1", [requestId]);
    return { ...request, status: 'expired' };
  }

  return request;
};

export const createPartnerRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      sport,
      date,
      startTime,
      endTime,
      venue,
      skillLevel,
      genderPreference,
      notes,
    } = req.body;

    if (!sport || !date || !startTime || !skillLevel) {
      return res.status(400).json({ message: 'Sport, date, start time, and skill level are required' });
    }

    if (!isBookingTimeAllowed(startTime)) {
      return res.status(400).json({ message: 'Games can only be scheduled between 8:00 AM and 8:00 PM.' });
    }

    const userResult = await pool.query('SELECT user_id, name, role FROM "user" WHERE user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingCheck = await pool.query(
    `SELECT id FROM partner_requests
     WHERE user_id = $1 AND sport = $2 AND date = $3::date AND start_time = $4
     AND status NOT IN ('closed', 'expired')`,
    [userId, sport, date, startTime]
 );
    if (existingCheck.rows.length > 0) {
      return res.status(409).json({ message: 'You already have an active request for this sport and time' });
    }

    const insertResult = await pool.query(
  `INSERT INTO partner_requests (
    user_id, sport, date, start_time, end_time, venue, skill_level, gender_preference, notes, status
  ) VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8, $9, 'open') RETURNING *`,
  [userId, sport, date, startTime, endTime || null, venue || null, skillLevel, genderPreference || 'Anyone', notes || null]
);
    const request = insertResult.rows[0];
    res.status(201).json({ message: 'Partner request created.', request: buildRequestPayload(request, userResult.rows[0]) });
  } catch (error) {
    console.error('Create partner request error:', error);
    res.status(500).json({ message: 'Failed to create partner request', error: error.message });
  }
};

export const getAvailableRequests = async (req, res) => {
  try {
    const { sport, regNumber, studentName, date, skillLevel, onlyOpen } = req.query;
    const userId = req.user.userId;
    const now = new Date();

    let query = `
      SELECT pr.*, u.name AS student_name, u.user_id AS registration_number,
             CASE WHEN pr.user_id = $1 THEN true ELSE false END AS is_owner,
             CASE WHEN jr.id IS NOT NULL THEN jr.status ELSE NULL END AS join_status,
             COALESCE(matched_user.name, NULL) AS matched_with
      FROM partner_requests pr
      LEFT JOIN "user" u ON pr.user_id = u.user_id
      LEFT JOIN partner_join_requests jr ON jr.request_id = pr.id AND jr.requester_id = $1
      LEFT JOIN partner_join_requests matched_jr ON matched_jr.request_id = pr.id AND matched_jr.status = 'matched'
      LEFT JOIN "user" matched_user ON matched_user.user_id = matched_jr.requester_id
      WHERE pr.status = 'open' AND pr.user_id != $1
    `;
    const values = [userId];
    let index = 2;

    if (sport) {
      query += ` AND pr.sport ILIKE $${index}`;
      values.push(`%${sport}%`);
      index += 1;
    }
    if (regNumber) {
      query += ` AND u.user_id ILIKE $${index}`;
      values.push(`%${regNumber}%`);
      index += 1;
    }
    if (studentName) {
      query += ` AND u.name ILIKE $${index}`;
      values.push(`%${studentName}%`);
      index += 1;
    }
    if (date) {
      query += ` AND pr.date = $${index}`;
      values.push(date);
      index += 1;
    }
    if (skillLevel) {
      query += ` AND pr.skill_level = $${index}`;
      values.push(skillLevel);
      index += 1;
    }
    if (onlyOpen === 'true') {
      query += ` AND pr.status = 'open'`;
    }

    query += ` ORDER BY pr.created_at DESC`;

    const result = await pool.query(query, values);
    const filtered = result.rows
      .filter((row) => !isRequestExpired(row.date, row.start_time, now))
      .map((row) => buildRequestPayload(row));

    res.json({ requests: filtered, sports: SPORTS });
  } catch (error) {
    console.error('Get available requests error:', error);
    res.status(500).json({ message: 'Failed to fetch available requests', error: error.message });
  }
};

export const searchRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q } = req.query;
    const now = new Date();

    const query = `
      SELECT pr.*, u.name AS student_name, u.user_id AS registration_number,
             CASE WHEN pr.user_id = $1 THEN true ELSE false END AS is_owner,
             CASE WHEN jr.id IS NOT NULL THEN jr.status ELSE NULL END AS join_status
      FROM partner_requests pr
      LEFT JOIN "user" u ON pr.user_id = u.user_id
      LEFT JOIN partner_join_requests jr ON jr.request_id = pr.id AND jr.requester_id = $1
      WHERE pr.status = 'open' AND pr.user_id != $1 AND (
        u.name ILIKE $2 OR u.user_id ILIKE $2 OR pr.sport ILIKE $2 OR pr.notes ILIKE $2
      )
      ORDER BY pr.created_at DESC
    `;
    const result = await pool.query(query, [userId, `%${q || ''}%`]);
    const filtered = result.rows
      .filter((row) => !isRequestExpired(row.date, row.start_time, now))
      .map((row) => buildRequestPayload(row));

    res.json({ requests: filtered });
  } catch (error) {
    console.error('Search requests error:', error);
    res.status(500).json({ message: 'Failed to search requests', error: error.message });
  }
};

export const joinRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;

    const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1', [requestId]);
    const request = requestResult.rows[0];
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.user_id === userId) return res.status(400).json({ message: 'You cannot join your own request' });
    if (isRequestExpired(request.date, request.start_time, new Date())) return res.status(400).json({ message: 'This request is no longer open' });
    if (request.status !== 'open') return res.status(400).json({ message: 'This request is no longer open' });

    const existing = await pool.query('SELECT * FROM partner_join_requests WHERE request_id = $1 AND requester_id = $2', [requestId, userId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'You already requested to join this request' });
    }

    const insertResult = await pool.query(
      `INSERT INTO partner_join_requests (request_id, requester_id, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [requestId, userId]
    );

    await pool.query(
      `INSERT INTO notifications (receiver_id, sender_id, type, title, message, related_request, related_join_request, is_read) VALUES ($1, $2, 'join_request', 'New join request', $3, $4, $5, false)`,
      [request.user_id, userId, `wants to join your ${request.sport.toLowerCase()} game.`, requestId, insertResult.rows[0].id]
    );

    res.json({ message: 'Join request sent', joinRequest: insertResult.rows[0] });
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({ message: 'Failed to join request', error: error.message });
  }
};

export const acceptJoinRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId, joinRequestId } = req.params;

    const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1', [requestId]);
    const request = requestResult.rows[0];
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.user_id !== userId) return res.status(403).json({ message: 'Only the owner can accept' });

    const joinRequestResult = await pool.query('SELECT requester_id FROM partner_join_requests WHERE id = $1 AND request_id = $2', [joinRequestId, requestId]);
    const joinRequest = joinRequestResult.rows[0];
    if (!joinRequest) return res.status(404).json({ message: 'Join request not found' });

    await pool.query('UPDATE partner_join_requests SET status = $1 WHERE id = $2 AND request_id = $3', ['accepted', joinRequestId, requestId]);
    await pool.query("UPDATE partner_requests SET status = 'pending' WHERE id = $1", [requestId]);
    await clearObsoleteNotifications(pool, requestId);

    await pool.query(
      `INSERT INTO notifications (receiver_id, sender_id, type, title, message, related_request, related_join_request, is_read) VALUES ($1, $2, 'request_accepted', 'Request accepted', $3, $4, $5, false)`,
      [joinRequest.requester_id, userId, 'Your request has been accepted.', requestId, joinRequestId]
    );

    res.json({ message: 'Accepted successfully.' });
  } catch (error) {
    console.error('Accept join request error:', error);
    res.status(500).json({ message: 'Failed to accept join request', error: error.message });
  }
};

export const rejectJoinRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId, joinRequestId } = req.params;
    const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1', [requestId]);
    const request = requestResult.rows[0];
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.user_id !== userId) return res.status(403).json({ message: 'Only the owner can reject' });

    const joinRequestResult = await pool.query('SELECT requester_id FROM partner_join_requests WHERE id = $1 AND request_id = $2', [joinRequestId, requestId]);
    const joinRequest = joinRequestResult.rows[0];
    if (!joinRequest) return res.status(404).json({ message: 'Join request not found' });

    await pool.query('UPDATE partner_join_requests SET status = $1 WHERE id = $2 AND request_id = $3', ['rejected', joinRequestId, requestId]);
    await pool.query("UPDATE partner_requests SET status = 'open' WHERE id = $1", [requestId]);
    await clearObsoleteNotifications(pool, requestId);

    await pool.query(
      `INSERT INTO notifications (receiver_id, sender_id, type, title, message, related_request, related_join_request, is_read) VALUES ($1, $2, 'request_rejected', 'Request declined', $3, $4, $5, false)`,
      [joinRequest.requester_id, userId, 'Your request was rejected.', requestId, joinRequestId]
    );

    res.json({ message: 'Rejected successfully.' });
  } catch (error) {
    console.error('Reject join request error:', error);
    res.status(500).json({ message: 'Failed to reject join request', error: error.message });
  }
};

export const confirmMatch = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId, joinRequestId } = req.params;
    const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1', [requestId]);
    const request = requestResult.rows[0];
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const joinRequestResult = await pool.query('SELECT requester_id FROM partner_join_requests WHERE id = $1 AND request_id = $2', [joinRequestId, requestId]);
    const joinRequest = joinRequestResult.rows[0];
    if (!joinRequest) return res.status(404).json({ message: 'Join request not found' });

    await pool.query('UPDATE partner_requests SET status = $1 WHERE id = $2', ['matched', requestId]);
    await pool.query('UPDATE partner_join_requests SET status = $1 WHERE id = $2 AND request_id = $3', ['matched', joinRequestId, requestId]);
    await clearObsoleteNotifications(pool, requestId);
    await ensurePartnerChat(requestId, userId);

    await pool.query(
      `INSERT INTO notifications (receiver_id, sender_id, type, title, message, related_request, related_join_request, is_read) VALUES ($1, $2, 'match_confirmed', 'Match confirmed', $3, $4, $5, false)`,
      [joinRequest.requester_id, userId, 'You have successfully found a partner.', requestId, joinRequestId]
    );
    await pool.query(
      `INSERT INTO notifications (receiver_id, sender_id, type, title, message, related_request, related_join_request, is_read) VALUES ($1, $2, 'match_confirmed', 'Match confirmed', $3, $4, $5, false)`,
      [request.user_id, userId, 'You have successfully found a partner.', requestId, joinRequestId]
    );

    res.json({ message: 'Match confirmed' });
  } catch (error) {
    console.error('Confirm match error:', error);
    res.status(500).json({ message: 'Failed to confirm match', error: error.message });
  }
};

export const cancelMatch = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId, joinRequestId } = req.params;
    const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1', [requestId]);
    const request = requestResult.rows[0];
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const joinRequestResult = await pool.query('SELECT requester_id FROM partner_join_requests WHERE id = $1 AND request_id = $2', [joinRequestId, requestId]);
    const joinRequest = joinRequestResult.rows[0];
    if (!joinRequest) return res.status(404).json({ message: 'Join request not found' });

    await pool.query('UPDATE partner_requests SET status = $1 WHERE id = $2', ['open', requestId]);
    await pool.query('UPDATE partner_join_requests SET status = $1 WHERE id = $2 AND request_id = $3', ['cancelled', joinRequestId, requestId]);

    await pool.query(
      `INSERT INTO notifications (receiver_id, sender_id, type, title, message, related_request, related_join_request, is_read) VALUES ($1, $2, 'match_cancelled', 'Request cancelled', $3, $4, $5, false)`,
      [request.user_id, userId, 'The player cancelled the request.', requestId, joinRequestId]
    );

    res.json({ message: 'Match cancelled' });
  } catch (error) {
    console.error('Cancel match error:', error);
    res.status(500).json({ message: 'Failed to cancel match', error: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1 AND user_id = $2', [requestId, userId]);
    if (requestResult.rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    await clearObsoleteNotifications(pool, requestId);
    await pool.query('DELETE FROM partner_requests WHERE id = $1 AND user_id = $2', [requestId, userId]);
    res.json({ message: 'Request deleted' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Failed to delete request', error: error.message });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const { venue, notes, skillLevel, genderPreference, date, startTime, endTime } = req.body;

    const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1 AND user_id = $2', [requestId, userId]);
    if (requestResult.rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    const updatedResult = await pool.query(
      `UPDATE partner_requests SET venue = COALESCE($1, venue), notes = COALESCE($2, notes), skill_level = COALESCE($3, skill_level), gender_preference = COALESCE($4, gender_preference), date = COALESCE($5, date), start_time = COALESCE($6, start_time), end_time = COALESCE($7, end_time), status = CASE WHEN $8::varchar IS NOT NULL THEN $8 ELSE status END WHERE id = $9 AND user_id = $10 RETURNING *`,
      [venue || null, notes || null, skillLevel || null, genderPreference || null, date || null, startTime || null, endTime || null, null, requestId, userId]
    );

    res.json({ message: 'Request updated', request: updatedResult.rows[0] });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Failed to update request', error: error.message });
  }
};

export const closeRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const requestResult = await pool.query('SELECT * FROM partner_requests WHERE id = $1 AND user_id = $2', [requestId, userId]);
    if (requestResult.rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    await pool.query("UPDATE partner_requests SET status = 'closed' WHERE id = $1 AND user_id = $2", [requestId, userId]);
    await clearObsoleteNotifications(pool, requestId);
    res.json({ message: 'Request closed' });
  } catch (error) {
    console.error('Close request error:', error);
    res.status(500).json({ message: 'Failed to close request', error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT n.*, u.name AS sender_name,
              pr.date AS request_date,
              pr.end_time AS request_end_time
       FROM notifications n
       LEFT JOIN "user" u ON u.user_id = n.sender_id
       LEFT JOIN partner_requests pr ON pr.id = n.related_request
       WHERE n.receiver_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    // Filter out notifications for expired sessions
    const now = new Date();
    const filtered = result.rows.filter((n) => {
      // Keep notifications that have no related request (system notifications)
      if (!n.request_date || !n.request_end_time) return true;

      // Hide match_confirmed and chat notifications after session ends
      if (['match_confirmed', 'chat'].includes(n.type)) {
        const dateOnly = String(n.request_date).substring(0, 10);
        const end = new Date(`${dateOnly}T${n.request_end_time}`);
        return now < end;
      }

      return true;
    });

    res.json({ notifications: filtered.map(buildNotificationPayload) });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;
    await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 AND receiver_id = $2', [notificationId, userId]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;
    await pool.query('DELETE FROM notifications WHERE id = $1 AND receiver_id = $2', [notificationId, userId]);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT pr.*, u.name AS student_name, u.user_id AS registration_number,
              CASE WHEN pr.user_id = $1 THEN true ELSE false END AS is_owner,
              jr.status AS join_status,
              matched_user.name AS matched_with,
              matched_user.name AS partner_name,
              matched_user.user_id AS partner_registration_number
       FROM partner_requests pr
       LEFT JOIN "user" u ON pr.user_id = u.user_id
       LEFT JOIN partner_join_requests jr ON jr.request_id = pr.id AND jr.requester_id = $1
       LEFT JOIN partner_join_requests matched_jr ON matched_jr.request_id = pr.id AND matched_jr.status = 'matched'
       LEFT JOIN "user" matched_user ON matched_user.user_id = matched_jr.requester_id
       WHERE pr.user_id = $1
          OR (jr.requester_id = $1 AND jr.status = 'matched')
       ORDER BY pr.created_at DESC`,
      [userId]
    );

    res.json({ requests: result.rows.map((row) => buildRequestPayload(row)) });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Failed to fetch my requests', error: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const { chat } = await ensurePartnerChat(requestId, userId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const result = await pool.query(
      `SELECT pm.*, u.name AS sender_name FROM partner_messages pm LEFT JOIN "user" u ON u.user_id = pm.sender_id WHERE pm.chat_id = $1 ORDER BY pm.created_at ASC`,
      [chat.id]
    );

    res.json({ chat, messages: result.rows });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Failed to fetch chat messages', error: error.message });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const { chat } = await ensurePartnerChat(requestId, userId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const result = await pool.query(
      'INSERT INTO partner_messages (chat_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *',
      [chat.id, userId, String(message).trim()]
    );

    // Notify the other person in the chat
    const receiverId = userId === chat.user1_id ? chat.user2_id : chat.user1_id;
    await pool.query(
      `INSERT INTO notifications (receiver_id, sender_id, type, title, message, related_request, is_read)
       VALUES ($1, $2, 'chat', 'New Message', $3, $4, false)`,
      [receiverId, userId, String(message).trim(), requestId]
    );

    res.status(201).json({ message: 'Message sent', messageRecord: result.rows[0] });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ message: 'Failed to send chat message', error: error.message });
  }
};

export const getPartnerFinderMeta = async (req, res) => {
  try {
    res.json({ sports: SPORTS });
  } catch (error) {
    console.error('Get partner finder meta error:', error);
    res.status(500).json({ message: 'Failed to fetch partner finder metadata', error: error.message });
  }
};
