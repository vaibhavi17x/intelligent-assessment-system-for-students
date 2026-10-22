import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi, type User } from './lib/api/auth';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

const renderApp = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Application routes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('navigates between login and registration', async () => {
    renderApp('/login');

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('heading', { name: 'Register' })).toBeInTheDocument();
  });

  it('redirects unauthenticated users from protected routes to login', async () => {
    renderApp('/dashboard');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });
  });

  it('allows an authenticated user to edit and save their profile', async () => {
    const user: User = {
      id: 'user-1',
      email: 'student@example.test',
      firstName: 'Test',
      lastName: 'Student',
      role: 'STUDENT',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    vi.spyOn(authApi, 'login').mockResolvedValue({ token: 'test-token', user });
    const updateProfile = vi.spyOn(authApi, 'updateProfile').mockResolvedValue({
      user: { ...user, firstName: 'Updated' },
    });

    renderApp('/login');
    fireEvent.change(await screen.findByRole('textbox', { name: 'Email' }), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText('Password', { exact: false }), {
      target: { value: 'TestPass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Profile' }));
    expect(await screen.findByRole('heading', { name: 'Edit Profile' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'First Name' }), {
      target: { value: 'Updated' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

    expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument();
    expect(updateProfile).toHaveBeenCalledWith({ firstName: 'Updated', lastName: 'Student' });
  });
});