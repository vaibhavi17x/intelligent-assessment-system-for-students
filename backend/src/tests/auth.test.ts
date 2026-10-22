import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import userRoutes from '../routes/userRoutes';
import { authService } from '../services/auth/authService';
import { errorHandler } from '../middleware/errorHandler';
import { notFoundHandler } from '../middleware/notFoundHandler';

jest.mock('../lib/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '../lib/database';

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FindUniqueArgs {
  where: { id?: string; email?: string };
  select?: Record<string, boolean>;
}

interface CreateUserArgs {
  data: Omit<TestUser, 'id' | 'createdAt' | 'updatedAt'>;
  select?: Record<string, boolean>;
}

interface UpdateUserArgs {
  where: { id: string };
  data: Partial<TestUser>;
  select?: Record<string, boolean>;
}

const users = new Map<string, TestUser>();
const findUnique = prisma.user.findUnique as unknown as jest.Mock<
  Promise<TestUser | null>,
  [FindUniqueArgs]
>;
const createUser = prisma.user.create as unknown as jest.Mock<
  Promise<TestUser>,
  [CreateUserArgs]
>;
const updateUser = prisma.user.update as unknown as jest.Mock<
  Promise<TestUser>,
  [UpdateUserArgs]
>;

const applySelection = (
  user: TestUser,
  select?: Record<string, boolean>
): TestUser => {
  if (!select) {
    return user;
  }

  return Object.fromEntries(
    Object.keys(select)
      .filter((key) => select[key])
      .map((key) => [key, user[key as keyof TestUser]])
  ) as unknown as TestUser;
};

beforeAll(() => {
  users.clear();

  findUnique.mockImplementation(async ({ where, select }) => {
    const user = where.id
      ? users.get(where.id)
      : [...users.values()].find((candidate) => candidate.email === where.email);

    return user ? applySelection(user, select) : null;
  });

  createUser.mockImplementation(async ({ data, select }) => {
    const user: TestUser = {
      ...data,
      id: `test-user-${users.size + 1}`,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    users.set(user.id, user);
    return applySelection(user, select);
  });

  updateUser.mockImplementation(async ({ where, data, select }) => {
    const user = users.get(where.id);
    if (!user) {
      throw new Error('User not found in test store');
    }

    const updatedUser = { ...user, ...data, updatedAt: new Date() };
    users.set(updatedUser.id, updatedUser);
    return applySelection(updatedUser, select);
  });
});

describe('Authentication API', () => {
  
  let authToken: string;
  let userId: string;

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPass123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.role).toBe('STUDENT');
      expect(response.body.data.user).not.toHaveProperty('password');
      userId = response.body.data.user.id;
      
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPass123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('BUSINESS_RULE_ERROR');
    });

    it('should return conflict when a concurrent registration wins the unique constraint', async () => {
      const uniqueConstraintError = new Error(
        'Unique constraint failed on the fields: (`email`)'
      );
      uniqueConstraintError.name = 'PrismaClientKnownRequestError';
      Object.assign(uniqueConstraintError, { code: 'P2002' });
      createUser.mockRejectedValueOnce(uniqueConstraintError);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'concurrent@example.com',
          password: 'TestPass123',
          firstName: 'Concurrent',
          lastName: 'User',
        })
        .expect(409);

      expect(response.body.error.type).toBe('BUSINESS_RULE_ERROR');
      expect(response.body.error.message).toBe('Email already registered');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPass123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test3@example.com',
          password: 'TestPass123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');

      authToken = response.body.data.token;
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logout successful');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('Password Management', () => {
    it('should change password with valid current password', async () => {
      const response = await request(app)
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPass123',
          newPassword: 'NewTestPass123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Password changed successfully');

      // Re-login with new password and update token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'NewTestPass123',
        });

      authToken = loginResponse.body.data.token;

      // Change password back for other tests
      await request(app)
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'NewTestPass123',
          newPassword: 'TestPass123',
        });

      // Re-login with original password
      const loginResponse2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123',
        });

      authToken = loginResponse2.body.data.token;
    });

    it('should reject password change with invalid current password', async () => {
      const response = await request(app)
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewTestPass123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPass123',
          newPassword: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('User profile', () => {
    it('should require authentication to update a profile', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('AUTHENTICATION_ERROR');
    });

    it('should update the authenticated user profile', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Updated', lastName: 'Student' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.lastName).toBe('Student');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return a user by ID without exposing the password', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(userId);
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return not found for an unknown user ID', async () => {
      const response = await request(app)
        .get('/api/v1/users/unknown-user-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('NOT_FOUND_ERROR');
    });
  });

  describe('AuthService', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await authService.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should compare password correctly', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await authService.hashPassword(password);

      const isValid = await authService.comparePassword(password, hashedPassword);
      const isInvalid = await authService.comparePassword('WrongPassword', hashedPassword);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('should generate and verify token correctly', () => {
      const payload = {
        id: 'test-id',
        email: 'test@example.com',
        role: 'STUDENT',
      };

      const token = authService.generateToken(payload);
      expect(token).toBeDefined();

      const decoded = authService.verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should reject invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow();
    });
  });
});
