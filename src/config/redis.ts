import Redis, { RedisOptions } from 'ioredis';
import { config } from './env';
import { logger } from './logger';

const globalForRedis = globalThis as unknown as { redis?: Redis };

const baseOptions: RedisOptions = {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
};

export const redis = globalForRedis.redis || new Redis(config.redis.url, baseOptions);
if (!config.isProd) globalForRedis.redis = redis;

redis.on('error', (e) => logger.warn(`Redis error (non-fatal): ${e.message}`));

// BullMQ requires a dedicated connection with maxRetriesPerRequest = null
export const bullConnection: RedisOptions = {
  ...(() => {
    try {
      const u = new URL(config.redis.url);
      return {
        host: u.hostname,
        port: parseInt(u.port || '6379', 10),
        password: u.password || undefined,
      };
    } catch {
      return { host: 'localhost', port: 6379 };
    }
  })(),
  maxRetriesPerRequest: null,
};

export async function connectRedis(): Promise<void> {
  try {
    if (redis.status !== 'ready' && redis.status !== 'connecting') {
      await redis.connect();
    }
    logger.info('Redis connected');
  } catch (e: any) {
    logger.warn(`Redis unavailable: ${e.message}`);
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
  } catch {
    /* ignore */
  }
}
