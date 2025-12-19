import mongoose from 'mongoose';
import CryptoService from '../../services/crypto.service.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must not exceed 20 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  profileImage: {
    url: String,
    publicId: String,
  },
  coverImage: {
    url: String,
    publicId: String,
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  emailConfirmationOTP: String,
  otpExpiry: Date,
  passwordResetOTP: String,
  passwordResetExpiry: Date,
  accountStatus: {
    type: String,
    enum: ['active', 'frozen'],
    default: 'active',
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  socialLogins: [{
    provider: {
      type: String,
      enum: ['google', 'facebook'],
    },
    providerId: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    this.password = await CryptoService.hash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await CryptoService.compareHash(candidatePassword, this.password);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

userSchema.methods.generateOTP = function(type = 'email') {
  const otp = CryptoService.generateOTP(6);
  const expiryMinutes = type === 'email' ? 10 : 15; // 10 min for email, 15 min for password reset
  
  if (type === 'email') {
    this.emailConfirmationOTP = otp;
    this.otpExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  } else if (type === 'password') {
    this.passwordResetOTP = otp;
    this.passwordResetExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  }
  
  return otp;
};

userSchema.methods.verifyOTP = function(otp, type = 'email') {
  if (type === 'email') {
    if (!this.emailConfirmationOTP || !this.otpExpiry) {
      return { valid: false, message: 'No OTP found' };
    }
    
    if (Date.now() > this.otpExpiry) {
      return { valid: false, message: 'OTP has expired' };
    }
    
    if (this.emailConfirmationOTP !== otp) {
      return { valid: false, message: 'Invalid OTP' };
    }
    
    return { valid: true, message: 'OTP verified successfully' };
  } else if (type === 'password') {
    if (!this.passwordResetOTP || !this.passwordResetExpiry) {
      return { valid: false, message: 'No OTP found' };
    }
    
    if (Date.now() > this.passwordResetExpiry) {
      return { valid: false, message: 'OTP has expired' };
    }
    
    if (this.passwordResetOTP !== otp) {
      return { valid: false, message: 'Invalid OTP' };
    }
    
    return { valid: true, message: 'OTP verified successfully' };
  }
  
  return { valid: false, message: 'Invalid OTP type' };
};

userSchema.methods.clearOTP = function(type = 'email') {
  if (type === 'email') {
    this.emailConfirmationOTP = undefined;
    this.otpExpiry = undefined;
  } else if (type === 'password') {
    this.passwordResetOTP = undefined;
    this.passwordResetExpiry = undefined;
  }
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailConfirmationOTP;
  delete user.otpExpiry;
  delete user.passwordResetOTP;
  delete user.passwordResetExpiry;
  delete user.refreshTokens;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
