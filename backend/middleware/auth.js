const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('[Auth] Authorization header:', authHeader ? 'Present' : 'Missing');

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('[Auth] No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Auth] Token verified for user:', decoded.userId);

    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log('[Auth] Token verification failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
