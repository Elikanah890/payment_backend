"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptService = exports.ReceiptService = void 0;
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
class ReceiptService {
    async getById(user, id) {
        const receipt = await database_1.prisma.receipt.findUnique({
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
        if (!receipt)
            throw api_error_1.ApiError.notFound('Receipt');
        (0, rbac_1.assertSameSchool)(user, receipt.schoolId);
        return receipt;
    }
    async markPrinted(id) {
        return database_1.prisma.receipt.update({ where: { id }, data: { isPrinted: true, printedAt: new Date() } });
    }
    async emailReceipt(user, id) {
        const receipt = await this.getById(user, id);
        // In production: generate PDF and send via email provider.
        // For now we simply mark it as emailed.
        return database_1.prisma.receipt.update({ where: { id }, data: { isEmailSent: true, emailedAt: new Date() } });
    }
    async pdf(user, id) {
        const receipt = await this.getById(user, id);
        const payment = receipt.payment ?? {};
        const student = payment.student ?? {};
        return `
      <html><body style="font-family:monospace">
        <h2>BLESSING HOPE SCHOOL</h2>
        <p>Receipt: ${receipt.receiptNumber}</p>
        <p>Date: ${new Date(receipt.receiptDate).toLocaleDateString()}</p>
        <p>Student: ${student.fullName} (${student.admissionNo})</p>
        <p>Amount: TZS ${Number(receipt.amount).toLocaleString()}</p>
        <p>Invoice: ${payment.invoice?.invoiceNumber ?? 'N/A'}</p>
        <hr><small>This is an electronically generated receipt.</small>
      </body></html>`;
    }
}
exports.ReceiptService = ReceiptService;
exports.receiptService = new ReceiptService();
//# sourceMappingURL=receipt.service.js.map