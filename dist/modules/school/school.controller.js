"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolController = exports.SchoolController = void 0;
const school_service_1 = require("./school.service");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const audit_1 = require("../../middleware/audit");
class SchoolController {
    async create(req, res) {
        const school = await school_service_1.schoolService.create(req.body);
        await (0, audit_1.recordAudit)({
            userId: req.user.id,
            schoolId: school.id,
            action: 'SYSTEM_CONFIG_UPDATED',
            tableName: 'School',
            recordId: school.id,
            newValues: { name: school.name },
        });
        (0, api_error_1.created)(res, school, 'School created with default classes');
    }
    async list(req, res) {
        const { page, limit } = validator_1.paginationSchema.parse(req.query);
        const search = req.query.search;
        const isActive = req.query.isActive === undefined ? undefined : req.query.isActive === 'true';
        const { data, meta } = await school_service_1.schoolService.list(req.user, page, limit, search, isActive);
        (0, api_error_1.ok)(res, data, undefined, meta);
    }
    async get(req, res) {
        (0, api_error_1.ok)(res, await school_service_1.schoolService.getById(req.user, (0, validator_1.param)(req, 'id')));
    }
    async update(req, res) {
        const school = await school_service_1.schoolService.update((0, validator_1.param)(req, 'id'), req.body);
        await (0, audit_1.recordAudit)({
            userId: req.user.id,
            schoolId: school.id,
            action: 'SYSTEM_CONFIG_UPDATED',
            tableName: 'School',
            recordId: school.id,
        });
        (0, api_error_1.ok)(res, school, 'School updated');
    }
    async deactivate(req, res) {
        const school = await school_service_1.schoolService.deactivate((0, validator_1.param)(req, 'id'));
        (0, api_error_1.ok)(res, school, 'School deactivated');
    }
    async reactivate(req, res) {
        const school = await school_service_1.schoolService.reactivate((0, validator_1.param)(req, 'id'));
        (0, api_error_1.ok)(res, school, 'School reactivated');
    }
    async stats(req, res) {
        (0, api_error_1.ok)(res, await school_service_1.schoolService.stats(req.user, (0, validator_1.param)(req, 'id')));
    }
}
exports.SchoolController = SchoolController;
exports.schoolController = new SchoolController();
//# sourceMappingURL=school.controller.js.map