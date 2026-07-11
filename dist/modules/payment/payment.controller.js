"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const audit_1 = require("../../middleware/audit");
const payment_types_1 = require("./payment.types");
class PaymentController {
    async record(req, res) {
        const result = await payment_service_1.paymentService.record(req.user, req.body);
        for (const p of result.payments) {
            await (0, audit_1.recordAudit)({
                userId: req.user.id,
                schoolId: p.schoolId,
                action: 'PAYMENT_RECORDED',
                tableName: 'Payment',
                recordId: p.id,
                newValues: { amount: p.amount.toString(), receiptNumber: p.receiptNumber },
            }).catch(() => { });
        }
        (0, api_error_1.created)(res, result, `Recorded payment across ${result.count} allocation(s)`);
    }
    async list(req, res) {
        const q = payment_types_1.paymentQuerySchema.parse(req.query);
        const { data, meta } = await payment_service_1.paymentService.list(req.user, q);
        (0, api_error_1.ok)(res, data, undefined, meta);
    }
    async get(req, res) {
        (0, api_error_1.ok)(res, await payment_service_1.paymentService.getById(req.user, (0, validator_1.param)(req, 'id')));
    }
    async studentPayments(req, res) {
        (0, api_error_1.ok)(res, await payment_service_1.paymentService.studentPayments(req.user, (0, validator_1.param)(req, 'studentId')));
    }
    async verify(req, res) {
        const p = await payment_service_1.paymentService.verify(req.user, (0, validator_1.param)(req, 'id'), req.body?.notes);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: p.schoolId, action: 'PAYMENT_VERIFIED', tableName: 'Payment', recordId: p.id });
        (0, api_error_1.ok)(res, p, 'Payment verified');
    }
    async void(req, res) {
        const p = await payment_service_1.paymentService.void(req.user, (0, validator_1.param)(req, 'id'), req.body.reason);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: p.schoolId, action: 'PAYMENT_VOIDED', tableName: 'Payment', recordId: p.id });
        (0, api_error_1.ok)(res, p, 'Payment voided');
    }
    async refund(req, res) {
        const p = await payment_service_1.paymentService.refund(req.user, (0, validator_1.param)(req, 'id'), req.body.reason);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: p.schoolId, action: 'PAYMENT_REFUNDED', tableName: 'Payment', recordId: p.id });
        (0, api_error_1.ok)(res, p, 'Payment refunded');
    }
    async summary(req, res) {
        const q = payment_types_1.summaryQuerySchema.parse(req.query);
        (0, api_error_1.ok)(res, await payment_service_1.paymentService.summary(req.user, q.schoolId, q.year, q.month));
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
//# sourceMappingURL=payment.controller.js.map