import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import config from './src/config/env.config.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';
import { configureCloudinary } from './src/config/cloudinary.config.js';

import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/user/user.routes.js';
import messageRoutes from './src/modules/message/message.routes.js';

const app = express();

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  configureCloudinary();
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsOptions = {
  origin: config.frontend.url,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.env,
    },
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
