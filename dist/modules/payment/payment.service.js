"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const number_generator_1 = require("../../utils/number-generator");
const currency_1 = require("../../utils/currency");
const validator_1 = require("../../utils/validator");
class PaymentService {
    async buildQueue(tx, studentId, targetInvoiceId) {
        const outstanding = await tx.invoice.findMany({
            where: { studentId, status: { in: [client_1.InvoiceStatus.UNPAID, client_1.InvoiceStatus.PARTIALLY_PAID, client_1.InvoiceStatus.OVERDUE] } },
            orderBy: { dueDate: 'asc' },
        });
        if (!targetInvoiceId)
            return outstanding;
        const target = outstanding.find((i) => i.id === targetInvoiceId);
        const rest = outstanding.filter((i) => i.id !== targetInvoiceId);
        return target ? [target, ...rest] : rest;
    }
    async writeAllocation(tx, ctx, invoiceId, invoiceNumber, amount, allocated) {
        const receiptNumber = await (0, number_generator_1.nextReceiptNumber)(tx, ctx.schoolId);
        const payment = await tx.payment.create({
            data: {
                receiptNumber,
                studentId: ctx.studentId,
                invoiceId,
                schoolId: ctx.schoolId,
                amount,
                amountAllocated: allocated,
                method: ctx.method,
                bankReference: ctx.bankReference,
                transactionId: ctx.transactionId,
                paymentDate: ctx.paymentDate ?? new Date(),
                receiptPhoto: ctx.receiptPhoto,
                verificationNotes: ctx.notes,
                status: client_1.PaymentStatus.COMPLETED,
                recordedBy: ctx.actorId,
                verifiedBy: ctx.actorId,
                verifiedAt: new Date(),
            },
        });
        await tx.receipt.create({
            data: {
                receiptNumber,
                paymentId: payment.id,
                studentId: ctx.studentId,
                schoolId: ctx.schoolId,
                amount,
                receiptData: {
                    student: ctx.studentName,
                    invoiceNumber,
                    amount: amount.toString(),
                    allocated: allocated.toString(),
                    method: ctx.method,
                },
                createdBy: ctx.actorId,
            },
        });
        return payment;
    }
    async allocate(tx, ctx) {
        const queue = await this.buildQueue(tx, ctx.studentId, ctx.targetInvoiceId);
        let remaining = ctx.amount;
        const payments = [];
        for (const inv of queue) {
            if (remaining.lessThanOrEqualTo(0))
                break;
            const balance = (0, currency_1.money)(inv.amount).minus(inv.amountPaid);
            if (balance.lessThanOrEqualTo(0))
                continue;
            const alloc = balance.lessThan(remaining) ? balance : remaining;
            payments.push(await this.writeAllocation(tx, ctx, inv.id, inv.invoiceNumber, alloc, alloc));
            remaining = remaining.minus(alloc);
        }
        if (remaining.greaterThan(0)) {
            const fallbackId = ctx.targetInvoiceId ?? queue[0]?.id;
            if (!fallbackId)
                throw api_error_1.ApiError.badRequest('No invoice to record this payment against');
            const fb = queue.find((i) => i.id === fallbackId) ?? (await tx.invoice.findUniqueOrThrow({ where: { id: fallbackId } }));
            payments.push(await this.writeAllocation(tx, ctx, fb.id, fb.invoiceNumber, remaining, (0, currency_1.money)(0)));
        }
        return payments;
    }
    async record(user, dto) {
        const student = await database_1.prisma.student.findUnique({ where: { id: dto.studentId } });
        if (!student)
            throw api_error_1.ApiError.notFound('Student');
        (0, rbac_1.assertSameSchool)(user, student.schoolId);
        const target = await database_1.prisma.invoice.findFirst({ where: { id: dto.invoiceId, studentId: student.id } });
        if (!target)
            throw api_error_1.ApiError.badRequest('Invoice does not belong to this student');
        const payments = await database_1.prisma.$transaction((tx) => this.allocate(tx, {
            schoolId: student.schoolId,
            studentId: student.id,
            studentName: student.fullName,
            amount: (0, currency_1.money)(dto.amount),
            method: dto.method,
            actorId: user.id,
            bankReference: dto.bankReference,
            receiptPhoto: dto.receiptPhoto,
            notes: dto.notes,
            paymentDate: dto.paymentDate,
            targetInvoiceId: target.id,
        }));
        return { count: payments.length, payments };
    }
    // Used by the Selcom webhook (no interactive user).
    async settleForStudent(actorId, studentId, amount, method, reference) {
        const student = await database_1.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw api_error_1.ApiError.notFound('Student');
        return database_1.prisma.$transaction((tx) => this.allocate(tx, {
            schoolId: student.schoolId,
            studentId: student.id,
            studentName: student.fullName,
            amount: (0, currency_1.money)(amount),
            method,
            actorId,
            transactionId: reference,
            bankReference: reference,
        }));
    }
    async list(user, q) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, q.schoolId);
        const where = {
            ...(schoolId ? { schoolId } : {}),
            ...(q.studentId ? { studentId: q.studentId } : {}),
            ...(q.method ? { method: q.method } : {}),
            ...(q.status ? { status: q.status } : {}),
            ...(q.startDate || q.endDate
                ? { paymentDate: { ...(q.startDate ? { gte: q.startDate } : {}), ...(q.endDate ? { lte: q.endDate } : {}) } }
                : {}),
        };
        const [data, total] = await Promise.all([
            database_1.prisma.payment.findMany({
                where,
                include: {
                    student: { select: { fullName: true, admissionNo: true, class: { select: { name: true } } } },
                    invoice: { select: { invoiceNumber: true } },
                    receipts: { select: { receiptNumber: true } },
                },
                orderBy: { paymentDate: 'desc' },
                ...(0, validator_1.paginate)(q.page, q.limit),
            }),
            database_1.prisma.payment.count({ where }),
        ]);
        return { data, meta: (0, validator_1.meta)(q.page, q.limit, total) };
    }
    async getById(user, id) {
        const payment = await database_1.prisma.payment.findUnique({
            where: { id },
            include: {
                student: { include: { class: true } },
                invoice: true,
                receipts: true,
                recordedByUser: { select: { fullName: true } },
            },
        });
        if (!payment)
            throw api_error_1.ApiError.notFound('Payment');
        (0, rbac_1.assertSameSchool)(user, payment.schoolId);
        return payment;
    }
    async studentPayments(user, studentId) {
        const student = await database_1.prisma.student.findUnique({ where: { id: studentId }, select: { schoolId: true } });
        if (!student)
            throw api_error_1.ApiError.notFound('Student');
        (0, rbac_1.assertSameSchool)(user, student.schoolId);
        return database_1.prisma.payment.findMany({
            where: { studentId },
            include: { invoice: { select: { invoiceNumber: true } }, receipts: true },
            orderBy: { paymentDate: 'desc' },
        });
    }
    async verify(user, id, notes) {
        const payment = await this.getById(user, id);
        if (payment.status === client_1.PaymentStatus.COMPLETED)
            return payment;
        if (payment.status !== client_1.PaymentStatus.PENDING)
            throw api_error_1.ApiError.badRequest(`Cannot verify a ${payment.status} payment`);
        return database_1.prisma.payment.update({
            where: { id },
            data: { status: client_1.PaymentStatus.COMPLETED, verifiedBy: user.id, verifiedAt: new Date(), verificationNotes: notes },
        });
    }
    async void(user, id, reason) {
        const payment = await this.getById(user, id);
        if (payment.status === client_1.PaymentStatus.VOID)
            throw api_error_1.ApiError.badRequest('Payment already void');
        return database_1.prisma.payment.update({ where: { id }, data: { status: client_1.PaymentStatus.VOID, verificationNotes: `VOID: ${reason}` } });
    }
    async refund(user, id, reason) {
        const payment = await this.getById(user, id);
        if (payment.status !== client_1.PaymentStatus.COMPLETED)
            throw api_error_1.ApiError.badRequest('Only completed payments can be refunded');
        return database_1.prisma.payment.update({ where: { id }, data: { status: client_1.PaymentStatus.REFUNDED, verificationNotes: `REFUND: ${reason}` } });
    }
    async summary(user, requestedSchoolId, year, month) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, requestedSchoolId);
        let dateFilter;
        if (year) {
            const start = new Date(year, (month ?? 1) - 1, 1);
            const end = month ? new Date(year, month, 1) : new Date(year + 1, 0, 1);
            dateFilter = { gte: start, lt: end };
        }
        const where = {
            ...(schoolId ? { schoolId } : {}),
            status: client_1.PaymentStatus.COMPLETED,
            ...(dateFilter ? { paymentDate: dateFilter } : {}),
        };
        const [agg, byMethod] = await Promise.all([
            database_1.prisma.payment.aggregate({ where, _sum: { amount: true }, _count: true }),
            database_1.prisma.payment.groupBy({ by: ['method'], where, _sum: { amount: true }, _count: true }),
        ]);
        return {
            totalCollected: (0, currency_1.money)(agg._sum.amount ?? 0),
            totalTransactions: agg._count,
            byMethod: byMethod.map((m) => ({ method: m.method, total: (0, currency_1.money)(m._sum.amount ?? 0), count: m._count })),
        };
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=payment.service.js.map