import Joi from 'joi';


const generalFields = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 20 characters',
      'any.required': 'Username is required',
    }),

  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required',
    }),

  objectIdOptional: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Invalid ID format',
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required',
    }),

  file: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string()
      .valid('image/jpeg', 'image/jpg', 'image/png')
      .required()
      .messages({
        'any.only': 'Only JPEG and PNG images are allowed',
      }),
    size: Joi.number()
      .max(5 * 1024 * 1024) 
      .required()
      .messages({
        'number.max': 'File size must not exceed 5MB',
      }),
    destination: Joi.string(),
    filename: Joi.string(),
    path: Joi.string(),
    buffer: Joi.binary(),
  }),

  // Pagination
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1',
      'number.base': 'Page must be a number',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
      'number.base': 'Limit must be a number',
    }),

  messageContent: Joi.string()
    .min(1)
    .max(1000)
    .trim()
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message must not exceed 1000 characters',
      'any.required': 'Message content is required',
    }),

  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be either user or admin',
    }),

  accountStatus: Joi.string()
    .valid('active', 'frozen')
    .messages({
      'any.only': 'Account status must be either active or frozen',
    }),

  boolean: Joi.boolean(),

  string: Joi.string().trim(),

  stringOptional: Joi.string().trim().allow(null, ''),
};

export default generalFields;
