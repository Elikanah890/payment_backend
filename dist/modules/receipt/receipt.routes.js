"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validation_1 = require("../../middleware/validation");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const receipt_service_1 = require("./receipt.service");
const api_error_2 = require("../../utils/api-error");
const validator_2 = require("../../utils/validator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/:id', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(async (req, res) => {
    (0, api_error_2.ok)(res, await receipt_service_1.receiptService.getById(req.user, (0, validator_2.param)(req, 'id')));
}));
router.get('/:id/pdf', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(async (req, res) => {
    const html = await receipt_service_1.receiptService.pdf(req.user, (0, validator_2.param)(req, 'id'));
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
}));
router.post('/:id/print', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(async (req, res) => {
    (0, api_error_2.ok)(res, await receipt_service_1.receiptService.markPrinted((0, validator_2.param)(req, 'id')));
}));
router.post('/:id/email', (0, validation_1.validate)({ params: validator_1.idParam }), (0, api_error_1.asyncHandler)(async (req, res) => {
    (0, api_error_2.ok)(res, await receipt_service_1.receiptService.emailReceipt(req.user, (0, validator_2.param)(req, 'id')));
}));
exports.default = router;
//# sourceMappingURL=receipt.routes.js.map