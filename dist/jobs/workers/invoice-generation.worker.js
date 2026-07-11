"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMonthlyInvoices = generateMonthlyInvoices;
const database_1 = require("../../config/database");
const number_generator_1 = require("../../utils/number-generator");
const logger_1 = require("../../config/logger");
async function generateMonthlyInvoices() {
    const schools = await database_1.prisma.school.findMany({ where: { isActive: true } });
    const now = new Date();
    const label = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    let created = 0;
    for (const school of schools) {
        const ay = await database_1.prisma.academicYear.findFirst({ where: { schoolId: school.id, isCurrent: true } });
        if (!ay)
            continue;
        const enrollments = await database_1.prisma.studentFeeEnrollment.findMany({
            where: { isActive: true, student: { schoolId: school.id, status: 'ACTIVE' } },
            include: { feePackage: true },
        });
        for (const e of enrollments) {
            const exists = await database_1.prisma.invoice.findFirst({ where: { studentId: e.studentId, notes: label } });
            if (exists)
                continue;
            const amount = e.isHostel && e.feePackage.hostelInstallment ? e.feePackage.hostelInstallment : e.feePackage.installmentAmount;
            const invoiceNumber = await (0, number_generator_1.nextInvoiceNumber)(database_1.prisma, school.id);
            await database_1.prisma.invoice.create({
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
    logger_1.logger.info(`Invoice generation: created ${created} invoices for ${label}`);
    return created;
}
//# sourceMappingURL=invoice-generation.worker.js.map