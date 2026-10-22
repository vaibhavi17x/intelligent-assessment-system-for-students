import { Response, NextFunction } from 'express';
import { AppError, ErrorType } from './errorHandler';
import { AuthRequest } from './auth';
import { logger } from '../lib/logger';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'Authentication required',
          401
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.authEvent('Authorization failed - insufficient permissions', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
        });

        throw new AppError(
          ErrorType.AUTHORIZATION_ERROR,
          'Insufficient permissions',
          403
        );
      }

      logger.authEvent('Authorization successful', {
        userId: req.user.id,
        userRole: req.user.role,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAnyRole = (...allowedRoles: string[]) => {
  return requireRole(...allowedRoles);
};

export const requireAllRoles = (...requiredRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'Authentication required',
          401
        );
      }

      const hasAllRoles = requiredRoles.every((role) => req.user!.role === role);

      if (!hasAllRoles) {
        logger.authEvent('Authorization failed - missing required roles', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles,
        });

        throw new AppError(
          ErrorType.AUTHORIZATION_ERROR,
          'Insufficient permissions',
          403
        );
      }

      logger.authEvent('Authorization successful', {
        userId: req.user.id,
        userRole: req.user.role,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireStudent = requireRole('STUDENT');
export const requireTeacher = requireRole('TEACHER');
export const requireAdmin = requireRole('ADMIN');
export const requireTeacherOrAdmin = requireRole('TEACHER', 'ADMIN');
