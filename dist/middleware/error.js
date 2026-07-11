"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const api_error_1 = require("../utils/api-error");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
function notFound(_req, res) {
    res.status(404).json({ success: false, message: 'Route not found' });
}
function errorHandler(err, req, res, _next) {
    if (err instanceof api_error_1.ApiError) {
        res.status(err.statusCode).json({ success: false, message: err.message, errors: err.details });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: err.flatten() });
        return;
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            res.status(409).json({
                success: false,
                message: `Duplicate value for ${err.meta?.target?.join(', ') || 'field'}`,
            });
            return;
        }
        if (err.code === 'P2025') {
            res.status(404).json({ success: false, message: 'Record not found' });
            return;
        }
        if (err.code === 'P2003') {
            res.status(409).json({
                success: false,
                message: 'Operation blocked: related records exist (referential integrity)',
            });
            return;
        }
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger_1.logger.error('Unhandled error', { message, requestId: req.requestId, path: req.path });
    res.status(500).json({
        success: false,
        message: env_1.config.isProd ? 'Internal server error' : message,
    });
}
//# sourceMappingURL=error.js.map