/**
 * Utility: wrap async route handlers to catch errors
 * and forward them to Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standard success response shape
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Standard error response shape
 */
const errorResponse = (res, message = 'Error', statusCode = 400, data = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    data,
  });
};

module.exports = { asyncHandler, successResponse, errorResponse };
