import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyFirebaseToken,
  setUserPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-firebase', verifyFirebaseToken);

router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.put('/profile/password', authenticateToken, setUserPassword);

export default router;
