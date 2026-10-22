import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType } from '../middleware/errorHandler';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { notFoundHandler } from '../middleware/notFoundHandler';
import { requireRole, requireAllRoles } from '../middleware/authorization';
import { logger } from '../lib/logger';
import jwt from 'jsonwebtoken';

jest.mock('../lib/logger');
jest.mock('../config', () => ({
  config: {
    jwtSecret: 'test-secret-key',
  },
}));

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', () => {
      const validToken = jwt.sign(
        { id: 'user-1', email: 'test@example.com', role: 'STUDENT' },
        'test-secret-key'
      );
      mockRequest.headers = { authorization: `Bearer ${validToken}` };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        role: 'STUDENT',
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject request without authorization header', () => {
      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Authentication required',
          statusCode: 401,
        })
      );
    });

    it('should reject request with malformed authorization header', () => {
      mockRequest.headers = { authorization: 'InvalidFormat' };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Authentication required',
          statusCode: 401,
        })
      );
    });

    it('should reject request with invalid token', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Invalid or expired token',
          statusCode: 401,
        })
      );
    });

    it('should reject request with expired token', () => {
      const expiredToken = jwt.sign(
        { id: 'user-1', email: 'test@example.com', role: 'STUDENT' },
        'test-secret-key',
        { expiresIn: '-1s' }
      );
      mockRequest.headers = { authorization: `Bearer ${expiredToken}` };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Invalid or expired token',
          statusCode: 401,
        })
      );
    });
  });

  describe('optionalAuth', () => {
    it('should authenticate user with valid token', () => {
      const validToken = jwt.sign(
        { id: 'user-1', email: 'test@example.com', role: 'STUDENT' },
        'test-secret-key'
      );
      mockRequest.headers = { authorization: `Bearer ${validToken}` };

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        role: 'STUDENT',
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without authentication when no token provided', () => {
      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without authentication when token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});

describe('Authorization Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: { id: 'user-1', email: 'test@example.com', role: 'STUDENT' },
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should allow access when user has required role', () => {
      const middleware = requireRole('STUDENT');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access when user has one of multiple allowed roles', () => {
      const middleware = requireRole('STUDENT', 'TEACHER');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny access when user lacks required role', () => {
      const middleware = requireRole('TEACHER');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ErrorType.AUTHORIZATION_ERROR,
          message: 'Insufficient permissions',
          statusCode: 403,
        })
      );
    });

    it('should deny access when user has no role', () => {
      mockRequest.user = undefined;
      const middleware = requireRole('STUDENT');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Authentication required',
          statusCode: 401,
        })
      );
    });
  });

  describe('requireAllRoles', () => {
    it('should allow access when user has all required roles (single role)', () => {
      const middleware = requireAllRoles('STUDENT');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny access when user does not have all required roles', () => {
      const middleware = requireAllRoles('STUDENT', 'TEACHER');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ErrorType.AUTHORIZATION_ERROR,
          message: 'Insufficient permissions',
          statusCode: 403,
        })
      );
    });

    it('should deny access when user has no role', () => {
      mockRequest.user = undefined;
      const middleware = requireAllRoles('STUDENT');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Authentication required',
          statusCode: 401,
        })
      );
    });
  });
});

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      method: 'GET',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('notFoundHandler', () => {
    it('should throw not found error', () => {
      expect(() => {
        notFoundHandler(mockRequest as Request, mockResponse as Response);
      }).toThrow(
        expect.objectContaining({
          type: ErrorType.NOT_FOUND_ERROR,
          message: 'Route GET /test not found',
          statusCode: 404,
        })
      );
    });
  });
});
