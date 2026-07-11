"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentController = exports.StudentController = void 0;
const student_service_1 = require("./student.service");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const audit_1 = require("../../middleware/audit");
const student_types_1 = require("./student.types");
class StudentController {
    async create(req, res) {
        const student = await student_service_1.studentService.create(req.user, req.body);
        await (0, audit_1.recordAudit)({
            userId: req.user.id,
            schoolId: student.schoolId,
            action: 'STUDENT_CREATED',
            tableName: 'Student',
            recordId: student.id,
            newValues: { admissionNo: student.admissionNo, fullName: student.fullName },
        });
        (0, api_error_1.created)(res, student, 'Student registered');
    }
    async list(req, res) {
        const q = student_types_1.listStudentQuery.parse(req.query);
        const { data, meta } = await student_service_1.studentService.list(req.user, q);
        (0, api_error_1.ok)(res, data, undefined, meta);
    }
    async search(req, res) {
        const q = student_types_1.listStudentQuery.parse({ ...req.query, limit: req.query.limit ?? 10 });
        const { data } = await student_service_1.studentService.list(req.user, q);
        (0, api_error_1.ok)(res, data);
    }
    async get(req, res) {
        (0, api_error_1.ok)(res, await student_service_1.studentService.getById(req.user, (0, validator_1.param)(req, 'id')));
    }
    async update(req, res) {
        const student = await student_service_1.studentService.update(req.user, (0, validator_1.param)(req, 'id'), req.body);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: student.schoolId, action: 'STUDENT_UPDATED', tableName: 'Student', recordId: student.id });
        (0, api_error_1.ok)(res, student, 'Student updated');
    }
    async withdraw(req, res) {
        const student = await student_service_1.studentService.withdraw(req.user, (0, validator_1.param)(req, 'id'), req.body);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: student.schoolId, action: 'STUDENT_WITHDRAWN', tableName: 'Student', recordId: student.id, newValues: { status: student.status } });
        (0, api_error_1.ok)(res, student, 'Student status updated');
    }
    async permanentDelete(req, res) {
        const result = await student_service_1.studentService.permanentDelete(req.user, (0, validator_1.param)(req, 'id'));
        await (0, audit_1.recordAudit)({
            userId: req.user.id,
            action: 'STUDENT_CREATED',
            tableName: 'Student',
            recordId: (0, validator_1.param)(req, 'id'),
            newValues: { admissionNo: result.admissionNo, fullName: result.fullName, permanentlyDeleted: true },
        });
        (0, api_error_1.ok)(res, result, 'Student permanently deleted');
    }
    async bulk(req, res) {
        const result = await student_service_1.studentService.bulkImport(req.user, req.body.students);
        (0, api_error_1.ok)(res, result, 'Bulk import complete');
    }
}
exports.StudentController = StudentController;
exports.studentController = new StudentController();
//# sourceMappingURL=student.controller.js.map