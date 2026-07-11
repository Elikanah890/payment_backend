"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRouter = exports.auditRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const validation_1 = require("../../middleware/validation");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const system_service_1 = require("./system.service");
const configSchema = zod_1.z.object({
    schoolId: zod_1.z.string().optional(),
    key: zod_1.z.string().min(1),
    value: zod_1.z.any(),
    description: zod_1.z.string().optional(),
});
exports.auditRouter = (0, express_1.Router)();
exports.auditRouter.use(auth_1.authenticate);
exports.auditRouter.get('/', (0, api_error_1.asyncHandler)(async (req, res) => {
    const { page, limit } = validator_1.paginationSchema.parse(req.query);
    const { data, meta } = await system_service_1.systemService.listAuditLogs(req.user, {
        page,
        limit,
        action: req.query.action,
        schoolId: req.query.schoolId,
        userId: req.query.userId,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
    });
    (0, api_error_1.ok)(res, data, undefined, meta);
}));
exports.auditRouter.get('/actions', (0, api_error_1.asyncHandler)(async (_req, res) => (0, api_error_1.ok)(res, await system_service_1.systemService.getAuditActions())));
exports.systemRouter = (0, express_1.Router)();
exports.systemRouter.use(auth_1.authenticate);
exports.systemRouter.get('/health', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(async (_req, res) => (0, api_error_1.ok)(res, await system_service_1.systemService.health())));
exports.systemRouter.get('/metrics', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(async (_req, res) => (0, api_error_1.ok)(res, await system_service_1.systemService.metrics())));
exports.systemRouter.get('/dashboard', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(async (_req, res) => (0, api_error_1.ok)(res, await system_service_1.systemService.superAdminDashboard())));
exports.systemRouter.get('/config', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await system_service_1.systemService.getConfig(req.user, req.query.schoolId))));
exports.systemRouter.put('/config', rbac_1.superAdminOnly, (0, validation_1.validate)({ body: configSchema }), (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await system_service_1.systemService.setConfig(req.user, req.body.schoolId, req.body.key, req.body.value, req.body.description))));
exports.systemRouter.post('/backup', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.created)(res, await system_service_1.systemService.createBackup(req.user), 'Backup queued')));
exports.systemRouter.get('/backup', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await system_service_1.systemService.listBackups())));
exports.systemRouter.post('/restore', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(async (_req, res) => (0, api_error_1.ok)(res, { message: 'Restore must be run via ops tooling (pg_restore).' })));
//# sourceMappingURL=system.routes.js.map