"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeController = exports.FeeController = void 0;
const fee_service_1 = require("./fee.service");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const audit_1 = require("../../middleware/audit");
class FeeController {
    async create(req, res) {
        const pkg = await fee_service_1.feeService.create(req.user, req.body);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: pkg.schoolId, action: 'FEE_PACKAGE_CREATED', tableName: 'FeePackage', recordId: pkg.id });
        (0, api_error_1.created)(res, pkg, 'Fee package created');
    }
    async list(req, res) {
        (0, api_error_1.ok)(res, await fee_service_1.feeService.list(req.user, req.query.schoolId));
    }
    async get(req, res) {
        (0, api_error_1.ok)(res, await fee_service_1.feeService.getById(req.user, (0, validator_1.param)(req, 'id')));
    }
    async update(req, res) {
        const pkg = await fee_service_1.feeService.update(req.user, (0, validator_1.param)(req, 'id'), req.body);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: pkg.schoolId, action: 'FEE_PACKAGE_UPDATED', tableName: 'FeePackage', recordId: pkg.id });
        (0, api_error_1.ok)(res, pkg, 'Fee package updated');
    }
    async remove(req, res) {
        const pkg = await fee_service_1.feeService.deactivate(req.user, (0, validator_1.param)(req, 'id'));
        (0, api_error_1.ok)(res, pkg, 'Fee package deactivated');
    }
    async assignClass(req, res) {
        const link = await fee_service_1.feeService.assignClass(req.user, (0, validator_1.param)(req, 'id'), req.body.classId);
        (0, api_error_1.ok)(res, link, 'Class assigned');
    }
}
exports.FeeController = FeeController;
exports.feeController = new FeeController();
//# sourceMappingURL=fee.controller.js.map