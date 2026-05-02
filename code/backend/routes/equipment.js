import express from 'express';
import {
  getAllEquipment,
  requestEquipment,
  cancelRequest,
  updateEquipmentQuantity,
  getStudentHistory,
  initiateReturn,
  approveReturn,
} from '../controllers/equipmentController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// GET  /api/equipment                              — fetch all equipment grouped by sport
router.get('/', authenticateToken, getAllEquipment);

// GET  /api/equipment/history/:studentId          — fetch student request history
router.get('/history/:studentId', authenticateToken, getStudentHistory);

// POST /api/equipment/request                     — student requests equipment with pickup time
router.post('/request', authenticateToken, requestEquipment);

// DELETE /api/equipment/request/:requestId        — cancel a pending/issued request
router.delete('/request/:requestId', authenticateToken, cancelRequest);

// PATCH /api/equipment/request/:requestId         — mark equipment as pending return
router.patch('/request/:requestId', authenticateToken, initiateReturn);

// PATCH /api/equipment/request/:requestId/return-approved  — approve return and restore quantity
router.patch('/request/:requestId/return-approved', authenticateToken, authorizeRole(['admin', 'counter-staff']), approveReturn);

// PUT  /api/equipment/:equipmentId/quantity  — admin updates quantity
router.put('/:equipmentId/quantity', authenticateToken, authorizeRole(['admin', 'counter-staff']), updateEquipmentQuantity);

export default router;