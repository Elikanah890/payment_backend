import Redis, { RedisOptions } from 'ioredis';
export declare const redis: Redis | null;
export declare function safeRedis(): Redis | null;
export declare function redisGet(key: string): Promise<string | null>;
export declare function redisSet(key: string, value: string, mode?: 'EX', ttl?: number): Promise<void>;
export declare function redisDel(...keys: string[]): Promise<void>;
export declare function redisIncr(key: string): Promise<number | null>;
export declare function redisExpire(key: string, seconds: number): Promise<void>;
export declare function redisPing(): Promise<string | null>;
export declare const bullConnection: RedisOptions | null;
export declare function connectRedis(): Promise<void>;
export declare function disconnectRedis(): Promise<void>;
//# sourceMappingURL=redis.d.ts.map