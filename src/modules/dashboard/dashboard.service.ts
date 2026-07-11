import { prisma } from '../../config/database';
import { startOfDay } from '../../utils/date-utils';
import { AuthUser } from '../../types';
import { smsService } from '../sms/sms.service';

interface PeriodRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
}

function getRange(period: string): PeriodRange {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  let prevStart: Date;
  let prevEnd: Date;

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
      start = startOfDay(now);
      break;
  }
  end = now;
  const duration = end.getTime() - start.getTime();
  prevEnd = new Date(start);
  prevStart = new Date(prevEnd.getTime() - duration);

  return { start, end, prevStart, prevEnd };
}

export async function getDashboard(user: AuthUser, period: string) {
  const schoolId = user.schoolId;
  if (!schoolId) throw Object.assign(new Error('No school context'), { statusCode: 403 });

  const range = getRange(period);

  const [totalStudents, payments, totalInvoicedResult, prevTotalResult, channelData] = await Promise.all([
    prisma.student.count({ where: { schoolId, status: 'ACTIVE' } }),
    prisma.payment.findMany({
      where: { schoolId, status: 'COMPLETED', paymentDate: { gte: range.start, lte: range.end } },
      include: { student: { include: { class: true } } },
      orderBy: { paymentDate: 'desc' },
      take: 10,
    }),
    prisma.invoice.aggregate({ where: { schoolId, status: { notIn: ['CANCELLED', 'VOID'] } }, _sum: { amount: true, amountPaid: true, balance: true } }),
    prisma.payment.aggregate({
      where: { schoolId, status: 'COMPLETED', paymentDate: { gte: range.prevStart, lte: range.prevEnd } },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
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

  const overdueCount = await prisma.invoice.count({
    where: { schoolId, status: { in: ['OVERDUE', 'UNPAID', 'PARTIALLY_PAID'] }, dueDate: { lt: new Date() } },
  });

  const studentsWithBalance = await prisma.student.count({
    where: {
      schoolId,
      status: 'ACTIVE',
      invoices: { some: { status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } } },
    },
  });

  const smsBalanceResult = await smsService.balance();
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
