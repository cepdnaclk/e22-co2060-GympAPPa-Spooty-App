import express from 'express';
import {
  getAllCourts,
  updateCourtStatus,
  blockCourt,
  updateCrowdLevel,
  getCrowdLevel,
} from '../controllers/courtController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/courts - fetch all courts with their latest availability status
router.get('/', authenticateToken, authorizeRole(['admin']), getAllCourts);

// PUT /api/courts/:id/status - update court availability or occupancy details
router.put('/:id/status', authenticateToken, authorizeRole(['admin']), updateCourtStatus);

// PUT /api/courts/:id/block - block a court for events or maintenance
router.put('/:id/block', authenticateToken, authorizeRole(['admin']), blockCourt);

// GET /api/crowd - fetch the most recent gym crowd level
router.get('/crowd', authenticateToken, authorizeRole(['admin']), getCrowdLevel);

// PUT /api/crowd - update the gym crowd level
router.put('/crowd', authenticateToken, authorizeRole(['admin']), updateCrowdLevel);

export default router;
