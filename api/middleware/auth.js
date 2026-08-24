const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

/**
 * Auth middleware — verifies Bearer JWT token.
 * Attaches `req.user` with { id, email, name } on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalid — user not found.',
        data: null,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired. Please login again.',
        data: null,
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token.',
      data: null,
    });
  }
};

module.exports = { authenticate };
