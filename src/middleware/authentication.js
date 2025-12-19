import TokenService from '../services/token.service.js';
import User from '../modules/user/user.model.js';
import { AuthenticationError } from '../utils/errorClasses.js';
import asyncHandler from './asyncHandler.js';


const authenticate = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided. Please provide a valid Bearer token');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Invalid token format');
    }

    let decoded;
    try {
      decoded = TokenService.verifyToken(token, 'access');
    } catch (error) {
      throw new AuthenticationError(error.message);
    }

    const isRevoked = await TokenService.isTokenRevoked(token);
    if (isRevoked) {
      throw new AuthenticationError('Token has been revoked. Please login again');
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new AuthenticationError('User not found. Token is invalid');
    }

    if (user.accountStatus === 'frozen') {
      throw new AuthenticationError('Account is frozen. Please restore your account to continue');
    }

    if (!user.isEmailConfirmed) {
      throw new AuthenticationError('Email not confirmed. Please verify your email to continue');
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
});


const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded = TokenService.verifyToken(token, 'access');
          const isRevoked = await TokenService.isTokenRevoked(token);
          
          if (!isRevoked) {
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.accountStatus === 'active' && user.isEmailConfirmed) {
              req.user = user;
              req.token = token;
            }
          }
        } catch (error) {
          console.log('Optional authentication failed:', error.message);
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

export { authenticate, optionalAuthenticate };
