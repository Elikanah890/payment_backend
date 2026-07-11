"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const school_controller_1 = require("./school.controller");
const class_controller_1 = require("../class/class.controller");
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const validation_1 = require("../../middleware/validation");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const school_types_1 = require("./school.types");
const class_types_1 = require("../class/class.types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, api_error_1.asyncHandler)(school_controller_1.schoolController.list.bind(school_controller_1.schoolController)));
router.post('/', rbac_1.superAdminOnly, (0, validation_1.validate)({ body: school_types_1.createSchoolSchema }), (0, api_error_1.asyncHandler)(school_controller_1.schoolController.create.bind(school_controller_1.schoolController)));
router.get('/:id', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(school_controller_1.schoolController.get.bind(school_controller_1.schoolController)));
router.get('/:id/stats', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(school_controller_1.schoolController.stats.bind(school_controller_1.schoolController)));
router.put('/:id', rbac_1.superAdminOnly, (0, validation_1.validate)({ params: validator_1.idParam, body: school_types_1.updateSchoolSchema }), (0, api_error_1.asyncHandler)(school_controller_1.schoolController.update.bind(school_controller_1.schoolController)));
router.delete('/:id', rbac_1.superAdminOnly, (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(school_controller_1.schoolController.deactivate.bind(school_controller_1.schoolController)));
router.post('/:id/reactivate', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(school_controller_1.schoolController.reactivate.bind(school_controller_1.schoolController)));
// Super Admin: manage classes for a specific school
router.get('/:schoolId/classes', rbac_1.superAdminOnly, (0, api_error_1.asyncHandler)(class_controller_1.classController.listForSchool.bind(class_controller_1.classController)));
router.post('/:schoolId/classes', rbac_1.superAdminOnly, (0, validation_1.validate)({ body: class_types_1.createClassSchema }), (0, api_error_1.asyncHandler)(class_controller_1.classController.createForSchool.bind(class_controller_1.classController)));
exports.default = router;
//# sourceMappingURL=school.routes.js.map