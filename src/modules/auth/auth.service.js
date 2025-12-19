import User from '../user/user.model.js';
import TokenService from '../../services/token.service.js';
import { EmailService, emailEmitter } from '../../services/email.service.js';
import { ConflictError, AuthenticationError, ValidationError } from '../../utils/errorClasses.js';
import { verifyGoogleToken } from '../../config/socialLogin.config.js';

class AuthService {
 
  static async createUser(userData) {
    const { username, email, password } = userData;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email already registered');
      }
      if (existingUser.username === username) {
        throw new ConflictError('Username already taken');
      }
    }

    const user = new User({
      username,
      email,
      password, 
    });

    const otp = user.generateOTP('email');
    await user.save();

     emailEmitter.emit('user:registered', user, otp);

     return user.toJSON();
  }

  
  static async confirmEmail(email, otp) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.isEmailConfirmed) {
      throw new ValidationError('Email already confirmed');
    }

     const verification = user.verifyOTP(otp, 'email');
    if (!verification.valid) {
      throw new ValidationError(verification.message);
    }

     user.isEmailConfirmed = true;
    user.clearOTP('email');
    await user.save();

    return { message: 'Email confirmed successfully' };
  }

 
  static async login(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isEmailConfirmed) {
      throw new AuthenticationError('Please confirm your email before logging in');
    }

    if (user.accountStatus === 'frozen') {
      throw new AuthenticationError('Account is frozen. Please restore your account');
    }

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
    });
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }


  static async refreshToken(refreshToken) {
    let decoded;
    try {
      decoded = TokenService.verifyToken(refreshToken, 'refresh');
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const isRevoked = await TokenService.isTokenRevoked(refreshToken);
    if (isRevoked) {
      throw new AuthenticationError('Refresh token has been revoked');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = TokenService.generateAccessToken(payload);

    return {
      accessToken: newAccessToken,
    };
  }


  static async logout(userId, accessToken, refreshToken) {
    await TokenService.revokeToken(accessToken, userId);

    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    }

    return { message: 'Logged out successfully' };
  }

 
  static async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user) {
      return { message: 'If the email exists, a password reset OTP has been sent' };
    }

    const otp = user.generateOTP('password');
    await user.save();

    emailEmitter.emit('password:reset-requested', user, otp);

    return { message: 'If the email exists, a password reset OTP has been sent' };
  }

  static async resetPassword(email, otp, newPassword) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AuthenticationError('Invalid email or OTP');
    }

    const verification = user.verifyOTP(otp, 'password');
    if (!verification.valid) {
      throw new ValidationError(verification.message);
    }

    user.password = newPassword;
    user.clearOTP('password');
    
    user.refreshTokens = [];
    
    await user.save();

    return { message: 'Password reset successfully' };
  }

  
  static async googleLogin(idToken) {
    let googleUser;
    try {
      googleUser = await verifyGoogleToken(idToken);
    } catch (error) {
      throw new AuthenticationError('Invalid Google token');
    }

    const { email, name, picture, sub: googleId } = googleUser;

    let user = await User.findOne({ email });

    if (user) {
      const googleLinked = user.socialLogins.some(
        login => login.provider === 'google' && login.providerId === googleId
      );

      if (!googleLinked) {
        user.socialLogins.push({
          provider: 'google',
          providerId: googleId,
        });
      }

      if (!user.profileImage.url && picture) {
        user.profileImage = {
          url: picture,
          publicId: null,
        };
      }
    } else {
      const username = email.split('@')[0].toLowerCase();
      
      const randomPassword = Math.random().toString(36).slice(-12) + 'A1!';
      
      user = new User({
        username,
        email,
        password: randomPassword,
        isEmailConfirmed: true, 
        profileImage: {
          url: picture || null,
          publicId: null,
        },
        socialLogins: [{
          provider: 'google',
          providerId: googleId,
        }],
      });
    }

    await user.save();

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
    });
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }
}

export default AuthService;
