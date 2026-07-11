"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const audit_1 = require("../../middleware/audit");
const admin_types_1 = require("./admin.types");
class AdminController {
    async create(req, res) {
        const result = await admin_service_1.adminService.create(req.body);
        await (0, audit_1.recordAudit)({
            userId: req.user.id,
            schoolId: result.user.schoolId,
            action: 'USER_CREATED',
            tableName: 'User',
            recordId: result.user.id,
        });
        (0, api_error_1.created)(res, result, 'Admin created. Share the temporary password securely.');
    }
    async list(req, res) {
        const q = admin_types_1.listAdminQuery.parse(req.query);
        const { data, meta } = await admin_service_1.adminService.list(req.user, q);
        (0, api_error_1.ok)(res, data, undefined, meta);
    }
    async get(req, res) {
        (0, api_error_1.ok)(res, await admin_service_1.adminService.getById(req.user, (0, validator_1.param)(req, 'id')));
    }
    async update(req, res) {
        const admin = await admin_service_1.adminService.update(req.user, (0, validator_1.param)(req, 'id'), req.body);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: admin.schoolId, action: 'USER_UPDATED', tableName: 'User', recordId: admin.id });
        (0, api_error_1.ok)(res, admin, 'Admin updated');
    }
    async deactivate(req, res) {
        const admin = await admin_service_1.adminService.deactivate(req.user, (0, validator_1.param)(req, 'id'));
        await (0, audit_1.recordAudit)({
            userId: req.user.id,
            schoolId: admin.schoolId,
            action: 'USER_DEACTIVATED',
            tableName: 'User',
            recordId: admin.id,
        });
        (0, api_error_1.ok)(res, admin, 'Admin disabled');
    }
    async enable(req, res) {
        const admin = await admin_service_1.adminService.enable(req.user, (0, validator_1.param)(req, 'id'));
        await (0, audit_1.recordAudit)({
            userId: req.user.id,
            schoolId: admin.schoolId,
            action: 'USER_UPDATED',
            tableName: 'User',
            recordId: admin.id,
            newValues: { isActive: true },
        });
        (0, api_error_1.ok)(res, admin, 'Admin re-enabled');
    }
    async resetPassword(req, res) {
        const result = await admin_service_1.adminService.resetPassword(req.user, (0, validator_1.param)(req, 'id'));
        await (0, audit_1.recordAudit)({ userId: req.user.id, action: 'PASSWORD_RESET', tableName: 'User', recordId: (0, validator_1.param)(req, 'id') });
        (0, api_error_1.ok)(res, result, 'Password reset. Share the temporary password securely.');
    }
    async activity(req, res) {
        const { page = '1', limit = '20' } = req.query;
        const { data, meta } = await admin_service_1.adminService.activityLog(req.user, (0, validator_1.param)(req, 'id'), parseInt(page, 10), parseInt(limit, 10));
        (0, api_error_1.ok)(res, data, undefined, meta);
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=admin.controller.js.map