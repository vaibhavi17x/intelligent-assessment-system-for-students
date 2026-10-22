
/**
 * Database connection utility
 *
 * Provides a singleton Prisma client instance for database operations.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

class Database {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: [
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ],
      });

      logger.info('Database client initialized');
    }

    return Database.instance;
  }

  static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect();
      logger.info('Database client disconnected');
    }
  }
}

export const prisma = Database.getInstance();

// Graceful shutdown
process.on('beforeExit', async () => {
  await Database.disconnect();
});
