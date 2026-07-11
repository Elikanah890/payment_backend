"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullConnection = exports.redis = void 0;
exports.safeRedis = safeRedis;
exports.redisGet = redisGet;
exports.redisSet = redisSet;
exports.redisDel = redisDel;
exports.redisIncr = redisIncr;
exports.redisExpire = redisExpire;
exports.redisPing = redisPing;
exports.connectRedis = connectRedis;
exports.disconnectRedis = disconnectRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const logger_1 = require("./logger");
const globalForRedis = globalThis;
function hasRedisUrl() {
    try {
        const u = new URL(env_1.config.redis.url);
        return !!u.hostname;
    }
    catch {
        return false;
    }
}
const baseOptions = {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
    connectTimeout: 5000,
    retryStrategy: (times) => {
        if (times > 1)
            return null;
        return Math.min(times * 200, 2000);
    },
};
exports.redis = (() => {
    if (hasRedisUrl()) {
        const r = new ioredis_1.default(env_1.config.redis.url, baseOptions);
        if (!env_1.config.isProd)
            globalForRedis.redis = r;
        r.on('error', (e) => logger_1.logger.warn(`Redis error (non-fatal): ${e.message}`));
        return r;
    }
    return null;
})();
function safeRedis() {
    return exports.redis;
}
async function redisGet(key) {
    if (!exports.redis)
        return null;
    try {
        return await exports.redis.get(key);
    }
    catch {
        return null;
    }
}
async function redisSet(key, value, mode, ttl) {
    if (!exports.redis)
        return;
    try {
        mode && ttl ? await exports.redis.set(key, value, mode, ttl) : await exports.redis.set(key, value);
    }
    catch { }
}
async function redisDel(...keys) {
    if (!exports.redis)
        return;
    try {
        await exports.redis.del(...keys);
    }
    catch { }
}
async function redisIncr(key) {
    if (!exports.redis)
        return null;
    try {
        return await exports.redis.incr(key);
    }
    catch {
        return null;
    }
}
async function redisExpire(key, seconds) {
    if (!exports.redis)
        return;
    try {
        await exports.redis.expire(key, seconds);
    }
    catch { }
}
async function redisPing() {
    if (!exports.redis)
        return null;
    try {
        return await exports.redis.ping();
    }
    catch {
        return null;
    }
}
const pool = () => {
    try {
        const u = new URL(env_1.config.redis.url);
        return { host: u.hostname, port: parseInt(u.port || '6379', 10), password: u.password || undefined };
    }
    catch {
        return { host: 'localhost', port: 6379 };
    }
};
exports.bullConnection = hasRedisUrl()
    ? { ...pool(), maxRetriesPerRequest: null }
    : null;
async function connectRedis() {
    if (!exports.redis) {
        logger_1.logger.info('Redis not configured — skipping');
        return;
    }
    try {
        if (exports.redis.status !== 'ready' && exports.redis.status !== 'connecting') {
            await exports.redis.connect();
        }
        logger_1.logger.info('Redis connected');
    }
    catch (e) {
        logger_1.logger.warn(`Redis unavailable (non-fatal): ${e.message}`);
    }
}
async function disconnectRedis() {
    if (!exports.redis)
        return;
    try {
        await exports.redis.quit();
    }
    catch {
        /* ignore */
    }
}
//# sourceMappingURL=redis.js.map