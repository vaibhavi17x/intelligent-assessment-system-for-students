
import { Router, Request, Response, NextFunction } from 'express';

import { prisma } from '../lib/database';
import { authService } from '../services/auth/authService';
import { AppError, ErrorType } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';
import { logger } from '../lib/logger';
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from '../validation/authValidation';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new student account
 */
router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: RegisterInput = registerSchema.parse(req.body);

      logger.authEvent('Registration attempt', {
        email: body.email,
      });

      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        throw new AppError(
          ErrorType.BUSINESS_RULE_ERROR,
          'Email already registered',
          409
        );
      }

      const hashedPassword = await authService.hashPassword(body.password);

      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          firstName: body.firstName,
          lastName: body.lastName,
          role: 'STUDENT',
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      logger.authEvent('User registered successfully', {
        userId: user.id,
        email: user.email,
      });

      res.status(201).json({
        success: true,
        data: {
          user,
          message: 'Registration successful. Please login to continue.',
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'PrismaClientKnownRequestError' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        next(
          new AppError(
            ErrorType.BUSINESS_RULE_ERROR,
            'Email already registered',
            409
          )
        );
        return;
      }
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT
 */
router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: LoginInput = loginSchema.parse(req.body);

      logger.authEvent('Login attempt', {
        email: body.email,
      });

      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user || !user.isActive) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'Invalid credentials',
          401
        );
      }

      const isPasswordValid = await authService.comparePassword(
        body.password,
        user.password
      );

      if (!isPasswordValid) {
        logger.authEvent('Login failed - invalid password', {
          email: body.email,
        });

        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'Invalid credentials',
          401
        );
      }

      const token = authService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.authEvent('User logged in successfully', {
        userId: user.id,
        email: user.email,
      });

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Requires a valid JWT
 */
router.post(
  '/logout',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'Authentication required',
          401
        );
      }

      logger.authEvent('User logged out', {
        userId: req.user.id,
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Logout successful',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/auth/me
 * Return the currently authenticated user
 */
router.get(
  '/me',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'Authentication required',
          401
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
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

      if (!user.isActive) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'Account is inactive',
          401
        );
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
