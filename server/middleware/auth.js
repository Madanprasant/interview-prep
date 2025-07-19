const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use a fallback JWT secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account deactivated',
        error: 'User account is not active'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'Token verification failed'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        error: 'Please login again'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: 'Internal server error'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'User not authenticated'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required',
      error: 'Insufficient permissions'
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({ 
        message: 'Resource user ID required',
        error: 'Missing user ID parameter'
      });
    }

    // Allow if user owns the resource or is admin
    if (req.user._id.toString() === resourceUserId || req.user.role === 'admin') {
      return next();
    }

    res.status(403).json({ 
      message: 'Access denied',
      error: 'You can only access your own resources'
    });
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without user
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Refresh token middleware
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        message: 'Refresh token required',
        error: 'No refresh token provided'
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'Invalid refresh token',
        error: 'User not found or inactive'
      });
    }

    // Generate new access token
    const newToken = generateToken(user._id);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      message: 'Invalid refresh token',
      error: 'Token verification failed'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnership,
  optionalAuth,
  generateToken,
  refreshToken
}; 