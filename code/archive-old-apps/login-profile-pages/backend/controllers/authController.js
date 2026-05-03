import pool from '../utils/database.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { 
  validateUniversityEmail, 
  extractUserIdFromEmail,
  extractFacultyAndBatch 
} from '../utils/userUtils.js';
import { generateToken } from '../utils/jwtUtils.js';
import admin from 'firebase-admin';

const buildUserPayload = (userData) => {
  const { faculty, batch } = extractFacultyAndBatch(userData.user_id);

  return {
    userId: userData.user_id,
    email: userData.university_email,
    name: userData.name,
    role: userData.role,
    profilePicture: userData.profile_picture,
    tel: userData.tel,
    personalEmail: userData.personal_email,
    district: userData.district,
    faculty,
    batch,
    authProvider: userData.auth_provider,
    needsPasswordSetup: !userData.password_set || !userData.password
  };
};

export const registerUser = async (req, res) => {
  try {
    return res.status(410).json({
      message: 'Manual registration is disabled. Please register with Google sign-in.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    // Convert userId to lowercase for case-insensitive login
    const userIdLower = userId.toLowerCase();

    // Find user by ID
    const user = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [userIdLower]);
    
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.rows[0].password_set || !user.rows[0].password) {
      return res.status(403).json({
        message: 'Password has not been set for this account. Please complete Google sign-in onboarding in your profile.'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.rows[0].password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(userIdLower, user.rows[0].role);

    res.json({
      message: 'Login successful',
      token,
      user: buildUserPayload(user.rows[0])
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.rows[0];

    res.json({
      user: buildUserPayload(userData)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, profilePicture, tel, personalEmail, district } = req.body;

    const updatedUser = await pool.query(
      'UPDATE "user" SET name = $1, profile_picture = $2, tel = $3, personal_email = $4, district = $5 WHERE user_id = $6 RETURNING *',
      [name, profilePicture, tel, personalEmail, district, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = updatedUser.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: buildUserPayload(userData)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

export const verifyFirebaseToken = async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    
    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is required' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const email = decodedToken.email;

    if (!email) {
      return res.status(400).json({ message: 'Firebase account does not expose an email address' });
    }

    // Validate email format
    if (!validateUniversityEmail(email)) {
      return res.status(400).json({ message: 'Please use your university email (.pdn.ac.lk)' });
    }

    // Extract user ID from email
    const userId = extractUserIdFromEmail(email);
    const firebaseUid = decodedToken.uid;

    const userExists = await pool.query(
      'SELECT * FROM "user" WHERE user_id = $1 OR university_email = $2',
      [userId, email]
    );

    let userData;

    if (userExists.rows.length === 0) {
      const newUser = await pool.query(
        'INSERT INTO "user" (user_id, university_email, name, password, password_set, auth_provider, firebase_uid, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, email, decodedToken.name || decodedToken.email || userId, null, false, 'firebase', firebaseUid, 'student']
      );
      userData = newUser.rows[0];
    } else {
      const linkedUser = await pool.query(
        `UPDATE "user"
         SET firebase_uid = COALESCE(firebase_uid, $1),
             auth_provider = CASE
               WHEN password_set = true OR password IS NOT NULL THEN 'hybrid'
               WHEN auth_provider IS NULL THEN 'firebase'
               ELSE auth_provider
             END
         WHERE user_id = $2
         RETURNING *`,
        [firebaseUid, userExists.rows[0].user_id]
      );
      userData = linkedUser.rows[0];
    }

    // Generate JWT token
    const token = generateToken(userData.user_id, userData.role);

    res.json({
      message: 'Firebase authentication successful',
      token,
      user: buildUserPayload(userData)
    });
  } catch (error) {
    console.error('Firebase verification error:', error);

    // Firebase Admin SDK errors are auth/* or have auth-prefixed error codes.
    if (error?.code?.startsWith('auth/')) {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }

    // Common PostgreSQL schema drift errors after auth flow changes.
    if (error?.code === '42703' || error?.code === '23502' || error?.code === '23514') {
      return res.status(500).json({
        message: 'Database schema is out of date for Firebase onboarding. Please run latest database migration/init.sql.',
        error: error.message
      });
    }

    return res.status(500).json({ message: 'Firebase sign-in failed', error: error.message });
  }
};

export const setUserPassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Password and confirmation are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const userResult = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingUser = userResult.rows[0];

    if (currentPassword && existingUser.password_set && existingUser.password) {
      const currentPasswordValid = await comparePassword(currentPassword, existingUser.password);
      if (!currentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    const hashedPassword = await hashPassword(password);
    const updatedUser = await pool.query(
      `UPDATE "user"
       SET password = $1,
           password_set = true,
           auth_provider = CASE
             WHEN firebase_uid IS NOT NULL THEN 'hybrid'
             ELSE 'password'
           END
       WHERE user_id = $2
       RETURNING *`,
      [hashedPassword, userId]
    );

    res.json({
      message: existingUser.password_set ? 'Password updated successfully' : 'Password set successfully',
      user: buildUserPayload(updatedUser.rows[0])
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};
