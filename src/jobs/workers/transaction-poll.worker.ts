import { TransactionStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { selcomProvider } from '../../modules/transaction/selcom.provider';
import { transactionService } from '../../modules/transaction/transaction.service';

export async function pollTransactions(): Promise<number> {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  const pending = await prisma.transaction.findMany({
    where: { status: { in: [TransactionStatus.PENDING, TransactionStatus.PROCESSING] }, initiatedAt: { lt: fiveMinAgo } },
  });

  let processed = 0;
  for (const t of pending) {
    const r = await selcomProvider.queryTransaction(t.providerRef);
    if (r.status === 'success' || r.status === 'completed') {
      await transactionService.processWebhook(t.providerRef, { status: 'success', amount: Number(t.amount) });
    } else if (r.status === 'failed') {
      await prisma.transaction.update({ where: { id: t.id }, data: { status: TransactionStatus.FAILED } });
    } else if (t.initiatedAt < thirtyMinAgo) {
      await prisma.transaction.update({ where: { id: t.id }, data: { status: TransactionStatus.EXPIRED } });
    } else {
      continue;
    }
    processed++;
  }
  if (processed) logger.info(`Transaction poll: processed ${processed}`);
  return processed;
}
