import React, { useState, useEffect, ReactNode } from 'react';
import { authApi, User, LoginData, RegisterData, ChangePasswordData, UpdateProfileData } from '../lib/api/auth';
import { AuthContext, type AuthContextType } from './AuthContextBase';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const { user: currentUser } = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    const response = await authApi.login(data);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('authToken', response.token);
  };

  const register = async (data: RegisterData) => {
    await authApi.register(data);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  const refreshUser = async () => {
    if (token) {
      const { user: currentUser } = await authApi.getCurrentUser();
      setUser(currentUser);
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    await authApi.changePassword(data);
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const { user: updatedUser } = await authApi.updateProfile(data);
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
