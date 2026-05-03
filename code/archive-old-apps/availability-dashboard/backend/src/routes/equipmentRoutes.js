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

const router = express.Router();

// GET  /api/equipment                              — fetch all equipment grouped by sport
router.get('/', getAllEquipment);

// GET  /api/equipment/history/:studentId          — fetch student request history
router.get('/history/:studentId', getStudentHistory);

// POST /api/equipment/request                     — student requests equipment with pickup time
router.post('/request', requestEquipment);

// DELETE /api/equipment/request/:requestId        — cancel a pending/issued request
router.delete('/request/:requestId', cancelRequest);

// PATCH /api/equipment/request/:requestId         — mark equipment as pending return
router.patch('/request/:requestId', initiateReturn);

// PATCH /api/equipment/request/:requestId/return-approved  — approve return and restore quantity
router.patch('/request/:requestId/return-approved', approveReturn);

// PUT  /api/equipment/:equipmentId/quantity  — admin updates quantity
router.put('/:equipmentId/quantity', updateEquipmentQuantity);

export default router;