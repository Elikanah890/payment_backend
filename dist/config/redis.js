"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullConnection = exports.redis = void 0;
exports.connectRedis = connectRedis;
exports.disconnectRedis = disconnectRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const logger_1 = require("./logger");
const globalForRedis = globalThis;
const baseOptions = {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 100, 3000),
};
exports.redis = globalForRedis.redis || new ioredis_1.default(env_1.config.redis.url, baseOptions);
if (!env_1.config.isProd)
    globalForRedis.redis = exports.redis;
exports.redis.on('error', (e) => logger_1.logger.warn(`Redis error (non-fatal): ${e.message}`));
// BullMQ requires a dedicated connection with maxRetriesPerRequest = null
exports.bullConnection = {
    ...(() => {
        try {
            const u = new URL(env_1.config.redis.url);
            return {
                host: u.hostname,
                port: parseInt(u.port || '6379', 10),
                password: u.password || undefined,
            };
        }
        catch {
            return { host: 'localhost', port: 6379 };
        }
    })(),
    maxRetriesPerRequest: null,
};
async function connectRedis() {
    try {
        if (exports.redis.status !== 'ready' && exports.redis.status !== 'connecting') {
            await exports.redis.connect();
        }
        logger_1.logger.info('Redis connected');
    }
    catch (e) {
        logger_1.logger.warn(`Redis unavailable: ${e.message}`);
    }
}
async function disconnectRedis() {
    try {
        await exports.redis.quit();
    }
    catch {
        /* ignore */
    }
}
//# sourceMappingURL=redis.js.map