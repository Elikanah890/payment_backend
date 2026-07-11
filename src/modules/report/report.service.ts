import { Prisma, PaymentStatus, InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolveSchoolScope, assertSameSchool } from '../../middleware/rbac';
import { money } from '../../utils/currency';
import { startOfDay, endOfDay, daysBetween } from '../../utils/date-utils';
import { AuthUser } from '../../types';

export class ReportService {
  async daily(user: AuthUser, dateStr: string | undefined, schoolIdReq?: string) {
    const schoolId = resolveSchoolScope(user, schoolIdReq);
    const date = dateStr ? new Date(dateStr) : new Date();
    const where: Prisma.PaymentWhereInput = {
      ...(schoolId ? { schoolId } : {}),
      status: PaymentStatus.COMPLETED,
      paymentDate: { gte: startOfDay(date), lte: endOfDay(date) },
    };
    const [rows, agg] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { student: { select: { fullName: true, admissionNo: true } }, receipts: { select: { receiptNumber: true } } },
        orderBy: { paymentDate: 'asc' },
      }),
      prisma.payment.aggregate({ where, _sum: { amount: true }, _count: true }),
    ]);
    return { date: date.toISOString().slice(0, 10), total: money(agg._sum.amount ?? 0), count: agg._count, payments: rows };
  }

  async aging(user: AuthUser, schoolIdReq?: string) {
    const schoolId = resolveSchoolScope(user, schoolIdReq);
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(schoolId ? { schoolId } : {}),
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
        dueDate: { lt: new Date() },
      },
      select: { balance: true, dueDate: true },
    });
    const buckets = { '0-30': money(0), '31-60': money(0), '61-90': money(0), '90+': money(0) };
    const now = new Date();
    for (const inv of invoices) {
      const d = daysBetween(new Date(inv.dueDate), now);
      const b = money(inv.balance);
      if (d <= 30) buckets['0-30'] = buckets['0-30'].plus(b);
      else if (d <= 60) buckets['31-60'] = buckets['31-60'].plus(b);
      else if (d <= 90) buckets['61-90'] = buckets['61-90'].plus(b);
      else buckets['90+'] = buckets['90+'].plus(b);
    }
    return { count: invoices.length, buckets };
  }

  async feePackageSummary(user: AuthUser, schoolIdReq?: string) {
    const schoolId = resolveSchoolScope(user, schoolIdReq);
    const packages = await prisma.feePackage.findMany({
      where: { ...(schoolId ? { schoolId } : {}), isActive: true },
      include: { _count: { select: { enrollments: true } } },
    });
    return packages.map((p) => ({
      id: p.id,
      name: p.name,
      installmentType: p.installmentType,
      installmentAmount: money(p.installmentAmount),
      annualFee: money(p.annualFee),
      enrollments: p._count.enrollments,
    }));
  }

  async hostel(user: AuthUser, schoolIdReq?: string) {
    const schoolId = resolveSchoolScope(user, schoolIdReq);
    const where: Prisma.StudentFeeEnrollmentWhereInput = {
      isActive: true,
      ...(schoolId ? { student: { schoolId } } : {}),
    };
    const [hostel, day] = await Promise.all([
      prisma.studentFeeEnrollment.count({ where: { ...where, isHostel: true } }),
      prisma.studentFeeEnrollment.count({ where: { ...where, isHostel: false } }),
    ]);
    return { hostel, dayScholar: day, total: hostel + day };
  }

  async channels(user: AuthUser, schoolIdReq?: string) {
    const schoolId = resolveSchoolScope(user, schoolIdReq);
    const where: Prisma.PaymentWhereInput = { ...(schoolId ? { schoolId } : {}), status: PaymentStatus.COMPLETED };
    const grouped = await prisma.payment.groupBy({ by: ['method'], where, _sum: { amount: true }, _count: true });
    return grouped.map((g) => ({ method: g.method, total: money(g._sum.amount ?? 0), count: g._count }));
  }

  async studentStatement(user: AuthUser, studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        invoices: { orderBy: { dueDate: 'asc' } },
        payments: { where: { status: PaymentStatus.COMPLETED }, include: { receipts: { select: { receiptNumber: true } } }, orderBy: { paymentDate: 'asc' } },
      },
    });
    if (!student) throw ApiError.notFound('Student');
    assertSameSchool(user, student.schoolId);

    const invoiced = student.invoices.reduce((s, i) => s.plus(money(i.amount)), money(0));
    const paid = student.invoices.reduce((s, i) => s.plus(money(i.amountPaid)), money(0));
    return {
      student: { id: student.id, fullName: student.fullName, admissionNo: student.admissionNo, class: student.class?.name },
      totals: { invoiced, paid, balance: invoiced.minus(paid) },
      invoices: student.invoices,
      payments: student.payments,
    };
  }
}

export const reportService = new ReportService();
