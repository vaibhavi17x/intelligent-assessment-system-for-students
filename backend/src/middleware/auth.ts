
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, ErrorType } from './errorHandler';
import { logger } from '../lib/logger';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        ErrorType.AUTHENTICATION_ERROR,
        'Authentication required',
        401
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        email: string;
        role: string;
      };

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      logger.authEvent('User authenticated', { userId: decoded.id });
      next();
    } catch (jwtError) {
      logger.authEvent('JWT verification failed', { error: jwtError });
      throw new AppError(
        ErrorType.AUTHENTICATION_ERROR,
        'Invalid or expired token',
        401
      );
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as {
          id: string;
          email: string;
          role: string;
        };

        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };

        logger.authEvent('User authenticated (optional)', {
          userId: decoded.id,
        });
      } catch (jwtError) {
        // Continue without authentication if the optional token is invalid.
        logger.authEvent(
          'Optional auth failed - continuing without auth',
          { error: jwtError }
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
