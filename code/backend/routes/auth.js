import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  verifyFirebaseToken,
  setUserPassword,
  getAvailableRoles,
  createRoleChangeRequest,
  getMyRoleRequests,
  cancelRoleChangeRequest,
  getRoleChangeRequests,
  reviewRoleChangeRequest,
  getAllUsers,
  updateUserRoleByAdmin
} from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-firebase', verifyFirebaseToken);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.put('/profile/password', authenticateToken, setUserPassword);
router.get('/roles', authenticateToken, getAvailableRoles);

router.get('/role-requests/me', authenticateToken, getMyRoleRequests);
router.post('/role-requests', authenticateToken, createRoleChangeRequest);
router.delete('/role-requests/:id', authenticateToken, cancelRoleChangeRequest);

router.get('/role-requests', authenticateToken, authorizeRole(['admin']), getRoleChangeRequests);
router.patch('/role-requests/:id/review', authenticateToken, authorizeRole(['admin']), reviewRoleChangeRequest);

router.get('/users', authenticateToken, authorizeRole(['admin']), getAllUsers);
router.patch('/users/:userId/role', authenticateToken, authorizeRole(['admin']), updateUserRoleByAdmin);

export default router;