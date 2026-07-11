"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryQuerySchema = exports.paymentQuerySchema = exports.voidPaymentSchema = exports.refundPaymentSchema = exports.verifyPaymentSchema = exports.recordPaymentSchema = void 0;
const zod_1 = require("zod");
exports.recordPaymentSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    invoiceId: zod_1.z.string().min(1),
    amount: zod_1.z.coerce.number().positive().multipleOf(100),
    method: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'M_PESA', 'TIGO_PESA', 'AIRTEL_MONEY']),
    bankReference: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    receiptPhoto: zod_1.z.string().optional(),
    paymentDate: zod_1.z.coerce.date().default(() => new Date()),
});
exports.verifyPaymentSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
exports.refundPaymentSchema = zod_1.z.object({
    reason: zod_1.z.string().min(2),
    amount: zod_1.z.coerce.number().positive().optional(),
});
exports.voidPaymentSchema = zod_1.z.object({
    reason: zod_1.z.string().min(2),
});
exports.paymentQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    studentId: zod_1.z.string().optional(),
    method: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'VOID']).optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    schoolId: zod_1.z.string().optional(),
});
exports.summaryQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().optional(),
    year: zod_1.z.coerce.number().int().optional(),
    month: zod_1.z.coerce.number().int().min(1).max(12).optional(),
});
//# sourceMappingURL=payment.types.js.map