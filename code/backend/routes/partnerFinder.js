import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createPartnerRequest,
  getAvailableRequests,
  searchRequests,
  joinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  confirmMatch,
  cancelMatch,
  deleteRequest,
  updateRequest,
  closeRequest,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  getMyRequests,
  getChatMessages,
  sendChatMessage,
  getPartnerFinderMeta,
} from '../controllers/partnerFinderController.js';

const router = express.Router();

router.get('/meta', authenticateToken, getPartnerFinderMeta);
router.post('/requests', authenticateToken, createPartnerRequest);
router.get('/requests/available', authenticateToken, getAvailableRequests);
router.get('/requests/search', authenticateToken, searchRequests);
router.post('/requests/:requestId/join', authenticateToken, joinRequest);
router.post('/requests/:requestId/join-requests/:joinRequestId/accept', authenticateToken, acceptJoinRequest);
router.post('/requests/:requestId/join-requests/:joinRequestId/reject', authenticateToken, rejectJoinRequest);
router.post('/requests/:requestId/join-requests/:joinRequestId/confirm', authenticateToken, confirmMatch);
router.post('/requests/:requestId/join-requests/:joinRequestId/cancel', authenticateToken, cancelMatch);
router.put('/requests/:requestId', authenticateToken, updateRequest);
router.post('/requests/:requestId/close', authenticateToken, closeRequest);
router.delete('/requests/:requestId', authenticateToken, deleteRequest);
router.get('/notifications', authenticateToken, getNotifications);
router.patch('/notifications/:notificationId/read', authenticateToken, markNotificationRead);
router.delete('/notifications/:notificationId', authenticateToken, deleteNotification);
router.get('/requests/me', authenticateToken, getMyRequests);
router.get('/requests/:requestId/chat', authenticateToken, getChatMessages);
router.post('/requests/:requestId/chat', authenticateToken, sendChatMessage);

export default router;
