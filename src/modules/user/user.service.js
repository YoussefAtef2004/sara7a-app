import User from './user.model.js';
import CloudinaryService from '../../services/cloudinary.service.js';
import { deleteUploadedFile } from '../../middleware/upload.js';
import { ConflictError, NotFoundError } from '../../utils/errorClasses.js';
import TokenService from '../../services/token.service.js';
import { emailEmitter } from '../../services/email.service.js';

class UserService {

  static async getProfile(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.toJSON();
  }

  
  static async updateProfile(userId, updateData) {
    const { username, email } = updateData;

    if (username || email) {
      const query = { _id: { $ne: userId } };
      
      if (username && email) {
        query.$or = [{ username }, { email }];
      } else if (username) {
        query.username = username;
      } else if (email) {
        query.email = email;
      }

      const existingUser = await User.findOne(query);
      
      if (existingUser) {
        if (existingUser.username === username) {
          throw new ConflictError('Username already taken');
        }
        if (existingUser.email === email) {
          throw new ConflictError('Email already registered');
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.toJSON();
  }

 
  static async uploadProfileImage(userId, file) {
    if (!file) {
      throw new Error('No file provided');
    }

    try {
      const result = await CloudinaryService.uploadFile(file.path, 'sara7a/profiles');

      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.profileImage && user.profileImage.publicId) {
        await CloudinaryService.destroyFile(user.profileImage.publicId).catch(err => {
          console.error('Failed to delete old profile image:', err.message);
        });
      }

      user.profileImage = {
        url: result.url,
        publicId: result.publicId,
      };
      await user.save();

      deleteUploadedFile(file.path);

      return user.toJSON();
    } catch (error) {
      deleteUploadedFile(file.path);
      throw error;
    }
  }

  
  static async uploadCoverImage(userId, file) {
    if (!file) {
      throw new Error('No file provided');
    }

    try {
      const result = await CloudinaryService.uploadFile(file.path, 'sara7a/covers');

      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.coverImage && user.coverImage.publicId) {
        await CloudinaryService.destroyFile(user.coverImage.publicId).catch(err => {
          console.error('Failed to delete old cover image:', err.message);
        });
      }

      user.coverImage = {
        url: result.url,
        publicId: result.publicId,
      };
      await user.save();

      deleteUploadedFile(file.path);

      return user.toJSON();
    } catch (error) {
      deleteUploadedFile(file.path);
      throw error;
    }
  }

 
  static async freezeAccount(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.accountStatus === 'frozen') {
      throw new ConflictError('Account is already frozen');
    }

    user.accountStatus = 'frozen';
    
    const refreshTokens = user.refreshTokens.map(rt => rt.token);
    user.refreshTokens = [];
    
    await user.save();

    refreshTokens.forEach(async (token) => {
      try {
        await TokenService.revokeToken(token, userId);
      } catch (error) {
        console.error('Failed to revoke token:', error.message);
      }
    });

    emailEmitter.emit('account:status-changed', user, 'frozen');

    return { message: 'Account frozen successfully' };
  }

  
  static async restoreAccount(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.accountStatus === 'active') {
      throw new ConflictError('Account is already active');
    }

    user.accountStatus = 'active';
    await user.save();

    emailEmitter.emit('account:status-changed', user, 'active');

    return { message: 'Account restored successfully' };
  }
}

export default UserService;
