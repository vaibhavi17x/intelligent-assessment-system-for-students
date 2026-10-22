import { Router, Response, NextFunction } from 'express';

import { prisma } from '../lib/database';
import { authService } from '../services/auth/authService';
import { AppError, ErrorType } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';
import { logger } from '../lib/logger';
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from '../validation/authValidation';

const router = Router();

router.use(authenticate);

router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(
        ErrorType.AUTHENTICATION_ERROR,
        'Authentication required',
        401
      );
    }

    const body: UpdateProfileInput = updateProfileSchema.parse(req.body);

    logger.authEvent('Profile update attempt', { userId: req.user.id });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.authEvent('Profile updated successfully', { userId: req.user.id });

    res.json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(
        ErrorType.AUTHENTICATION_ERROR,
        'Authentication required',
        401
      );
    }

    const body: ChangePasswordInput = changePasswordSchema.parse(req.body);

    logger.authEvent('Password change attempt', { userId: req.user.id });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new AppError(
        ErrorType.NOT_FOUND_ERROR,
        'User not found',
        404
      );
    }

    const isCurrentPasswordValid = await authService.comparePassword(
      body.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      logger.authEvent('Password change failed - invalid current password', {
        userId: req.user.id,
      });
      throw new AppError(
        ErrorType.AUTHENTICATION_ERROR,
        'Current password is incorrect',
        401
      );
    }

    const hashedNewPassword = await authService.hashPassword(body.newPassword);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });

    logger.authEvent('Password changed successfully', { userId: req.user.id });

    res.json({
      success: true,
      data: {
        message: 'Password changed successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(
        ErrorType.AUTHENTICATION_ERROR,
        'Authentication required',
        401
      );
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(
        ErrorType.NOT_FOUND_ERROR,
        'User not found',
        404
      );
    }

    const isOwner = req.user.id === user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isTeacherViewingStudent =
      req.user.role === 'TEACHER' && user.role === 'STUDENT';

    if (!isOwner && !isAdmin && !isTeacherViewingStudent) {
      throw new AppError(
        ErrorType.AUTHORIZATION_ERROR,
        'Insufficient permissions',
        403
      );
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
