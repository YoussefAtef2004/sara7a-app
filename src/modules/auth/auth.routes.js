import express from 'express';
const router = express.Router();
import AuthController from './auth.controller.js';
import validate from '../../middleware/validation.js';
import { authenticate } from '../../middleware/authentication.js';
import { authLimiter, passwordResetLimiter } from '../../middleware/rateLimiter.js';
import {
  signupSchema,
  confirmEmailSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from './auth.validation.js';

 
router.post('/signup', authLimiter, validate(signupSchema), AuthController.signup);

 
router.post('/confirm-email', validate(confirmEmailSchema), AuthController.confirmEmail);

 
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);


router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);

 
router.post('/logout', authenticate, AuthController.logout);

 
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);

 
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

 
router.post('/google', validate({ body: googleLoginSchema.body }), AuthController.googleLogin);

export default router;
