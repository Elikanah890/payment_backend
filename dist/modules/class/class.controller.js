"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classController = exports.ClassController = void 0;
const class_service_1 = require("./class.service");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const audit_1 = require("../../middleware/audit");
class ClassController {
    async list(req, res) {
        const includeInactive = req.query.includeInactive === 'true';
        (0, api_error_1.ok)(res, await class_service_1.classService.list(req.user, req.query.schoolId, includeInactive));
    }
    async create(req, res) {
        const klass = await class_service_1.classService.create(req.user, req.body);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: klass.schoolId, action: 'SYSTEM_CONFIG_UPDATED', tableName: 'Class', recordId: klass.id, newValues: { name: klass.name } });
        (0, api_error_1.created)(res, klass, 'Class created');
    }
    async get(req, res) {
        (0, api_error_1.ok)(res, await class_service_1.classService.getById(req.user, (0, validator_1.param)(req, 'id')));
    }
    async update(req, res) {
        (0, api_error_1.ok)(res, await class_service_1.classService.update(req.user, (0, validator_1.param)(req, 'id'), req.body), 'Class updated');
    }
    async deactivate(req, res) {
        (0, api_error_1.ok)(res, await class_service_1.classService.setActive(req.user, (0, validator_1.param)(req, 'id'), false), 'Class deactivated');
    }
    async reactivate(req, res) {
        (0, api_error_1.ok)(res, await class_service_1.classService.setActive(req.user, (0, validator_1.param)(req, 'id'), true), 'Class reactivated');
    }
    // Super-admin nested routes: /schools/:schoolId/classes
    async listForSchool(req, res) {
        (0, api_error_1.ok)(res, await class_service_1.classService.list(req.user, (0, validator_1.param)(req, 'schoolId'), req.query.includeInactive === 'true'));
    }
    async createForSchool(req, res) {
        const klass = await class_service_1.classService.create(req.user, { ...req.body, schoolId: (0, validator_1.param)(req, 'schoolId') });
        (0, api_error_1.created)(res, klass, 'Class created');
    }
}
exports.ClassController = ClassController;
exports.classController = new ClassController();
//# sourceMappingURL=class.controller.js.map