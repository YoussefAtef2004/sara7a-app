import rateLimit from 'express-rate-limit';


const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: {
      statusCode: 429,
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      error: {
        statusCode: 429,
      },
      timestamp: new Date().toISOString(),
    });
  },
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, 
  skipSuccessfulRequests: true, 
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: {
      statusCode: 429,
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      error: {
        statusCode: 429,
        details: 'For security reasons, authentication attempts are limited. Please wait 15 minutes before trying again.',
      },
      timestamp: new Date().toISOString(),
    });
  },
});


const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later',
    error: {
      statusCode: 429,
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: {
    success: false,
    message: 'Too many messages sent, please slow down',
    error: {
      statusCode: 429,
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    message: 'Too many file uploads, please try again later',
    error: {
      statusCode: 429,
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  messageLimiter,
  uploadLimiter,
};
