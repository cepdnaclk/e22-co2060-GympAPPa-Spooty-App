import express from 'express';
const router = express.Router();

import {
    getStudentRequests,
    getAllRequests,
    getAllEquipment,
    acceptRequest,
    declineRequest,
    processReturn,
    getPendingReturns,
    getStudentHistory
} from '../controllers/adminController.js';

import { authenticateToken, authorizeRole } from '../middleware/auth.js';

// Get all active requests (pending/issued/pending_return)
router.get('/requests', authenticateToken, getAllRequests);

// Get all pending requests for a student by reg number
// e.g. GET /api/admin/requests/E%2F22%2F402
router.get('/requests/:regNumber', authenticateToken, getStudentRequests);

// Get full equipment list with availability
router.get('/list', authenticateToken, getAllEquipment);

// Accept a request (issue equipment to student)
router.post('/accept/:requestId', authenticateToken, authorizeRole(['admin', 'counter-staff']), acceptRequest);

// Decline a request
router.post('/decline/:requestId', authenticateToken, authorizeRole(['admin', 'counter-staff']), declineRequest);

// Process a return (student brings equipment back)
router.post('/return/:requestId', authenticateToken, processReturn);

// Get items pending return for a student
router.get('/pending-return/:regNumber', authenticateToken, getPendingReturns);

// Get full history for a student
router.get('/history/:regNumber', authenticateToken, getStudentHistory);

export default router;