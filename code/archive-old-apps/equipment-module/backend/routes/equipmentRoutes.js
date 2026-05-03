// ============================================================
// equipmentRoutes.js — API Routes
// ============================================================

const express    = require('express');
const router     = express.Router();

const {
    getStudentRequests,
    getAllEquipment,
    acceptRequest,
    declineRequest,
    processReturn,
    getPendingReturns,
    getStudentHistory
} = require('../controllers/equipmentController');

// Get all pending requests for a student by reg number
// e.g. GET /api/equipment/requests/E%2F22%2F402
router.get('/requests/:regNumber', getStudentRequests);

// Get full equipment list with availability
router.get('/list', getAllEquipment);

// Accept a request (issue equipment to student)
router.post('/accept/:requestId', acceptRequest);

// Decline a request
router.post('/decline/:requestId', declineRequest);

// Process a return (student brings equipment back)
router.post('/return/:requestId', processReturn);

// Get items pending return for a student
router.get('/pending-return/:regNumber', getPendingReturns);

// Get full history for a student
router.get('/history/:regNumber', getStudentHistory);

module.exports = router;