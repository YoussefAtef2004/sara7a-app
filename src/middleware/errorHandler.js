import { AppError } from '../utils/errorClasses.js';


const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  console.error('Error:', {
    message: err.message,
    statusCode: error.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    const message = 'Validation failed';
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    error.statusCode = 400;
    error.message = message;
    error.details = details;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error.statusCode = 409;
    error.message = message;
  }

  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
    error.message = message;
  }

  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token has expired';
  }

  if (err.isJoi) {
    error.statusCode = 400;
    error.message = 'Validation failed';
    error.details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
  }

  if (err.name === 'MulterError') {
    error.statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'File size exceeds limit';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error.message = 'Too many files';
    } else {
      error.message = err.message;
    }
  }

  const errorResponse = {
    success: false,
    message: error.message || 'Internal server error',
    error: {
      statusCode: error.statusCode,
    },
    timestamp: new Date().toISOString(),
  };

  if (error.details) {
    errorResponse.error.details = error.details;
  }

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(error.statusCode).json(errorResponse);
};


const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

export { errorHandler, notFoundHandler };
