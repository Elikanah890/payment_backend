"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_controller_1 = require("./class.controller");
const auth_1 = require("../../middleware/auth");
const validation_1 = require("../../middleware/validation");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const class_types_1 = require("./class.types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, api_error_1.asyncHandler)(class_controller_1.classController.list.bind(class_controller_1.classController)));
router.post('/', (0, validation_1.validate)({ body: class_types_1.createClassSchema }), (0, api_error_1.asyncHandler)(class_controller_1.classController.create.bind(class_controller_1.classController)));
router.get('/:id', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(class_controller_1.classController.get.bind(class_controller_1.classController)));
router.put('/:id', (0, validation_1.validate)({ params: validator_1.idParam, body: class_types_1.updateClassSchema }), (0, api_error_1.asyncHandler)(class_controller_1.classController.update.bind(class_controller_1.classController)));
router.delete('/:id', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(class_controller_1.classController.deactivate.bind(class_controller_1.classController)));
router.post('/:id/reactivate', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(class_controller_1.classController.reactivate.bind(class_controller_1.classController)));
exports.default = router;
//# sourceMappingURL=class.routes.js.map