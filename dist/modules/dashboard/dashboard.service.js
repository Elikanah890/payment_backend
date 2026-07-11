"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
const database_1 = require("../../config/database");
const date_utils_1 = require("../../utils/date-utils");
const sms_service_1 = require("../sms/sms.service");
function getRange(period) {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    let prevStart;
    let prevEnd;
    switch (period) {
        case 'week':
            start.setDate(now.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            start.setHours(0, 0, 0, 0);
            break;
        default: // today
            start = (0, date_utils_1.startOfDay)(now);
            break;
    }
    end = now;
    const duration = end.getTime() - start.getTime();
    prevEnd = new Date(start);
    prevStart = new Date(prevEnd.getTime() - duration);
    return { start, end, prevStart, prevEnd };
}
async function getDashboard(user, period) {
    const schoolId = user.schoolId;
    if (!schoolId)
        throw Object.assign(new Error('No school context'), { statusCode: 403 });
    const range = getRange(period);
    const [totalStudents, payments, totalInvoicedResult, prevTotalResult, channelData] = await Promise.all([
        database_1.prisma.student.count({ where: { schoolId, status: 'ACTIVE' } }),
        database_1.prisma.payment.findMany({
            where: { schoolId, status: 'COMPLETED', paymentDate: { gte: range.start, lte: range.end } },
            include: { student: { include: { class: true } } },
            orderBy: { paymentDate: 'desc' },
            take: 10,
        }),
        database_1.prisma.invoice.aggregate({ where: { schoolId, status: { notIn: ['CANCELLED', 'VOID'] } }, _sum: { amount: true, amountPaid: true, balance: true } }),
        database_1.prisma.payment.aggregate({
            where: { schoolId, status: 'COMPLETED', paymentDate: { gte: range.prevStart, lte: range.prevEnd } },
            _sum: { amount: true },
        }),
        database_1.prisma.payment.groupBy({
            by: ['method'],
            where: { schoolId, status: 'COMPLETED', paymentDate: { gte: range.start, lte: range.end } },
            _sum: { amount: true },
            _count: true,
        }),
    ]);
    const totalCollected = payments.reduce((s, p) => s + Number(p.amount), 0);
    const totalInvoiced = Number(totalInvoicedResult._sum.amount ?? 0);
    const totalPaid = Number(totalInvoicedResult._sum.amountPaid ?? 0);
    const totalOutstanding = Number(totalInvoicedResult._sum.balance ?? 0);
    const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 1000) / 10 : 0;
    const prevTotal = Number(prevTotalResult._sum.amount ?? 0);
    const trend = prevTotal > 0 ? Math.round(((totalCollected - prevTotal) / prevTotal) * 1000) / 10 : 0;
    const overdueCount = await database_1.prisma.invoice.count({
        where: { schoolId, status: { in: ['OVERDUE', 'UNPAID', 'PARTIALLY_PAID'] }, dueDate: { lt: new Date() } },
    });
    const studentsWithBalance = await database_1.prisma.student.count({
        where: {
            schoolId,
            status: 'ACTIVE',
            invoices: { some: { status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } } },
        },
    });
    const smsBalanceResult = await sms_service_1.smsService.balance();
    const smsBalance = smsBalanceResult?.balance ?? null;
    return {
        stats: {
            totalStudents,
            totalCollected,
            collectionRate,
            totalOutstanding,
            trend,
        },
        chart: {
            channelData: channelData.map((c) => ({
                method: c.method,
                amount: Number(c._sum.amount ?? 0),
                count: c._count,
            })),
        },
        recentPayments: payments.map((p) => ({
            id: p.id,
            time: p.paymentDate,
            studentName: p.student.fullName,
            studentClass: p.student.class?.name ?? '-',
            amount: Number(p.amount),
            method: p.method,
            receiptNumber: p.receiptNumber,
        })),
        alerts: {
            overdueCount,
            studentsWithBalance,
            smsBalance,
            isSmsLow: smsBalance !== null && smsBalance < 500,
        },
    };
}
//# sourceMappingURL=dashboard.service.js.map