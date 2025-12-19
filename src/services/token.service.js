import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

class TokenService {
  static privateKey = null;
  static publicKey = null;

  
  static loadKeys() {
    try {
      if (!this.privateKey) {
        const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.key';
        this.privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
      }
      
      if (!this.publicKey) {
        const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.key';
        this.publicKey = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');
      }
    } catch (error) {
      throw new Error(`Failed to load RSA keys: ${error.message}`);
    }
  }

  
  static generateAccessToken(payload, expiresIn = '15m') {
    try {
      this.loadKeys();

      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'access',
      };

      const options = {
        algorithm: 'RS256',
        expiresIn: expiresIn || process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
        issuer: process.env.JWT_ISSUER || 'sara7a-api',
        audience: process.env.JWT_AUDIENCE || 'sara7a-client',
      };

      const token = jwt.sign(tokenPayload, this.privateKey, options);
      return token;
    } catch (error) {
      throw new Error(`Access token generation failed: ${error.message}`);
    }
  }

  
  static generateRefreshToken(payload, expiresIn = '7d') {
    try {
      this.loadKeys();

      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'refresh',
      };

      const options = {
        algorithm: 'RS256',
        expiresIn: expiresIn || process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
        issuer: process.env.JWT_ISSUER || 'sara7a-api',
        audience: process.env.JWT_AUDIENCE || 'sara7a-client',
      };

      const token = jwt.sign(tokenPayload, this.privateKey, options);
      return token;
    } catch (error) {
      throw new Error(`Refresh token generation failed: ${error.message}`);
    }
  }

  
  static verifyToken(token, type = 'access') {
    try {
      this.loadKeys();

      const options = {
        algorithms: ['RS256'],
        issuer: process.env.JWT_ISSUER || 'sara7a-api',
        audience: process.env.JWT_AUDIENCE || 'sara7a-client',
      };

      const decoded = jwt.verify(token, this.publicKey, options);

      if (decoded.type !== type) {
        throw new Error(`Invalid token type. Expected ${type}, got ${decoded.type}`);
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error(`Token verification failed: ${error.message}`);
      }
    }
  }

  
  static decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      throw new Error(`Token decoding failed: ${error.message}`);
    }
  }

  
  static async revokeToken(token, userId) {
    try {
      const RevokedToken = require('../models/revokedToken.model');
      
      const decoded = this.decodeToken(token);
      const expiresAt = new Date(decoded.payload.exp * 1000);

      const revokedToken = await RevokedToken.create({
        token,
        userId,
        expiresAt,
      });

      return revokedToken;
    } catch (error) {
      throw new Error(`Token revocation failed: ${error.message}`);
    }
  }

  
  static async isTokenRevoked(token) {
    try {
      const RevokedToken = (await import('../models/revokedToken.model.js')).default;
      
      const revokedToken = await RevokedToken.findOne({ token });
      return !!revokedToken;
    } catch (error) {
      throw new Error(`Token revocation check failed: ${error.message}`);
    }
  }
}

export default TokenService;
