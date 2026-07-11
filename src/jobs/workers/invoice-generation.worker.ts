import { prisma } from '../../config/database';
import { nextInvoiceNumber } from '../../utils/number-generator';
import { logger } from '../../config/logger';

export async function generateMonthlyInvoices(): Promise<number> {
  const schools = await prisma.school.findMany({ where: { isActive: true } });
  const now = new Date();
  const label = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  let created = 0;

  for (const school of schools) {
    const ay = await prisma.academicYear.findFirst({ where: { schoolId: school.id, isCurrent: true } });
    if (!ay) continue;

    const enrollments = await prisma.studentFeeEnrollment.findMany({
      where: { isActive: true, student: { schoolId: school.id, status: 'ACTIVE' } },
      include: { feePackage: true },
    });

    for (const e of enrollments) {
      const exists = await prisma.invoice.findFirst({ where: { studentId: e.studentId, notes: label } });
      if (exists) continue;
      const amount = e.isHostel && e.feePackage.hostelInstallment ? e.feePackage.hostelInstallment : e.feePackage.installmentAmount;
      const invoiceNumber = await nextInvoiceNumber(prisma, school.id);
      await prisma.invoice.create({
        data: {
          invoiceNumber,
          studentId: e.studentId,
          schoolId: school.id,
          academicYearId: ay.id,
          amount,
          invoiceDate: now,
          dueDate,
          notes: label,
        },
      });
      created++;
    }
  }
  logger.info(`Invoice generation: created ${created} invoices for ${label}`);
  return created;
}
