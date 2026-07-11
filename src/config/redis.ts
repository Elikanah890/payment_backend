import Redis, { RedisOptions } from 'ioredis';
import { config } from './env';
import { logger } from './logger';

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

function hasRedisUrl(): boolean {
  try {
    const u = new URL(config.redis.url);
    return !!u.hostname;
  } catch {
    return false;
  }
}

const baseOptions: RedisOptions = {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
  connectTimeout: 5000,
  retryStrategy: (times) => {
    if (times > 1) return null;
    return Math.min(times * 200, 2000);
  },
};

export const redis: Redis | null = (() => {
  if (hasRedisUrl()) {
    const r = new Redis(config.redis.url, baseOptions);
    if (!config.isProd) globalForRedis.redis = r;
    r.on('error', (e) => logger.warn(`Redis error (non-fatal): ${e.message}`));
    return r;
  }
  return null;
})();

export function safeRedis(): Redis | null {
  return redis;
}

export async function redisGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try { return await redis.get(key); } catch { return null; }
}

export async function redisSet(key: string, value: string, mode?: 'EX', ttl?: number): Promise<void> {
  if (!redis) return;
  try { mode && ttl ? await redis.set(key, value, mode, ttl) : await redis.set(key, value); } catch {}
}

export async function redisDel(...keys: string[]): Promise<void> {
  if (!redis) return;
  try { await redis.del(...keys); } catch {}
}

export async function redisIncr(key: string): Promise<number | null> {
  if (!redis) return null;
  try { return await redis.incr(key); } catch { return null; }
}

export async function redisExpire(key: string, seconds: number): Promise<void> {
  if (!redis) return;
  try { await redis.expire(key, seconds); } catch {}
}

export async function redisPing(): Promise<string | null> {
  if (!redis) return null;
  try { return await redis.ping(); } catch { return null; }
}

const pool = (): { host: string; port: number; password?: string } => {
  try {
    const u = new URL(config.redis.url);
    return { host: u.hostname, port: parseInt(u.port || '6379', 10), password: u.password || undefined };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
};

export const bullConnection: RedisOptions | null = hasRedisUrl()
  ? { ...pool(), maxRetriesPerRequest: null }
  : null;

export async function connectRedis(): Promise<void> {
  if (!redis) {
    logger.info('Redis not configured — skipping');
    return;
  }
  try {
    if (redis.status !== 'ready' && redis.status !== 'connecting') {
      await redis.connect();
    }
    logger.info('Redis connected');
  } catch (e: any) {
    logger.warn(`Redis unavailable (non-fatal): ${e.message}`);
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!redis) return;
  try {
    await redis.quit();
  } catch {
    /* ignore */
  }
}
