"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const env_1 = require("./env");
exports.logger = (0, winston_1.createLogger)({
    level: env_1.config.log.level,
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), env_1.config.isProd ? winston_1.format.json() : winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())),
    transports: [new winston_1.transports.Console()],
});
//# sourceMappingURL=logger.js.map