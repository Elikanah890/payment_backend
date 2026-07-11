"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyLateFees = applyLateFees;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const logger_1 = require("../../config/logger");
async function applyLateFees() {
    const schools = await database_1.prisma.school.findMany({ where: { isActive: true } });
    let updated = 0;
    for (const school of schools) {
        const cutoff = new Date(Date.now() - school.lateFeeGraceDays * 24 * 60 * 60 * 1000);
        const invoices = await database_1.prisma.invoice.findMany({
            where: {
                schoolId: school.id,
                dueDate: { lt: cutoff },
                status: { in: [client_1.InvoiceStatus.UNPAID, client_1.InvoiceStatus.PARTIALLY_PAID, client_1.InvoiceStatus.OVERDUE] },
                lateFee: 0,
            },
            select: { id: true },
        });
        for (const inv of invoices) {
            await database_1.prisma.invoice.update({
                where: { id: inv.id },
                data: { lateFee: school.lateFeeAmount, lateFeeAppliedAt: new Date(), status: client_1.InvoiceStatus.OVERDUE },
            });
            updated++;
        }
    }
    logger_1.logger.info(`Late fees applied to ${updated} invoices`);
    return updated;
}
//# sourceMappingURL=late-fee.worker.js.map