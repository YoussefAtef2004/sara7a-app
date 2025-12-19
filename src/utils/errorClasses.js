
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}


class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 400);
    this.details = details;
  }
}


class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}


class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}


class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}


class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}


class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};
