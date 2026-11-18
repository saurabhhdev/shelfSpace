import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './utils/logger';
import { ResourceService } from './modules/resources/resource.service';

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Schedule daily cleanup for expired trash (Phase 2 & Phase 6 requirement: 30-day trash retention)
    setInterval(async () => {
      try {
        const cleanedCount = await ResourceService.cleanupExpiredTrash();
        if (cleanedCount > 0) {
          logger.info(`Cleaned up ${cleanedCount} expired trash resources`);
        }
      } catch (err) {
        logger.error('Error during scheduled trash cleanup', err);
      }
    }, 24 * 60 * 60 * 1000);

    // Initial check on startup
    ResourceService.cleanupExpiredTrash().catch(() => {});

    // 3. Start listening
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Shelfspace Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`Health check available at http://localhost:${env.PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Database disconnected. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
