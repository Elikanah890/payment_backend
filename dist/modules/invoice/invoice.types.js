"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInvoiceQuery = exports.waiveInvoiceSchema = exports.adjustInvoiceSchema = exports.generateInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.generateInvoiceSchema = zod_1.z.object({
    schoolId: zod_1.z.string().optional(),
    studentId: zod_1.z.string().optional(),
    classId: zod_1.z.string().optional(),
    amount: zod_1.z.coerce.number().positive().multipleOf(100).optional(),
    dueDate: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().optional(),
});
exports.adjustInvoiceSchema = zod_1.z.object({
    type: zod_1.z.enum(['CREDIT_NOTE', 'DEBIT_NOTE', 'DISCOUNT']),
    amount: zod_1.z.coerce.number().positive(),
    reason: zod_1.z.string().min(2),
});
exports.waiveInvoiceSchema = zod_1.z.object({
    reason: zod_1.z.string().min(2),
});
exports.listInvoiceQuery = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID']).optional(),
    classId: zod_1.z.string().optional(),
    studentId: zod_1.z.string().optional(),
    schoolId: zod_1.z.string().optional(),
});
//# sourceMappingURL=invoice.types.js.map