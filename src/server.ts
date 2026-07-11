import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { startJobs, stopJobs } from './jobs/schedulers/cron-scheduler';

async function start(): Promise<void> {
  await connectDatabase();
  await connectRedis();
  await startJobs();

  const server = app.listen(config.port, () => {
    logger.info(`Server running on :${config.port} (${config.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await stopJobs();
      await disconnectRedis();
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 30000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((e) => {
  logger.error('Failed to start server', e);
  process.exit(1);
});
