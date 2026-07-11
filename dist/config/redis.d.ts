import Redis, { RedisOptions } from 'ioredis';
export declare const redis: Redis;
export declare const bullConnection: RedisOptions;
export declare function connectRedis(): Promise<void>;
export declare function disconnectRedis(): Promise<void>;
//# sourceMappingURL=redis.d.ts.map