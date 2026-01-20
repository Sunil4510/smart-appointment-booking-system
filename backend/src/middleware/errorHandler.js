const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return res.status(400).json({
          error: 'Duplicate entry',
          message: `${error.meta?.target?.join(', ') || 'Field'} already exists`,
          code: error.code
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Not found',
          message: 'Record not found',
          code: error.code
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Foreign key constraint',
          message: 'Referenced record does not exist',
          code: error.code
        });
      default:
        return res.status(500).json({
          error: 'Database error',
          message: 'A database error occurred',
          code: error.code
        });
    }
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication error',
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication error',
      message: 'Token expired'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: error.message
    });
  }

  // Custom application errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      error: error.name || 'Application error',
      message: error.message
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict occurred') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// Async handler wrapper to catch errors in async functions
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};