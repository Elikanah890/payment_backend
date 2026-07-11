"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const env_1 = require("../../config/env");
const api_error_1 = require("../../utils/api-error");
const number_generator_1 = require("../../utils/number-generator");
const currency_1 = require("../../utils/currency");
const selcom_provider_1 = require("./selcom.provider");
const payment_service_1 = require("../payment/payment.service");
function mapGatewayMethod(provider) {
    if (provider === 'tigo')
        return client_1.PaymentMethod.TIGO_PESA;
    if (provider === 'airtel')
        return client_1.PaymentMethod.AIRTEL_MONEY;
    return client_1.PaymentMethod.M_PESA;
}
async function getSystemActor(schoolId) {
    const admin = await database_1.prisma.user.findFirst({
        where: { schoolId, role: 'ADMIN', isActive: true },
        orderBy: { lastLogin: { sort: 'desc', nulls: 'last' } },
    });
    if (admin)
        return { id: admin.id, email: admin.email, role: admin.role, schoolId: admin.schoolId };
    const sa = await database_1.prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', isActive: true } });
    if (!sa)
        throw api_error_1.ApiError.badRequest('No system actor available');
    return { id: sa.id, email: sa.email, role: sa.role, schoolId };
}
class TransactionService {
    async initiate(user, dto) {
        const student = await database_1.prisma.student.findUnique({ where: { id: dto.studentId } });
        if (!student)
            throw api_error_1.ApiError.notFound('Student');
        const txRef = await (0, number_generator_1.nextTransactionRef)(database_1.prisma, student.schoolId);
        const provider = dto.provider || 'mpesa';
        const transaction = await database_1.prisma.transaction.create({
            data: {
                transactionRef: txRef,
                studentId: student.id,
                schoolId: student.schoolId,
                gateway: client_1.PaymentGateway.SELCOM,
                providerRef: txRef,
                amount: (0, currency_1.money)(dto.amount),
                status: client_1.TransactionStatus.PENDING,
                requestPayload: { phone: dto.phone, amount: dto.amount, provider },
            },
        });
        const result = await selcom_provider_1.selcomProvider.initiatePayment({
            phone: dto.phone,
            amount: dto.amount,
            reference: txRef,
            provider,
            callbackUrl: `${env_1.config.appUrl}/api/v1/webhooks/selcom`,
        });
        const updated = await database_1.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                providerRef: result.providerRef || txRef,
                status: result.ok ? client_1.TransactionStatus.PENDING : client_1.TransactionStatus.FAILED,
                responseCode: result.ok ? '0' : 'INT-ERR',
                responseMessage: result.message,
                responsePayload: result,
            },
        });
        await database_1.prisma.transactionLog.create({
            data: { transactionId: transaction.id, action: 'INITIATED', status: updated.status, payload: result },
        });
        return updated;
    }
    async getById(id) {
        const tx = await database_1.prisma.transaction.findUnique({
            where: { id },
            include: { payment: { include: { receipts: true } }, logs: { orderBy: { createdAt: 'desc' } } },
        });
        if (!tx)
            throw api_error_1.ApiError.notFound('Transaction');
        return tx;
    }
    async processWebhook(providerRef, payload) {
        const idempotencyKey = `webhook:${providerRef}`;
        try {
            if (await (0, redis_1.redisGet)(idempotencyKey)) {
                const tx = await database_1.prisma.transaction.findUnique({ where: { providerRef }, select: { id: true, status: true, paymentId: true } });
                return { alreadyProcessed: true, transactionId: tx?.id };
            }
            await (0, redis_1.redisSet)(idempotencyKey, '1', 'EX', 86400);
        }
        catch {
            /* fail-open if Redis down */
        }
        const transaction = await database_1.prisma.transaction.findUnique({ where: { providerRef } });
        if (!transaction)
            throw api_error_1.ApiError.notFound('Transaction');
        const rawStatus = payload?.status || payload?.transaction_status || 'unknown';
        const isSuccess = rawStatus === 'success' || rawStatus === 'completed';
        const isFailed = rawStatus === 'failed' || rawStatus === 'cancelled';
        const newStatus = isSuccess ? client_1.TransactionStatus.SUCCESS : isFailed ? client_1.TransactionStatus.FAILED : client_1.TransactionStatus.PROCESSING;
        await database_1.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: newStatus,
                responsePayload: payload,
                webhookPayload: payload,
                webhookReceivedAt: new Date(),
                completedAt: isSuccess ? new Date() : undefined,
            },
        });
        await database_1.prisma.transactionLog.create({
            data: { transactionId: transaction.id, action: 'WEBHOOK_RECEIVED', status: newStatus, payload: payload },
        });
        if (isSuccess) {
            const amount = Number(payload?.amount ?? transaction.amount);
            const actor = await getSystemActor(transaction.schoolId);
            const payments = await payment_service_1.paymentService.settleForStudent(actor.id, transaction.studentId, amount, client_1.PaymentMethod.M_PESA, providerRef);
            const paymentId = payments[0]?.id;
            if (paymentId) {
                await database_1.prisma.transaction.update({ where: { id: transaction.id }, data: { paymentId, status: client_1.TransactionStatus.SUCCESS } });
            }
            return { transactionId: transaction.id, paymentId, receiptNo: paymentId ? (await database_1.prisma.receipt.findFirst({ where: { paymentId }, select: { receiptNumber: true } }))?.receiptNumber : null };
        }
        return { transactionId: transaction.id, status: newStatus };
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
//# sourceMappingURL=transaction.service.js.map