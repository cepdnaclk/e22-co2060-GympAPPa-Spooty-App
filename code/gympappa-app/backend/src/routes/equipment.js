import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  getAllEquipment,
  getPendingRequests,
  requestEquipment,
  cancelRequest,
  updateEquipmentQuantity,
  getStudentHistory,
  initiateReturn,
  approveReturn,
  acceptRequest,
  declineRequest,
} from '../controllers/equipmentController.js';

const router = express.Router();

router.get('/', authenticateToken, getAllEquipment);
router.get('/history/:studentId', authenticateToken, getStudentHistory);
router.get('/requests', authenticateToken, authorizeRole(['admin', 'counter-staff']), getPendingRequests);
router.post('/request', authenticateToken, authorizeRole(['student']), requestEquipment);
router.delete('/request/:requestId', authenticateToken, cancelRequest);
router.patch('/request/:requestId', authenticateToken, initiateReturn);
router.patch('/request/:requestId/accept', authenticateToken, authorizeRole(['admin', 'counter-staff']), acceptRequest);
router.patch('/request/:requestId/decline', authenticateToken, authorizeRole(['admin', 'counter-staff']), declineRequest);
router.patch('/request/:requestId/return-approved', authenticateToken, authorizeRole(['admin', 'counter-staff']), approveReturn);
router.put('/:equipmentId/quantity', authenticateToken, authorizeRole(['admin', 'counter-staff']), updateEquipmentQuantity);

export default router;
