"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminOnly = void 0;
exports.authorize = authorize;
exports.resolveSchoolScope = resolveSchoolScope;
exports.assertSameSchool = assertSameSchool;
const client_1 = require("@prisma/client");
const api_error_1 = require("../utils/api-error");
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user)
            return next(api_error_1.ApiError.unauthorized());
        if (roles.length && !roles.includes(req.user.role)) {
            return next(api_error_1.ApiError.forbidden('Insufficient permissions'));
        }
        next();
    };
}
exports.superAdminOnly = authorize(client_1.UserRole.SUPER_ADMIN);
/**
 * Resolve which school a request operates on.
 * - SUPER_ADMIN: may target any school (via requestedSchoolId) or all (null).
 * - ADMIN: always locked to their own school; a mismatched request is forbidden.
 */
function resolveSchoolScope(user, requestedSchoolId) {
    if (user.role === client_1.UserRole.SUPER_ADMIN) {
        return requestedSchoolId || null;
    }
    if (!user.schoolId)
        throw api_error_1.ApiError.forbidden('No school context');
    if (requestedSchoolId && requestedSchoolId !== user.schoolId) {
        throw api_error_1.ApiError.forbidden('Cannot access another school');
    }
    return user.schoolId;
}
/** Guard an entity's schoolId against the caller (IDOR prevention). */
function assertSameSchool(user, entitySchoolId) {
    if (user.role === client_1.UserRole.SUPER_ADMIN)
        return;
    if (!entitySchoolId || entitySchoolId !== user.schoolId) {
        throw api_error_1.ApiError.notFound('Resource');
    }
}
//# sourceMappingURL=rbac.js.map