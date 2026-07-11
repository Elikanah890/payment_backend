"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middleware/auth");
const validation_1 = require("../../middleware/validation");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const transaction_service_1 = require("./transaction.service");
const initiateSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    amount: zod_1.z.coerce.number().positive().multipleOf(100),
    phone: zod_1.z.string().min(9),
    provider: zod_1.z.enum(['mpesa', 'tigo', 'airtel']).optional(),
});
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/initiate', (0, validation_1.validate)({ body: initiateSchema }), (0, api_error_1.asyncHandler)(async (req, res) => {
    (0, api_error_1.created)(res, await transaction_service_1.transactionService.initiate(req.user, req.body), 'Payment initiated');
}));
router.get('/:id', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(async (req, res) => {
    (0, api_error_1.ok)(res, await transaction_service_1.transactionService.getById((0, validator_1.param)(req, 'id')));
}));
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map