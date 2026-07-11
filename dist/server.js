"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
async function start() {
    await (0, database_1.connectDatabase)();
    await (0, redis_1.connectRedis)();
    try {
        const { startJobs, stopJobs } = await Promise.resolve().then(() => __importStar(require('./jobs/schedulers/cron-scheduler')));
        await startJobs();
        attachShutdown(stopJobs);
    }
    catch (e) {
        logger_1.logger.warn(`Jobs unavailable (non-fatal): ${e.message}`);
    }
    const server = app_1.default.listen(env_1.config.port, () => {
        logger_1.logger.info(`Server running on :${env_1.config.port} (${env_1.config.nodeEnv})`);
    });
    async function attachShutdown(stopJobsFn) {
        const shutdown = async (signal) => {
            logger_1.logger.info(`${signal} received, shutting down`);
            server.close(async () => {
                try {
                    await stopJobsFn?.();
                }
                catch { }
                await (0, redis_1.disconnectRedis)();
                await (0, database_1.disconnectDatabase)();
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 30000).unref();
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}
start().catch((e) => {
    logger_1.logger.error('Failed to start server', e);
    process.exit(1);
});
//# sourceMappingURL=server.js.map