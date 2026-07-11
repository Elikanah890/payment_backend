"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
const logger_1 = require("./logger");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: env_1.config.isProd ? ['error'] : ['warn', 'error'],
    });
if (!env_1.config.isProd)
    globalForPrisma.prisma = exports.prisma;
async function connectDatabase() {
    await exports.prisma.$connect();
    logger_1.logger.info('Database connected');
}
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
}
//# sourceMappingURL=database.js.map