import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { assertSameSchool } from '../../middleware/rbac';
import { AuthUser } from '../../types';

export class ReceiptService {
  async getById(user: AuthUser, id: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            student: { include: { class: true, school: true } },
            invoice: { select: { invoiceNumber: true, amount: true, balance: true } },
            recordedByUser: { select: { fullName: true } },
          },
        },
        student: { select: { fullName: true, admissionNo: true } },
      },
    });
    if (!receipt) throw ApiError.notFound('Receipt');
    assertSameSchool(user, receipt.schoolId);
    return receipt;
  }

  async markPrinted(id: string) {
    return prisma.receipt.update({ where: { id }, data: { isPrinted: true, printedAt: new Date() } });
  }

  async emailReceipt(user: AuthUser, id: string) {
    const receipt = await this.getById(user, id);
    // In production: generate PDF and send via email provider.
    // For now we simply mark it as emailed.
    return prisma.receipt.update({ where: { id }, data: { isEmailSent: true, emailedAt: new Date() } });
  }

  async pdf(user: AuthUser, id: string): Promise<string> {
    const receipt = await this.getById(user, id);
    const payment = (receipt as any).payment ?? {};
    const student = (payment as any).student ?? {};
    return `
      <html><body style="font-family:monospace">
        <h2>BLESSING HOPE SCHOOL</h2>
        <p>Receipt: ${receipt.receiptNumber}</p>
        <p>Date: ${new Date(receipt.receiptDate).toLocaleDateString()}</p>
        <p>Student: ${student.fullName} (${student.admissionNo})</p>
        <p>Amount: TZS ${Number(receipt.amount).toLocaleString()}</p>
        <p>Invoice: ${(payment as any).invoice?.invoiceNumber ?? 'N/A'}</p>
        <hr><small>This is an electronically generated receipt.</small>
      </body></html>`;
  }
}

export const receiptService = new ReceiptService();
