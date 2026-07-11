import { Prisma, PaymentStatus, PaymentMethod, InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolveSchoolScope, assertSameSchool } from '../../middleware/rbac';
import { nextReceiptNumber } from '../../utils/number-generator';
import { money } from '../../utils/currency';
import { paginate, meta } from '../../utils/validator';
import { AuthUser } from '../../types';
import { RecordPaymentDto, PaymentQuery } from './payment.types';

type Tx = Prisma.TransactionClient;

interface AllocationCtx {
  schoolId: string;
  studentId: string;
  studentName: string;
  amount: Prisma.Decimal;
  method: PaymentMethod;
  actorId: string;
  bankReference?: string;
  transactionId?: string;
  receiptPhoto?: string;
  notes?: string;
  paymentDate?: Date;
  targetInvoiceId?: string;
}

export class PaymentService {
  private async buildQueue(tx: Tx, studentId: string, targetInvoiceId?: string) {
    const outstanding = await tx.invoice.findMany({
      where: { studentId, status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] } },
      orderBy: { dueDate: 'asc' },
    });
    if (!targetInvoiceId) return outstanding;
    const target = outstanding.find((i) => i.id === targetInvoiceId);
    const rest = outstanding.filter((i) => i.id !== targetInvoiceId);
    return target ? [target, ...rest] : rest;
  }

  private async writeAllocation(
    tx: Tx,
    ctx: AllocationCtx,
    invoiceId: string,
    invoiceNumber: string,
    amount: Prisma.Decimal,
    allocated: Prisma.Decimal
  ) {
    const receiptNumber = await nextReceiptNumber(tx, ctx.schoolId);
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
        status: PaymentStatus.COMPLETED,
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
        } as Prisma.InputJsonValue,
        createdBy: ctx.actorId,
      },
    });
    return payment;
  }

  private async allocate(tx: Tx, ctx: AllocationCtx) {
    const queue = await this.buildQueue(tx, ctx.studentId, ctx.targetInvoiceId);
    let remaining = ctx.amount;
    const payments = [];

    for (const inv of queue) {
      if (remaining.lessThanOrEqualTo(0)) break;
      const balance = money(inv.amount).minus(inv.amountPaid);
      if (balance.lessThanOrEqualTo(0)) continue;
      const alloc = balance.lessThan(remaining) ? balance : remaining;
      payments.push(await this.writeAllocation(tx, ctx, inv.id, inv.invoiceNumber, alloc, alloc));
      remaining = remaining.minus(alloc);
    }

    if (remaining.greaterThan(0)) {
      const fallbackId = ctx.targetInvoiceId ?? queue[0]?.id;
      if (!fallbackId) throw ApiError.badRequest('No invoice to record this payment against');
      const fb = queue.find((i) => i.id === fallbackId) ?? (await tx.invoice.findUniqueOrThrow({ where: { id: fallbackId } }));
      payments.push(await this.writeAllocation(tx, ctx, fb.id, fb.invoiceNumber, remaining, money(0)));
    }
    return payments;
  }

  async record(user: AuthUser, dto: RecordPaymentDto) {
    const student = await prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) throw ApiError.notFound('Student');
    assertSameSchool(user, student.schoolId);

    const target = await prisma.invoice.findFirst({ where: { id: dto.invoiceId, studentId: student.id } });
    if (!target) throw ApiError.badRequest('Invoice does not belong to this student');

    const payments = await prisma.$transaction((tx) =>
      this.allocate(tx, {
        schoolId: student.schoolId,
        studentId: student.id,
        studentName: student.fullName,
        amount: money(dto.amount),
        method: dto.method as PaymentMethod,
        actorId: user.id,
        bankReference: dto.bankReference,
        receiptPhoto: dto.receiptPhoto,
        notes: dto.notes,
        paymentDate: dto.paymentDate,
        targetInvoiceId: target.id,
      })
    );
    return { count: payments.length, payments };
  }

  // Used by the Selcom webhook (no interactive user).
  async settleForStudent(actorId: string, studentId: string, amount: number | Prisma.Decimal, method: PaymentMethod, reference: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw ApiError.notFound('Student');
    return prisma.$transaction((tx) =>
      this.allocate(tx, {
        schoolId: student.schoolId,
        studentId: student.id,
        studentName: student.fullName,
        amount: money(amount),
        method,
        actorId,
        transactionId: reference,
        bankReference: reference,
      })
    );
  }

  async list(user: AuthUser, q: PaymentQuery) {
    const schoolId = resolveSchoolScope(user, q.schoolId);
    const where: Prisma.PaymentWhereInput = {
      ...(schoolId ? { schoolId } : {}),
      ...(q.studentId ? { studentId: q.studentId } : {}),
      ...(q.method ? { method: q.method as PaymentMethod } : {}),
      ...(q.status ? { status: q.status as PaymentStatus } : {}),
      ...(q.startDate || q.endDate
        ? { paymentDate: { ...(q.startDate ? { gte: q.startDate } : {}), ...(q.endDate ? { lte: q.endDate } : {}) } }
        : {}),
    };
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          student: { select: { fullName: true, admissionNo: true, class: { select: { name: true } } } },
          invoice: { select: { invoiceNumber: true } },
          receipts: { select: { receiptNumber: true } },
        },
        orderBy: { paymentDate: 'desc' },
        ...paginate(q.page, q.limit),
      }),
      prisma.payment.count({ where }),
    ]);
    return { data, meta: meta(q.page, q.limit, total) };
  }

  async getById(user: AuthUser, id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: { include: { class: true } },
        invoice: true,
        receipts: true,
        recordedByUser: { select: { fullName: true } },
      },
    });
    if (!payment) throw ApiError.notFound('Payment');
    assertSameSchool(user, payment.schoolId);
    return payment;
  }

  async studentPayments(user: AuthUser, studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { schoolId: true } });
    if (!student) throw ApiError.notFound('Student');
    assertSameSchool(user, student.schoolId);
    return prisma.payment.findMany({
      where: { studentId },
      include: { invoice: { select: { invoiceNumber: true } }, receipts: true },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async verify(user: AuthUser, id: string, notes?: string) {
    const payment = await this.getById(user, id);
    if (payment.status === PaymentStatus.COMPLETED) return payment;
    if (payment.status !== PaymentStatus.PENDING) throw ApiError.badRequest(`Cannot verify a ${payment.status} payment`);
    return prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.COMPLETED, verifiedBy: user.id, verifiedAt: new Date(), verificationNotes: notes },
    });
  }

  async void(user: AuthUser, id: string, reason: string) {
    const payment = await this.getById(user, id);
    if (payment.status === PaymentStatus.VOID) throw ApiError.badRequest('Payment already void');
    return prisma.payment.update({ where: { id }, data: { status: PaymentStatus.VOID, verificationNotes: `VOID: ${reason}` } });
  }

  async refund(user: AuthUser, id: string, reason: string) {
    const payment = await this.getById(user, id);
    if (payment.status !== PaymentStatus.COMPLETED) throw ApiError.badRequest('Only completed payments can be refunded');
    return prisma.payment.update({ where: { id }, data: { status: PaymentStatus.REFUNDED, verificationNotes: `REFUND: ${reason}` } });
  }

  async summary(user: AuthUser, requestedSchoolId?: string, year?: number, month?: number) {
    const schoolId = resolveSchoolScope(user, requestedSchoolId);
    let dateFilter: Prisma.DateTimeFilter | undefined;
    if (year) {
      const start = new Date(year, (month ?? 1) - 1, 1);
      const end = month ? new Date(year, month, 1) : new Date(year + 1, 0, 1);
      dateFilter = { gte: start, lt: end };
    }
    const where: Prisma.PaymentWhereInput = {
      ...(schoolId ? { schoolId } : {}),
      status: PaymentStatus.COMPLETED,
      ...(dateFilter ? { paymentDate: dateFilter } : {}),
    };
    const [agg, byMethod] = await Promise.all([
      prisma.payment.aggregate({ where, _sum: { amount: true }, _count: true }),
      prisma.payment.groupBy({ by: ['method'], where, _sum: { amount: true }, _count: true }),
    ]);
    return {
      totalCollected: money(agg._sum.amount ?? 0),
      totalTransactions: agg._count,
      byMethod: byMethod.map((m) => ({ method: m.method, total: money(m._sum.amount ?? 0), count: m._count })),
    };
  }
}

export const paymentService = new PaymentService();
