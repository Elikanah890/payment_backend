"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middleware/auth");
const validation_1 = require("../../middleware/validation");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const sms_service_1 = require("./sms.service");
const sendSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(1600),
    phone: zod_1.z.string().min(7).optional(),
    studentId: zod_1.z.string().optional(),
    guardianId: zod_1.z.string().optional(),
});
const bulkSchema = zod_1.z.object({ message: zod_1.z.string().min(1), studentIds: zod_1.z.array(zod_1.z.string()).min(1) });
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/send', (0, validation_1.validate)({ body: sendSchema }), (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await sms_service_1.smsService.send(req.user, req.body))));
router.post('/bulk', (0, validation_1.validate)({ body: bulkSchema }), (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await sms_service_1.smsService.bulk(req.user, req.body))));
router.get('/history', (0, api_error_1.asyncHandler)(async (req, res) => {
    const { page, limit } = validator_1.paginationSchema.parse(req.query);
    const { data, meta } = await sms_service_1.smsService.history(req.user, page, limit, req.query.schoolId);
    (0, api_error_1.ok)(res, data, undefined, meta);
}));
router.get('/balance', (0, api_error_1.asyncHandler)(async (_req, res) => (0, api_error_1.ok)(res, await sms_service_1.smsService.balance())));
router.post('/reminders', (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await sms_service_1.smsService.sendOverdueReminders(req.query.schoolId))));
exports.default = router;
//# sourceMappingURL=sms.routes.js.map