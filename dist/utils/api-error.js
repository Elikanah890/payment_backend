"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.ApiError = void 0;
exports.ok = ok;
exports.created = created;
class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    static badRequest(m = 'Bad request', d) {
        return new ApiError(400, m, d);
    }
    static unauthorized(m = 'Unauthorized') {
        return new ApiError(401, m);
    }
    static forbidden(m = 'Forbidden') {
        return new ApiError(403, m);
    }
    static notFound(resource = 'Resource') {
        return new ApiError(404, `${resource} not found`);
    }
    static conflict(m = 'Conflict') {
        return new ApiError(409, m);
    }
    static tooMany(m = 'Too many requests') {
        return new ApiError(429, m);
    }
}
exports.ApiError = ApiError;
const asyncHandler = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
exports.asyncHandler = asyncHandler;
function ok(res, data, message, meta) {
    const body = { success: true, data, message, meta };
    res.json(body);
}
function created(res, data, message) {
    res.status(201).json({ success: true, data, message });
}
//# sourceMappingURL=api-error.js.map