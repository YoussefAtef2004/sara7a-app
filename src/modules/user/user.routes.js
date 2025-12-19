import express from 'express';
const router = express.Router();
import UserController from './user.controller.js';
import validate from '../../middleware/validation.js';
import { authenticate } from '../../middleware/authentication.js';
import { upload, validateUploadedFile } from '../../middleware/upload.js';
import { uploadLimiter } from '../../middleware/rateLimiter.js';
import { updateProfileSchema, uploadImageSchema } from './user.validation.js';


router.get('/profile', authenticate, UserController.getProfile);


router.patch('/profile', authenticate, validate(updateProfileSchema), UserController.updateProfile);


router.post(
  '/profile-image',
  authenticate,
  uploadLimiter,
  upload.single('profileImage'),
  validateUploadedFile,
  validate(uploadImageSchema),
  UserController.uploadProfileImage
);


router.post(
  '/cover-image',
  authenticate,
  uploadLimiter,
  upload.single('coverImage'),
  validateUploadedFile,
  validate(uploadImageSchema),
  UserController.uploadCoverImage
);


router.post('/freeze-account', authenticate, UserController.freezeAccount);


router.post('/restore-account', authenticate, UserController.restoreAccount);

export default router;
