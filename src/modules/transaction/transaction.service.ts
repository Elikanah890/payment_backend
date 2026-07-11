import { Prisma, PaymentGateway, PaymentMethod, PaymentStatus, TransactionStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { redisGet, redisSet } from '../../config/redis';
import { config } from '../../config/env';
import { ApiError } from '../../utils/api-error';
import { nextTransactionRef } from '../../utils/number-generator';
import { money } from '../../utils/currency';
import { AuthUser } from '../../types';
import { selcomProvider } from './selcom.provider';
import { paymentService } from '../payment/payment.service';

function mapGatewayMethod(provider: 'mpesa' | 'tigo' | 'airtel'): PaymentMethod {
  if (provider === 'tigo') return PaymentMethod.TIGO_PESA;
  if (provider === 'airtel') return PaymentMethod.AIRTEL_MONEY;
  return PaymentMethod.M_PESA;
}

async function getSystemActor(schoolId: string): Promise<AuthUser> {
  const admin = await prisma.user.findFirst({
    where: { schoolId, role: 'ADMIN', isActive: true },
    orderBy: { lastLogin: { sort: 'desc', nulls: 'last' } },
  });
  if (admin) return { id: admin.id, email: admin.email, role: admin.role, schoolId: admin.schoolId };
  const sa = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', isActive: true } });
  if (!sa) throw ApiError.badRequest('No system actor available');
  return { id: sa.id, email: sa.email, role: sa.role, schoolId };
}

export class TransactionService {
  async initiate(user: AuthUser, dto: { studentId: string; amount: number; phone: string; provider?: 'mpesa' | 'tigo' | 'airtel' }) {
    const student = await prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) throw ApiError.notFound('Student');

    const txRef = await nextTransactionRef(prisma, student.schoolId);
    const provider = dto.provider || 'mpesa';

    const transaction = await prisma.transaction.create({
      data: {
        transactionRef: txRef,
        studentId: student.id,
        schoolId: student.schoolId,
        gateway: PaymentGateway.SELCOM,
        providerRef: txRef,
        amount: money(dto.amount),
        status: TransactionStatus.PENDING,
        requestPayload: { phone: dto.phone, amount: dto.amount, provider } as Prisma.InputJsonValue,
      },
    });

    const result = await selcomProvider.initiatePayment({
      phone: dto.phone,
      amount: dto.amount,
      reference: txRef,
      provider,
      callbackUrl: `${config.appUrl}/api/v1/webhooks/selcom`,
    });

    const updated = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        providerRef: result.providerRef || txRef,
        status: result.ok ? TransactionStatus.PENDING : TransactionStatus.FAILED,
        responseCode: result.ok ? '0' : 'INT-ERR',
        responseMessage: result.message,
        responsePayload: result as Prisma.InputJsonValue,
      },
    });

    await prisma.transactionLog.create({
      data: { transactionId: transaction.id, action: 'INITIATED', status: updated.status, payload: result as Prisma.InputJsonValue },
    });

    return updated;
  }

  async getById(id: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: { payment: { include: { receipts: true } }, logs: { orderBy: { createdAt: 'desc' } } },
    });
    if (!tx) throw ApiError.notFound('Transaction');
    return tx;
  }

  async processWebhook(providerRef: string, payload: Record<string, unknown>) {
    const idempotencyKey = `webhook:${providerRef}`;
    try {
      if (await redisGet(idempotencyKey)) {
        const tx = await prisma.transaction.findUnique({ where: { providerRef }, select: { id: true, status: true, paymentId: true } });
        return { alreadyProcessed: true, transactionId: tx?.id };
      }
      await redisSet(idempotencyKey, '1', 'EX', 86400);
    } catch {
      /* fail-open if Redis down */
    }

    const transaction = await prisma.transaction.findUnique({ where: { providerRef } });
    if (!transaction) throw ApiError.notFound('Transaction');

    const rawStatus = (payload?.status as string) || (payload?.transaction_status as string) || 'unknown';
    const isSuccess = rawStatus === 'success' || rawStatus === 'completed';
    const isFailed = rawStatus === 'failed' || rawStatus === 'cancelled';
    const newStatus = isSuccess ? TransactionStatus.SUCCESS : isFailed ? TransactionStatus.FAILED : TransactionStatus.PROCESSING;

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        responsePayload: payload as Prisma.InputJsonValue,
        webhookPayload: payload as Prisma.InputJsonValue,
        webhookReceivedAt: new Date(),
        completedAt: isSuccess ? new Date() : undefined,
      },
    });

    await prisma.transactionLog.create({
      data: { transactionId: transaction.id, action: 'WEBHOOK_RECEIVED', status: newStatus, payload: payload as Prisma.InputJsonValue },
    });

    if (isSuccess) {
      const amount = Number(payload?.amount ?? transaction.amount);
      const actor = await getSystemActor(transaction.schoolId);
      const payments = await paymentService.settleForStudent(actor.id, transaction.studentId, amount, PaymentMethod.M_PESA, providerRef);
      const paymentId = payments[0]?.id;
      if (paymentId) {
        await prisma.transaction.update({ where: { id: transaction.id }, data: { paymentId, status: TransactionStatus.SUCCESS } });
      }
      return { transactionId: transaction.id, paymentId, receiptNo: paymentId ? (await prisma.receipt.findFirst({ where: { paymentId }, select: { receiptNumber: true } }))?.receiptNumber : null };
    }

    return { transactionId: transaction.id, status: newStatus };
  }
}

export const transactionService = new TransactionService();
