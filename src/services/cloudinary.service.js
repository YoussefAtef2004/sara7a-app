import { cloudinary } from '../config/cloudinary.config.js';
import fs from 'fs';

class CloudinaryService {
  
  static async uploadFile(filePath, folder = 'sara7a', resourceType = 'image') {
    try {
      if (!filePath) {
        throw new Error('File path is required');
      }

      if (!fs.existsSync(filePath)) {
        throw new Error('File does not exist');
      }

      const options = {
        folder: folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      };

      const result = await cloudinary.uploader.upload(filePath, options);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

 
  static async uploadMultipleFiles(filePaths, folder = 'sara7a', resourceType = 'image') {
    try {
      if (!Array.isArray(filePaths) || filePaths.length === 0) {
        throw new Error('File paths array is required');
      }

      const uploadPromises = filePaths.map(filePath =>
        this.uploadFile(filePath, folder, resourceType)
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Multiple files upload failed: ${error.message}`);
    }
  }

  
  static async destroyFile(publicId, resourceType = 'image') {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      return result;
    } catch (error) {
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
  }

  
  static async destroyMultipleFiles(publicIds, resourceType = 'image') {
    try {
      if (!Array.isArray(publicIds) || publicIds.length === 0) {
        throw new Error('Public IDs array is required');
      }

      const deletePromises = publicIds.map(publicId =>
        this.destroyFile(publicId, resourceType)
      );

      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      throw new Error(`Multiple files deletion failed: ${error.message}`);
    }
  }

  
  static async getFileDetails(publicId, resourceType = 'image') {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to get file details: ${error.message}`);
    }
  }

  
  static generateTransformationUrl(publicId, transformations = {}) {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      const url = cloudinary.url(publicId, {
        ...transformations,
        secure: true,
      });

      return url;
    } catch (error) {
      throw new Error(`URL generation failed: ${error.message}`);
    }
  }
}

export default CloudinaryService;
