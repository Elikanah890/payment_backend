"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
function rateLimit(opts) {
    const windowSec = opts?.windowSec ?? env_1.config.security.rateWindowSec;
    const max = opts?.max ?? env_1.config.security.rateMax;
    const prefix = opts?.keyPrefix ?? 'rl';
    return async (req, res, next) => {
        const id = req.user?.id || req.ip || 'anon';
        const key = `${prefix}:${id}:${Math.floor(Date.now() / (windowSec * 1000))}`;
        try {
            const count = await (0, redis_1.redisIncr)(key);
            if (count === 1)
                await (0, redis_1.redisExpire)(key, windowSec);
            if (count !== null && count > max) {
                res.status(429).json({ success: false, message: 'Too many requests' });
                return;
            }
        }
        catch {
            // fail-open if redis is unavailable
        }
        next();
    };
}
//# sourceMappingURL=rate-limit.js.map