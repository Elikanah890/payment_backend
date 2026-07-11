"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollTransactions = pollTransactions;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const logger_1 = require("../../config/logger");
const selcom_provider_1 = require("../../modules/transaction/selcom.provider");
const transaction_service_1 = require("../../modules/transaction/transaction.service");
async function pollTransactions() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const pending = await database_1.prisma.transaction.findMany({
        where: { status: { in: [client_1.TransactionStatus.PENDING, client_1.TransactionStatus.PROCESSING] }, initiatedAt: { lt: fiveMinAgo } },
    });
    let processed = 0;
    for (const t of pending) {
        const r = await selcom_provider_1.selcomProvider.queryTransaction(t.providerRef);
        if (r.status === 'success' || r.status === 'completed') {
            await transaction_service_1.transactionService.processWebhook(t.providerRef, { status: 'success', amount: Number(t.amount) });
        }
        else if (r.status === 'failed') {
            await database_1.prisma.transaction.update({ where: { id: t.id }, data: { status: client_1.TransactionStatus.FAILED } });
        }
        else if (t.initiatedAt < thirtyMinAgo) {
            await database_1.prisma.transaction.update({ where: { id: t.id }, data: { status: client_1.TransactionStatus.EXPIRED } });
        }
        else {
            continue;
        }
        processed++;
    }
    if (processed)
        logger_1.logger.info(`Transaction poll: processed ${processed}`);
    return processed;
}
//# sourceMappingURL=transaction-poll.worker.js.map