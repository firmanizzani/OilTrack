const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../middleware/helpers');

/**
 * POST /api/auth/register
 * Register new user, returns JWT token
 */
const register = async (req, res) => {
  // Validate incoming request fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 422);
  }

  const { email, name, password } = req.body;

  // Check if email already in use
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return errorResponse(res, 'Email already registered.', 409);
  }

  // Hash password with bcrypt (salt rounds = 12)
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return successResponse(res, { user, token }, 'Registration successful.', 201);
};

/**
 * POST /api/auth/login
 * Authenticate user, returns JWT token
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 422);
  }

  const { email, password } = req.body;

  // Find user by email (include password for comparison)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return errorResponse(res, 'Invalid email or password.', 401);
  }

  // Compare password with stored hash
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return errorResponse(res, 'Invalid email or password.', 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;
  return successResponse(res, { user: userWithoutPassword, token }, 'Login successful.');
};

/**
 * GET /api/auth/me
 * Return authenticated user profile
 */
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return successResponse(res, { user }, 'Profile retrieved.');
};

module.exports = { register, login, getMe };
