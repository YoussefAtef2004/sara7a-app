import express from 'express';
const router = express.Router();
import MessageController from './message.controller.js';
import validate from '../../middleware/validation.js';
import { authenticate } from '../../middleware/authentication.js';
import { messageLimiter } from '../../middleware/rateLimiter.js';
import {
  sendMessageSchema,
  getMessagesSchema,
  getMessageByIdSchema,
  markAsReadSchema,
} from './message.validation.js';


router.post('/', authenticate, messageLimiter, validate(sendMessageSchema), MessageController.sendMessage);


router.get('/', authenticate, validate(getMessagesSchema), MessageController.getMessages);


router.get('/:messageId', authenticate, validate(getMessageByIdSchema), MessageController.getMessage);


router.patch('/:messageId/read', authenticate, validate(markAsReadSchema), MessageController.markAsRead);

export default router;
