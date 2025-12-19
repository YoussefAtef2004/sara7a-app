import Joi from 'joi';
import generalFields from '../../validation/generalFields.js';


const updateProfileSchema = {
  body: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .lowercase()
      .trim()
      .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 20 characters',
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
      }),
  }).min(1), 
};


const uploadImageSchema = {
  file: generalFields.file,
};

export {
  updateProfileSchema,
  uploadImageSchema,
};
