"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fee_controller_1 = require("./fee.controller");
const auth_1 = require("../../middleware/auth");
const validation_1 = require("../../middleware/validation");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const fee_types_1 = require("./fee.types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, api_error_1.asyncHandler)(fee_controller_1.feeController.list.bind(fee_controller_1.feeController)));
router.post('/', (0, validation_1.validate)({ body: fee_types_1.createFeePackageSchema }), (0, api_error_1.asyncHandler)(fee_controller_1.feeController.create.bind(fee_controller_1.feeController)));
router.get('/:id', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(fee_controller_1.feeController.get.bind(fee_controller_1.feeController)));
router.put('/:id', (0, validation_1.validate)({ params: validator_1.idParam, body: fee_types_1.updateFeePackageSchema }), (0, api_error_1.asyncHandler)(fee_controller_1.feeController.update.bind(fee_controller_1.feeController)));
router.delete('/:id', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(fee_controller_1.feeController.remove.bind(fee_controller_1.feeController)));
router.post('/:id/assign-class', (0, validation_1.validate)({ params: validator_1.idParam, body: fee_types_1.assignClassSchema }), (0, api_error_1.asyncHandler)(fee_controller_1.feeController.assignClass.bind(fee_controller_1.feeController)));
exports.default = router;
//# sourceMappingURL=fee.routes.js.map