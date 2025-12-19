import Joi from 'joi';
import generalFields from '../../validation/generalFields.js';


const signupSchema = {
  body: Joi.object({
    username: generalFields.username,
    email: generalFields.email,
    password: generalFields.password,
  }),
};


const confirmEmailSchema = {
  body: Joi.object({
    email: generalFields.email,
    otp: generalFields.otp,
  }),
};


const loginSchema = {
  body: Joi.object({
    email: generalFields.email,
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};


const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required',
    }),
  }),
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: generalFields.email,
  }),
};


const resetPasswordSchema = {
  body: Joi.object({
    email: generalFields.email,
    otp: generalFields.otp,
    newPassword: generalFields.password,
  }),
};


const googleLoginSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      'any.required': 'Google ID token is required',
    }),
  }),
};

export {
  signupSchema,
  confirmEmailSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
};
