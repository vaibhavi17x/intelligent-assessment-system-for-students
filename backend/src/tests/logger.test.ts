import { logger } from '../lib/logger';

describe('Logger', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env.NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('log levels', () => {
    it('should log error messages', () => {
      logger.error('Test error', { context: 'test' });
      expect(console.error).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Test warning', { context: 'test' });
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Test info', { context: 'test' });
      expect(console.info).toHaveBeenCalled();
    });

    it('should log debug messages in development', () => {
      logger.debug('Test debug', { context: 'test' });
      expect(console.debug).toHaveBeenCalled();
    });

    it('should not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      logger.debug('Test debug', { context: 'test' });
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('log level filtering', () => {
    it('should respect error log level', () => {
      process.env.LOG_LEVEL = 'error';
      logger.error('Test error');
      expect(console.error).toHaveBeenCalled();
      logger.warn('Test warning');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should respect warn log level', () => {
      process.env.LOG_LEVEL = 'warn';
      logger.error('Test error');
      expect(console.error).toHaveBeenCalled();
      logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalled();
      logger.info('Test info');
      expect(console.info).not.toHaveBeenCalled();
    });

    it('should respect info log level', () => {
      process.env.LOG_LEVEL = 'info';
      logger.error('Test error');
      expect(console.error).toHaveBeenCalled();
      logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalled();
      logger.info('Test info');
      expect(console.info).toHaveBeenCalled();
      logger.debug('Test debug');
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should respect debug log level', () => {
      process.env.LOG_LEVEL = 'debug';
      logger.debug('Test debug');
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('specialized logging methods', () => {
    it('should log auth events', () => {
      logger.authEvent('User logged in', { userId: 'user-1' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] User logged in')
      );
    });

    it('should log API events', () => {
      logger.apiEvent('GET /api/test', { status: 200 });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[API] GET /api/test')
      );
    });

    it('should log database events', () => {
      logger.dbEvent('Query executed', { duration: '10ms' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[DB] Query executed')
      );
    });

    it('should log AI events', () => {
      logger.aiEvent('Evaluation started', { submissionId: 'sub-1' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI] Evaluation started')
      );
    });

    it('should log file events', () => {
      logger.fileEvent('File uploaded', { fileName: 'test.pdf' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[FILE] File uploaded')
      );
    });
  });

  describe('log formatting', () => {
    it('should include timestamp in log output', () => {
      logger.info('Test message');
      const call = (console.info as jest.Mock).mock.calls[0][0];
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });

    it('should include log level in output', () => {
      logger.error('Test message');
      const call = (console.error as jest.Mock).mock.calls[0][0];
      expect(call).toMatch(/\[ERROR\]/);
    });

    it('should include context when provided', () => {
      logger.info('Test message', { key: 'value' });
      const call = (console.info as jest.Mock).mock.calls[0][0];
      expect(call).toMatch(/"key":"value"/);
    });
  });
});
