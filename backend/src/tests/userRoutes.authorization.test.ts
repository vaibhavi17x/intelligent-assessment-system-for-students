import express from 'express';
import request from 'supertest';
import { prisma } from '../lib/database';
import { authService } from '../services/auth/authService';
import { errorHandler } from '../middleware/errorHandler';
import userRoutes from '../routes/userRoutes';

jest.mock('../lib/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use(errorHandler);

const findUnique = prisma.user.findUnique as jest.Mock;

const makeUser = (id: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN') => ({
  id,
  email: `${id}@example.test`,
  firstName: 'Test',
  lastName: 'User',
  role,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

const getUserAs = (role: 'STUDENT' | 'TEACHER' | 'ADMIN', id: string, targetId: string) =>
  request(app)
    .get(`/api/v1/users/${targetId}`)
    .set(
      'Authorization',
      `Bearer ${authService.generateToken({
        id,
        email: `${id}@example.test`,
        role,
      })}`
    );

describe('GET /api/v1/users/:id authorization', () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it('allows students to retrieve their own profile', async () => {
    findUnique.mockResolvedValue(makeUser('student-1', 'STUDENT'));

    await getUserAs('STUDENT', 'student-1', 'student-1').expect(200);
  });

  it('prevents students from retrieving another student profile', async () => {
    findUnique.mockResolvedValue(makeUser('student-2', 'STUDENT'));

    const response = await getUserAs('STUDENT', 'student-1', 'student-2').expect(403);

    expect(response.body.error.type).toBe('AUTHORIZATION_ERROR');
  });

  it('allows teachers to retrieve student profiles', async () => {
    findUnique.mockResolvedValue(makeUser('student-1', 'STUDENT'));

    await getUserAs('TEACHER', 'teacher-1', 'student-1').expect(200);
  });

  it('prevents teachers from retrieving other staff profiles', async () => {
    findUnique.mockResolvedValue(makeUser('teacher-2', 'TEACHER'));

    const response = await getUserAs('TEACHER', 'teacher-1', 'teacher-2').expect(403);

    expect(response.body.error.type).toBe('AUTHORIZATION_ERROR');
  });

  it('allows admins to retrieve any profile', async () => {
    findUnique.mockResolvedValue(makeUser('teacher-1', 'TEACHER'));

    await getUserAs('ADMIN', 'admin-1', 'teacher-1').expect(200);
  });
});