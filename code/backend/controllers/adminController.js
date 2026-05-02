import pool from '../utils/database.js';

// Helper to normalize registration numbers
// Converts E/22/402 → e22402, Mgt/22/101 → mgt22101
const normalizeRegNumber = (regNumber) => {
    return regNumber.replace(/\//g, '').toLowerCase();
};

// ─────────────────────────────────────────────
// 1. GET STUDENT REQUESTS BY REGISTRATION NUMBER
//    URL: GET /api/admin/requests/:regNumber
// ─────────────────────────────────────────────
export const getStudentRequests = async (req, res) => {
    try {
        const { regNumber } = req.params;
        const normalized = normalizeRegNumber(regNumber);

        const checkStudent = await pool.query(
            `SELECT DISTINCT student_id
             FROM requested_equipment
             WHERE LOWER(REPLACE(student_id, '/', '')) = $1`,
            [normalized]
        );

        if (checkStudent.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No student found with registration number: ${regNumber}. Either the student is not registered in GympAPPa or has no requests.`
            });
        }

        const result = await pool.query(
            `SELECT
                re.id          AS request_id,
                re.student_id,
                re.quantity,
                re.pickup_time,
                re.status,
                re.requested_at,
                se.display_name AS equipment_name,
                se.remaining_quantity,
                se.id          AS sport_equipment_id,
                s.name         AS sport_name
             FROM requested_equipment re
             JOIN sport_equipment se ON re.equipment_id = se.id
             JOIN sports s ON se.sport_id = s.id
             WHERE LOWER(REPLACE(re.student_id, '/', '')) = $1
               AND re.status = 'pending'
             ORDER BY re.requested_at DESC`,
            [normalized]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Student ${regNumber} has no pending equipment requests.`
            });
        }

        res.json({
            success: true,
            student_id: checkStudent.rows[0].student_id,
            requests: result.rows
        });

    } catch (error) {
        console.error('Error fetching student requests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────
// 2. GET ALL EQUIPMENT WITH AVAILABILITY
//    URL: GET /api/admin/list
// ─────────────────────────────────────────────
export const getAllEquipment = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                se.id,
                se.display_name AS equipment_name,
                se.total_quantity,
                se.remaining_quantity,
                (se.total_quantity - se.remaining_quantity) AS issued_count,
                s.name AS sport_name
             FROM sport_equipment se
             JOIN sports s ON se.sport_id = s.id
             ORDER BY s.name, se.display_name`
        );

        res.json({
            success: true,
            equipment: result.rows
        });

    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────
// 3. ACCEPT A REQUEST (Issue Equipment)
//    URL: POST /api/admin/accept/:requestId
// ─────────────────────────────────────────────
export const acceptRequest = async (req, res) => {
    const client = await pool.connect();

    try {
        const { requestId } = req.params;

        await client.query('BEGIN');

        const requestCheck = await client.query(
            `SELECT re.*, se.display_name, se.remaining_quantity, se.id AS sport_equipment_id
             FROM requested_equipment re
             JOIN sport_equipment se ON re.equipment_id = se.id
             WHERE re.id = $1`,
            [requestId]
        );

        if (requestCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const request = requestCheck.rows[0];

        if (request.status !== 'pending') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `This request is already ${request.status}.`
            });
        }

        if (request.remaining_quantity < request.quantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `Not enough stock. Only ${request.remaining_quantity} ${request.display_name}(s) available. Student requested ${request.quantity}.`
            });
        }

        await client.query(
            `UPDATE requested_equipment
             SET status = 'issued'
             WHERE id = $1`,
            [requestId]
        );

        await client.query(
            `UPDATE sport_equipment
             SET remaining_quantity = remaining_quantity - $1
             WHERE id = $2`,
            [request.quantity, request.sport_equipment_id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `✓ ${request.display_name} issued to ${request.student_id} successfully!`
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error accepting request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        client.release();
    }
};

// ─────────────────────────────────────────────
// 4. DECLINE A REQUEST
//    URL: POST /api/admin/decline/:requestId
// ─────────────────────────────────────────────
export const declineRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const requestCheck = await pool.query(
            `SELECT re.*, se.display_name
             FROM requested_equipment re
             JOIN sport_equipment se ON re.equipment_id = se.id
             WHERE re.id = $1`,
            [requestId]
        );

        if (requestCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const request = requestCheck.rows[0];

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This request is already ${request.status}.`
            });
        }

        await pool.query(
            `UPDATE requested_equipment
             SET status = 'cancelled'
             WHERE id = $1`,
            [requestId]
        );

        res.json({
            success: true,
            message: `Request for ${request.display_name} has been declined.`
        });

    } catch (error) {
        console.error('Error declining request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────
// 5. PROCESS RETURN
//    URL: POST /api/admin/return/:requestId
// ─────────────────────────────────────────────
export const processReturn = async (req, res) => {
    const client = await pool.connect();

    try {
        const { requestId } = req.params;

        await client.query('BEGIN');

        const requestCheck = await client.query(
            `SELECT re.*, se.display_name, se.id AS sport_equipment_id
             FROM requested_equipment re
             JOIN sport_equipment se ON re.equipment_id = se.id
             WHERE re.id = $1`,
            [requestId]
        );

        if (requestCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const request = requestCheck.rows[0];

        if (request.status !== 'issued') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: request.status === 'returned'
                    ? 'This equipment has already been returned.'
                    : 'This request is not currently issued.'
            });
        }

        await client.query(
            `UPDATE requested_equipment
             SET status = 'returned'
             WHERE id = $1`,
            [requestId]
        );

        await client.query(
            `UPDATE sport_equipment
             SET remaining_quantity = remaining_quantity + $1
             WHERE id = $2`,
            [request.quantity, request.sport_equipment_id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `✓ ${request.display_name} returned successfully by ${request.student_id}!`
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing return:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        client.release();
    }
};

// ─────────────────────────────────────────────
// 6. GET ITEMS TO RETURN FOR A STUDENT
//    URL: GET /api/admin/pending-return/:regNumber
// ─────────────────────────────────────────────
export const getPendingReturns = async (req, res) => {
    try {
        const { regNumber } = req.params;
        const normalized = normalizeRegNumber(regNumber);

        const result = await pool.query(
            `SELECT
                re.id AS request_id,
                re.student_id,
                re.quantity,
                re.requested_at,
                se.display_name AS equipment_name,
                s.name AS sport_name
             FROM requested_equipment re
             JOIN sport_equipment se ON re.equipment_id = se.id
             JOIN sports s ON se.sport_id = s.id
             WHERE LOWER(REPLACE(re.student_id, '/', '')) = $1
               AND re.status = 'issued'
             ORDER BY re.requested_at DESC`,
            [normalized]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No items pending return for student: ${regNumber}`
            });
        }

        res.json({
            success: true,
            student_id: result.rows[0].student_id,
            items: result.rows
        });

    } catch (error) {
        console.error('Error fetching pending returns:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────
// 7. GET FULL HISTORY FOR A STUDENT
//    URL: GET /api/admin/history/:regNumber
// ─────────────────────────────────────────────
export const getStudentHistory = async (req, res) => {
    try {
        const { regNumber } = req.params;
        const normalized = normalizeRegNumber(regNumber);

        const result = await pool.query(
            `SELECT
                re.id AS request_id,
                re.student_id,
                re.quantity,
                re.pickup_time,
                re.status,
                re.requested_at,
                se.display_name AS equipment_name,
                s.name AS sport_name
             FROM requested_equipment re
             JOIN sport_equipment se ON re.equipment_id = se.id
             JOIN sports s ON se.sport_id = s.id
             WHERE LOWER(REPLACE(re.student_id, '/', '')) = $1
             ORDER BY re.requested_at DESC`,
            [normalized]
        );

        res.json({
            success: true,
            student_id: regNumber,
            history: result.rows
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};