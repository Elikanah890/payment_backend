"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const currency_1 = require("../../utils/currency");
const date_utils_1 = require("../../utils/date-utils");
class ReportService {
    async daily(user, dateStr, schoolIdReq) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, schoolIdReq);
        const date = dateStr ? new Date(dateStr) : new Date();
        const where = {
            ...(schoolId ? { schoolId } : {}),
            status: client_1.PaymentStatus.COMPLETED,
            paymentDate: { gte: (0, date_utils_1.startOfDay)(date), lte: (0, date_utils_1.endOfDay)(date) },
        };
        const [rows, agg] = await Promise.all([
            database_1.prisma.payment.findMany({
                where,
                include: { student: { select: { fullName: true, admissionNo: true } }, receipts: { select: { receiptNumber: true } } },
                orderBy: { paymentDate: 'asc' },
            }),
            database_1.prisma.payment.aggregate({ where, _sum: { amount: true }, _count: true }),
        ]);
        return { date: date.toISOString().slice(0, 10), total: (0, currency_1.money)(agg._sum.amount ?? 0), count: agg._count, payments: rows };
    }
    async aging(user, schoolIdReq) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, schoolIdReq);
        const invoices = await database_1.prisma.invoice.findMany({
            where: {
                ...(schoolId ? { schoolId } : {}),
                status: { in: [client_1.InvoiceStatus.UNPAID, client_1.InvoiceStatus.PARTIALLY_PAID, client_1.InvoiceStatus.OVERDUE] },
                dueDate: { lt: new Date() },
            },
            select: { balance: true, dueDate: true },
        });
        const buckets = { '0-30': (0, currency_1.money)(0), '31-60': (0, currency_1.money)(0), '61-90': (0, currency_1.money)(0), '90+': (0, currency_1.money)(0) };
        const now = new Date();
        for (const inv of invoices) {
            const d = (0, date_utils_1.daysBetween)(new Date(inv.dueDate), now);
            const b = (0, currency_1.money)(inv.balance);
            if (d <= 30)
                buckets['0-30'] = buckets['0-30'].plus(b);
            else if (d <= 60)
                buckets['31-60'] = buckets['31-60'].plus(b);
            else if (d <= 90)
                buckets['61-90'] = buckets['61-90'].plus(b);
            else
                buckets['90+'] = buckets['90+'].plus(b);
        }
        return { count: invoices.length, buckets };
    }
    async feePackageSummary(user, schoolIdReq) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, schoolIdReq);
        const packages = await database_1.prisma.feePackage.findMany({
            where: { ...(schoolId ? { schoolId } : {}), isActive: true },
            include: { _count: { select: { enrollments: true } } },
        });
        return packages.map((p) => ({
            id: p.id,
            name: p.name,
            installmentType: p.installmentType,
            installmentAmount: (0, currency_1.money)(p.installmentAmount),
            annualFee: (0, currency_1.money)(p.annualFee),
            enrollments: p._count.enrollments,
        }));
    }
    async hostel(user, schoolIdReq) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, schoolIdReq);
        const where = {
            isActive: true,
            ...(schoolId ? { student: { schoolId } } : {}),
        };
        const [hostel, day] = await Promise.all([
            database_1.prisma.studentFeeEnrollment.count({ where: { ...where, isHostel: true } }),
            database_1.prisma.studentFeeEnrollment.count({ where: { ...where, isHostel: false } }),
        ]);
        return { hostel, dayScholar: day, total: hostel + day };
    }
    async channels(user, schoolIdReq) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, schoolIdReq);
        const where = { ...(schoolId ? { schoolId } : {}), status: client_1.PaymentStatus.COMPLETED };
        const grouped = await database_1.prisma.payment.groupBy({ by: ['method'], where, _sum: { amount: true }, _count: true });
        return grouped.map((g) => ({ method: g.method, total: (0, currency_1.money)(g._sum.amount ?? 0), count: g._count }));
    }
    async studentStatement(user, studentId) {
        const student = await database_1.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                class: true,
                invoices: { orderBy: { dueDate: 'asc' } },
                payments: { where: { status: client_1.PaymentStatus.COMPLETED }, include: { receipts: { select: { receiptNumber: true } } }, orderBy: { paymentDate: 'asc' } },
            },
        });
        if (!student)
            throw api_error_1.ApiError.notFound('Student');
        (0, rbac_1.assertSameSchool)(user, student.schoolId);
        const invoiced = student.invoices.reduce((s, i) => s.plus((0, currency_1.money)(i.amount)), (0, currency_1.money)(0));
        const paid = student.invoices.reduce((s, i) => s.plus((0, currency_1.money)(i.amountPaid)), (0, currency_1.money)(0));
        return {
            student: { id: student.id, fullName: student.fullName, admissionNo: student.admissionNo, class: student.class?.name },
            totals: { invoiced, paid, balance: invoiced.minus(paid) },
            invoices: student.invoices,
            payments: student.payments,
        };
    }
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();
//# sourceMappingURL=report.service.js.map