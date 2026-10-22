import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { authApi } from '../lib/api/auth';
import { ReactNode } from 'react';

jest.mock('../lib/api/auth');

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with no user and loading true', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
    });

    it('should load user from token on mount', async () => {
      localStorage.setItem('authToken', 'test-token');
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT' as const,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      (authApi.getCurrentUser as jest.Mock).mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('test-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear invalid token on mount', async () => {
      localStorage.setItem('authToken', 'invalid-token');
      (authApi.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('login', () => {
    it('should login and set user and token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT' as const,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      (authApi.login as jest.Mock).mockResolvedValue({
        token: 'new-token',
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('new-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('authToken')).toBe('new-token');
    });
  });

  describe('register', () => {
    it('should register without setting user', async () => {
      (authApi.register as jest.Mock).mockResolvedValue({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'STUDENT' as const,
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        message: 'Registration successful',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register({
          email: 'test@example.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
        });
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout and clear user and token', async () => {
      localStorage.setItem('authToken', 'test-token');
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT' as const,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      (authApi.getCurrentUser as jest.Mock).mockResolvedValue({ user: mockUser });
      (authApi.logout as jest.Mock).mockResolvedValue({ message: 'Logout successful' });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should clear user even if logout API fails', async () => {
      localStorage.setItem('authToken', 'test-token');
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT' as const,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      (authApi.getCurrentUser as jest.Mock).mockResolvedValue({ user: mockUser });
      (authApi.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      (authApi.changePassword as jest.Mock).mockResolvedValue({
        message: 'Password changed successfully',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.changePassword({
          currentPassword: 'old',
          newPassword: 'new',
        });
      });

      expect(authApi.changePassword).toHaveBeenCalledWith({
        currentPassword: 'old',
        newPassword: 'new',
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile and user', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'User',
        role: 'STUDENT' as const,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      (authApi.updateProfile as jest.Mock).mockResolvedValue({ user: updatedUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateProfile({ firstName: 'Updated' });
      });

      expect(result.current.user).toEqual(updatedUser);
    });
  });

  describe('refreshUser', () => {
    it('should refresh user from API', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT' as const,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      localStorage.setItem('authToken', 'test-token');
      (authApi.getCurrentUser as jest.Mock).mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const refreshedUser = { ...mockUser, firstName: 'Refreshed' };
      (authApi.getCurrentUser as jest.Mock).mockResolvedValue({
        user: refreshedUser,
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toEqual(refreshedUser);
    });
  });
});
