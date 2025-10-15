// middleware/index.js

// Base App Error
class AppError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Specific error classes
class NotFoundError extends AppError {
  constructor(message = 'Not Found', details = null) {
    super(message, 404, details);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation Error', details = null) {
    super(message, 400, details || message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, details);
  }
}

// Logger middleware
function logger(req, res, next) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
}

// Authentication middleware
function authMiddleware(req, res, next) {
  const key = req.headers['x-api-key'] || req.headers['api-key'];
  const API_KEY = process.env.API_KEY || 'supersecretkey123';
  if (!key || key !== API_KEY) {
    return next(new UnauthorizedError('Invalid or missing API key'));
  }
  next();
}

// Validation middleware for product creation/update
function validateProduct(req, res, next) {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string') errors.push('name (string) is required');
  if (!description || typeof description !== 'string') errors.push('description (string) is required');
  if (price === undefined || typeof price !== 'number' || Number.isNaN(price)) errors.push('price (number) is required');
  if (!category || typeof category !== 'string') errors.push('category (string) is required');
  if (inStock === undefined || typeof inStock !== 'boolean') errors.push('inStock (boolean) is required');

  if (errors.length > 0) return next(new ValidationError(errors.join('; ')));
  next();
}

// Async handler wrapper for route handlers
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Global error handling middleware
function errorHandler(err, req, res, next) {
  if (!(err instanceof AppError)) {
    console.error('Unhandled error:', err);
    err = new AppError(err.message || 'Internal Server Error', err.status || 500);
  }

  const payload = { status: err.status, message: err.message };
  if (process.env.NODE_ENV === 'development' && err.stack) payload.stack = err.stack;
  if (err.details) payload.details = err.details;

  res.status(err.status || 500).json(payload);
}

// Export all middleware and error classes
module.exports = {
  logger,
  authMiddleware,
  validateProduct,
  asyncHandler,
  errorHandler,
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
};
