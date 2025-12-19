import crypto from 'crypto';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

class CryptoService {
  static ALGORITHM = 'aes-256-cbc';
  static IV_LENGTH = 16;
  static KEY_LENGTH = 32;

  
  static encryptSymmetric(text, key = process.env.SYMMETRIC_ENCRYPTION_KEY) {
    try {
      if (!key) {
        throw new Error('Encryption key is required');
      }

      const keyBuffer = Buffer.from(key.padEnd(this.KEY_LENGTH, '0').slice(0, this.KEY_LENGTH));
      
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      const cipher = crypto.createCipheriv(this.ALGORITHM, keyBuffer, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Symmetric encryption failed: ${error.message}`);
    }
  }

  
  static decryptSymmetric(encryptedData, key = process.env.SYMMETRIC_ENCRYPTION_KEY) {
    try {
      if (!key) {
        throw new Error('Decryption key is required');
      }

      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const keyBuffer = Buffer.from(key.padEnd(this.KEY_LENGTH, '0').slice(0, this.KEY_LENGTH));
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, keyBuffer, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Symmetric decryption failed: ${error.message}`);
    }
  }


  static encryptAsymmetric(text, publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH) {
    try {
      if (!publicKeyPath) {
        throw new Error('Public key path is required');
      }

      const publicKey = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');
      
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(text, 'utf8')
      );
      
      return encrypted.toString('base64');
    } catch (error) {
      throw new Error(`Asymmetric encryption failed: ${error.message}`);
    }
  }

 
  static decryptAsymmetric(encryptedData, privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH) {
    try {
      if (!privateKeyPath) {
        throw new Error('Private key path is required');
      }

      const privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
      
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedData, 'base64')
      );
      
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Asymmetric decryption failed: ${error.message}`);
    }
  }

  
  static async hash(password, saltRounds = 10) {
    try {
      if (!password) {
        throw new Error('Password is required');
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Hashing failed: ${error.message}`);
    }
  }

  
  static async compareHash(password, hashedPassword) {
    try {
      if (!password || !hashedPassword) {
        throw new Error('Password and hashed password are required');
      }

      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(`Hash comparison failed: ${error.message}`);
    }
  }

  
  static generateOTP(length = 6) {
    try {
      const digits = '0123456789';
      let otp = '';
      
      const randomBytes = crypto.randomBytes(length);
      
      for (let i = 0; i < length; i++) {
        otp += digits[randomBytes[i] % digits.length];
      }
      
      return otp;
    } catch (error) {
      throw new Error(`OTP generation failed: ${error.message}`);
    }
  }

  
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

export default CryptoService;
