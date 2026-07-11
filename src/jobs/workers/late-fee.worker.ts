import { InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

export async function applyLateFees(): Promise<number> {
  const schools = await prisma.school.findMany({ where: { isActive: true } });
  let updated = 0;

  for (const school of schools) {
    const cutoff = new Date(Date.now() - school.lateFeeGraceDays * 24 * 60 * 60 * 1000);
    const invoices = await prisma.invoice.findMany({
      where: {
        schoolId: school.id,
        dueDate: { lt: cutoff },
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
        lateFee: 0,
      },
      select: { id: true },
    });
    for (const inv of invoices) {
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { lateFee: school.lateFeeAmount, lateFeeAppliedAt: new Date(), status: InvoiceStatus.OVERDUE },
      });
      updated++;
    }
  }
  logger.info(`Late fees applied to ${updated} invoices`);
  return updated;
}
