
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { config } from '../../config';
import { logger } from '../../lib/logger';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      logger.error('Password hashing failed', { error });
      throw new Error('Failed to hash password');
    }
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Password comparison failed', { error });
      throw new Error('Failed to compare password');
    }
  }

  generateToken(payload: TokenPayload): string {
    try {
      const options: SignOptions = {
        expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
      };

      return jwt.sign(payload, config.jwtSecret, options);
    } catch (error) {
      logger.error('Token generation failed', { error });
      throw new Error('Failed to generate token');
    }
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      logger.authEvent('Token verification failed', { error });
      throw new Error('Invalid or expired token');
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload | null;
    } catch (error) {
      logger.authEvent('Token decode failed', { error });
      return null;
    }
  }
}

export const authService = new AuthService();
