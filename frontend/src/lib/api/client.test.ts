import axios from 'axios';
import apiClient from './client';

jest.mock('axios');

describe('API Client', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should have correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBe('http://localhost:3001/api/v1');
    });

    it('should have correct default headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should have correct timeout', () => {
      expect(apiClient.defaults.timeout).toBe(30000);
    });
  });

  describe('request interceptor', () => {
    it('should add auth token when available', async () => {
      localStorage.setItem('authToken', 'test-token');

      const mockRequest = {
        headers: {},
      };
      mockAxios.interceptors.request.handlers[0].fulfilled(mockRequest);

      expect(mockRequest.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add auth token when not available', async () => {
      const mockRequest = {
        headers: {},
      };
      mockAxios.interceptors.request.handlers[0].fulfilled(mockRequest);

      expect(mockRequest.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('should pass through successful responses', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true },
      };

      const result = mockAxios.interceptors.response.handlers[0].fulfilled(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('should clear token and redirect on 401', async () => {
      localStorage.setItem('authToken', 'test-token');
      window.location.pathname = '/dashboard';

      const mockError = {
        response: { status: 401 },
      };

      mockAxios.interceptors.response.handlers[0].rejected(mockError);

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(window.location.pathname).toBe('/login');
    });

    it('should not redirect on 401 when already on login page', async () => {
      localStorage.setItem('authToken', 'test-token');
      window.location.pathname = '/login';

      const mockError = {
        response: { status: 401 },
      };

      mockAxios.interceptors.response.handlers[0].rejected(mockError);

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(window.location.pathname).toBe('/login');
    });

    it('should handle network errors', async () => {
      const mockError = {
        request: {},
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await mockAxios.interceptors.response.handlers[0].rejected(mockError);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Network error:',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should handle request setup errors', async () => {
      const mockError = {
        message: 'Request setup failed',
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await mockAxios.interceptors.response.handlers[0].rejected(mockError);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Request error:',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });
});
