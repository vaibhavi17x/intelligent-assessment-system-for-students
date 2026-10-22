import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // File Storage
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || '.pdf,.doc,.docx,.txt').split(','),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required configuration
const requiredConfig = ['databaseUrl', 'jwtSecret'];

const validateConfig = () => {
  const missing = requiredConfig.filter(key => !(key in config) || !config[key as keyof typeof config]);
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
  
  if (config.nodeEnv === 'production') {
    if (config.jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
      throw new Error('JWT_SECRET must be changed in production');
    }
  }
};

validateConfig();
