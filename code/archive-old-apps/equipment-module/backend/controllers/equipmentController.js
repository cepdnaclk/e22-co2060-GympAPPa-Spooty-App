// ============================================================
// equipmentController.js — Business Logic
//   - sport_equipment  → equipment types with quantities
//   - requested_equipment → student requests
//   - sports → sport categories
// ============================================================

const pool = require('../db');


// ─────────────────────────────────────────────
// 1. GET STUDENT REQUESTS BY REGISTRATION NUMBER
//    Staff types reg number (e.g. E/22/402)
//    Returns all PENDING requests from that student
//    URL: GET /api/equipment/requests/:regNumber
// ─────────────────────────────────────────────
const getStudentRequests = async (req, res) => {
    try {
        const { regNumber } = req.params;

        // First check if this student has ANY requests at all
        // This also confirms they are registered in the system
        const checkStudent = await pool.query(
            `SELECT DISTINCT student_id 
             FROM requested_equipment 
             WHERE UPPER(student_id) = UPPER($1)`,
            [regNumber]
        );

        if (checkStudent.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No student found with registration number: ${regNumber}. Either the student is not registered in GympAPPa or has no requests.`
            });
        }

        // Get all PENDING requests for this student
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
             WHERE UPPER(re.student_id) = UPPER($1)
               AND re.status = 'issued'
             ORDER BY re.requested_at DESC`,
            [regNumber]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Student ${regNumber} has no pending equipment requests.`
            });
        }

        res.json({
            success: true,
            student_id: regNumber,
            requests: result.rows
        });

    } catch (error) {
        console.error('Error fetching student requests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ─────────────────────────────────────────────
// 2. GET ALL EQUIPMENT WITH AVAILABILITY
//    Shows current stock levels
//    URL: GET /api/equipment/list
// ─────────────────────────────────────────────
const getAllEquipment = async (req, res) => {
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
//    Staff accepts a pending request
//    Changes status from 'issued' to 'pending_return'
//    URL: POST /api/equipment/accept/:requestId
// ─────────────────────────────────────────────
const acceptRequest = async (req, res) => {
    const client = await pool.connect();

    try {
        const { requestId } = req.params;

        await client.query('BEGIN');

        // Step A: Get the request details
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

        // Check if already processed
        if (request.status !== 'issued') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `This request is already ${request.status}.`
            });
        }

        // Check if enough stock is available
        if (request.remaining_quantity < request.quantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `Not enough stock. Only ${request.remaining_quantity} ${request.display_name}(s) available. Student requested ${request.quantity}.`
            });
        }

        // Step B: Update request status to 'pending_return'
        // (means: equipment has been physically handed to student)
        await client.query(
            `UPDATE requested_equipment 
             SET status = 'pending_return'
             WHERE id = $1`,
            [requestId]
        );

        // Step C: Reduce remaining quantity in sport_equipment
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
//    Staff declines a pending request
//    Changes status from 'issued' to 'returned' (cancelled)
//    URL: POST /api/equipment/decline/:requestId
// ─────────────────────────────────────────────
const declineRequest = async (req, res) => {
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

        if (request.status !== 'issued') {
            return res.status(400).json({
                success: false,
                message: `This request is already ${request.status}.`
            });
        }

        // Mark as returned (cancelled — equipment never left)
        await pool.query(
            `UPDATE requested_equipment 
             SET status = 'returned'
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
//    Student returns the equipment
//    Changes status from 'pending_return' to 'returned'
//    URL: POST /api/equipment/return/:requestId
// ─────────────────────────────────────────────
const processReturn = async (req, res) => {
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

        if (request.status !== 'pending_return') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: request.status === 'returned'
                    ? 'This equipment has already been returned.'
                    : 'This equipment has not been issued yet.'
            });
        }

        // Mark as returned
        await client.query(
            `UPDATE requested_equipment 
             SET status = 'returned'
             WHERE id = $1`,
            [requestId]
        );

        // Restore quantity back to sport_equipment
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
//    Shows items with status 'pending_return'
//    URL: GET /api/equipment/pending-return/:regNumber
// ─────────────────────────────────────────────
const getPendingReturns = async (req, res) => {
    try {
        const { regNumber } = req.params;

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
             WHERE UPPER(re.student_id) = UPPER($1)
               AND re.status = 'pending_return'
             ORDER BY re.requested_at DESC`,
            [regNumber]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No items pending return for student: ${regNumber}`
            });
        }

        res.json({
            success: true,
            student_id: regNumber,
            items: result.rows
        });

    } catch (error) {
        console.error('Error fetching pending returns:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ─────────────────────────────────────────────
// 7. GET FULL HISTORY FOR A STUDENT
//    URL: GET /api/equipment/history/:regNumber
// ─────────────────────────────────────────────
const getStudentHistory = async (req, res) => {
    try {
        const { regNumber } = req.params;

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
             WHERE UPPER(re.student_id) = UPPER($1)
             ORDER BY re.requested_at DESC`,
            [regNumber]
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


module.exports = {
    getStudentRequests,
    getAllEquipment,
    acceptRequest,
    declineRequest,
    processReturn,
    getPendingReturns,
    getStudentHistory
};