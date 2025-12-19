import Joi from 'joi';
import generalFields from '../../validation/generalFields.js';


const sendMessageSchema = {
  body: Joi.object({
    recipientId: generalFields.objectId,
    content: generalFields.messageContent,
    parentMessageId: generalFields.objectIdOptional,
    isAnonymous: generalFields.boolean.default(true),
  }),
};


const getMessagesSchema = {
  query: Joi.object({
    page: generalFields.page,
    limit: generalFields.limit,
  }),
};


const getMessageByIdSchema = {
  params: Joi.object({
    messageId: generalFields.objectId,
  }),
};


const markAsReadSchema = {
  params: Joi.object({
    messageId: generalFields.objectId,
  }),
};

export {
  sendMessageSchema,
  getMessagesSchema,
  getMessageByIdSchema,
  markAsReadSchema,
};
