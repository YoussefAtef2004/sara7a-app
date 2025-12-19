import dotenv from 'dotenv';
dotenv.config();


const validateEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_PRIVATE_KEY_PATH',
    'JWT_PUBLIC_KEY_PATH',
    'SYMMETRIC_ENCRYPTION_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};


const config = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  port: parseInt(process.env.PORT) || 3000,

  database: {
    uri: process.env.MONGODB_URI,
    uriDev: process.env.MONGODB_URI_DEV,
  },

  jwt: {
    privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH,
    publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
    issuer: process.env.JWT_ISSUER || 'sara7a-api',
    audience: process.env.JWT_AUDIENCE || 'sara7a-client',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },

  crypto: {
    symmetricKey: process.env.SYMMETRIC_ENCRYPTION_KEY,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'Sara7a App <noreply@sara7a.com>',
  },

  social: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    },
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  },
};

try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  if (config.isProduction) {
    process.exit(1);
  }
}

export default config;
