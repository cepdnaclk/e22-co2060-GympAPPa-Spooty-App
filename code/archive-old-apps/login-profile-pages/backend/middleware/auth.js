import { verifyToken } from '../utils/jwtUtils.js';
import pool from '../utils/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    
    // Check if user still exists in database
    const userExists = await pool.query(
      'SELECT user_id, role FROM "user" WHERE user_id = $1',
      [decoded.userId]
    );
    
    if (userExists.rows.length === 0) {
      return res.status(401).json({ message: 'User account no longer exists' });
    }
    
    req.user = {
      userId: decoded.userId,
      role: userExists.rows[0].role // Use current role from database
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};
