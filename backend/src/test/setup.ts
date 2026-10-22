// Test setup file for backend

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ||
  'postgresql://test:test@127.0.0.1:1/intelligent_assessment_test?schema=public';
const testDatabaseName = new URL(testDatabaseUrl).pathname.slice(1);

if (!testDatabaseName.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must target a database ending in _test');
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.UPLOAD_DIR = './test-uploads';
process.env.MAX_FILE_SIZE = '10485760';
process.env.ALLOWED_FILE_TYPES = '.pdf,.doc,.docx,.txt';
process.env.LOG_LEVEL = 'error';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
