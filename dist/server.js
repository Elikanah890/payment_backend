"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const cron_scheduler_1 = require("./jobs/schedulers/cron-scheduler");
async function start() {
    await (0, database_1.connectDatabase)();
    await (0, redis_1.connectRedis)();
    await (0, cron_scheduler_1.startJobs)();
    const server = app_1.default.listen(env_1.config.port, () => {
        logger_1.logger.info(`Server running on :${env_1.config.port} (${env_1.config.nodeEnv})`);
    });
    const shutdown = async (signal) => {
        logger_1.logger.info(`${signal} received, shutting down`);
        server.close(async () => {
            await (0, cron_scheduler_1.stopJobs)();
            await (0, redis_1.disconnectRedis)();
            await (0, database_1.disconnectDatabase)();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 30000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
start().catch((e) => {
    logger_1.logger.error('Failed to start server', e);
    process.exit(1);
});
//# sourceMappingURL=server.js.map