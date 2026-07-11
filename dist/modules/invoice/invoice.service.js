"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = exports.InvoiceService = void 0;
exports.computeStatus = computeStatus;
const client_1 = require("@prisma/client");
const pdfkit_1 = __importDefault(require("pdfkit"));
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const number_generator_1 = require("../../utils/number-generator");
const currency_1 = require("../../utils/currency");
const validator_1 = require("../../utils/validator");
function computeStatus(amount, amountPaid, dueDate) {
    if (amountPaid.greaterThanOrEqualTo(amount))
        return client_1.InvoiceStatus.PAID;
    if (amountPaid.greaterThan(0))
        return client_1.InvoiceStatus.PARTIALLY_PAID;
    if (dueDate < new Date())
        return client_1.InvoiceStatus.OVERDUE;
    return client_1.InvoiceStatus.UNPAID;
}
class InvoiceService {
    async generate(user, dto) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, dto.schoolId);
        if (!schoolId)
            throw api_error_1.ApiError.badRequest('schoolId is required');
        const students = await database_1.prisma.student.findMany({
            where: {
                schoolId,
                status: 'ACTIVE',
                ...(dto.studentId ? { id: dto.studentId } : {}),
                ...(dto.classId ? { classId: dto.classId } : {}),
            },
            include: { enrollments: { where: { isActive: true }, include: { feePackage: true } } },
        });
        if (!students.length)
            throw api_error_1.ApiError.badRequest('No matching active students');
        const MONTHS = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        const created = [];
        for (const s of students) {
            const enr = s.enrollments[0];
            let amount;
            if (dto.amount != null)
                amount = (0, currency_1.money)(dto.amount);
            else if (enr) {
                amount = (0, currency_1.money)(enr.isHostel && enr.feePackage.hostelInstallment ? enr.feePackage.hostelInstallment : enr.feePackage.installmentAmount);
            }
            else
                continue;
            const invoiceNumber = await (0, number_generator_1.nextInvoiceNumber)(database_1.prisma, schoolId);
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            let period;
            let dueDay;
            if (enr && enr.feePackage.installmentType === 'QUARTERLY') {
                const quarter = Math.floor(currentMonth / 3) + 1;
                period = `Q${quarter} ${currentYear}`;
                dueDay = 15;
            }
            else {
                period = `${MONTHS[currentMonth]} ${currentYear}`;
                dueDay = 5;
            }
            let dueDate;
            if (dto.dueDate) {
                dueDate = new Date(dto.dueDate);
            }
            else {
                dueDate = new Date(currentYear, currentMonth + 1, dueDay);
            }
            dueDate.setHours(23, 59, 59, 999);
            const notes = dto.notes || period;
            const inv = await database_1.prisma.invoice.create({
                data: {
                    invoiceNumber,
                    studentId: s.id,
                    schoolId,
                    academicYearId: s.academicYearId,
                    amount,
                    invoiceDate: new Date(),
                    dueDate,
                    notes,
                    createdBy: user.id,
                },
            });
            created.push(inv);
        }
        return { generated: created.length, invoices: created };
    }
    async list(user, q) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, q.schoolId);
        const where = {
            ...(schoolId ? { schoolId } : {}),
            ...(q.status ? { status: q.status } : {}),
            ...(q.studentId ? { studentId: q.studentId } : {}),
            ...(q.classId ? { student: { classId: q.classId } } : {}),
        };
        const [data, total] = await Promise.all([
            database_1.prisma.invoice.findMany({
                where,
                include: { student: { select: { id: true, fullName: true, admissionNo: true, class: { select: { name: true } } } } },
                orderBy: { dueDate: 'asc' },
                ...(0, validator_1.paginate)(q.page, q.limit),
            }),
            database_1.prisma.invoice.count({ where }),
        ]);
        return { data, meta: (0, validator_1.meta)(q.page, q.limit, total) };
    }
    async getById(user, id) {
        const inv = await database_1.prisma.invoice.findUnique({
            where: { id },
            include: {
                student: { include: { class: true, guardians: { include: { guardian: true } } } },
                payments: true,
                adjustments: true,
            },
        });
        if (!inv)
            throw api_error_1.ApiError.notFound('Invoice');
        (0, rbac_1.assertSameSchool)(user, inv.schoolId);
        return inv;
    }
    async adjust(user, id, dto) {
        const inv = await this.getById(user, id);
        const delta = dto.type === 'DEBIT_NOTE' ? (0, currency_1.money)(dto.amount) : (0, currency_1.money)(dto.amount).negated();
        let newAmount = (0, currency_1.money)(inv.amount).plus(delta);
        if (newAmount.lessThanOrEqualTo(0))
            throw api_error_1.ApiError.badRequest('Resulting invoice amount must be greater than 0');
        if (newAmount.lessThan(inv.amountPaid))
            newAmount = (0, currency_1.money)(inv.amountPaid);
        return database_1.prisma.$transaction(async (tx) => {
            await tx.invoiceAdjustment.create({
                data: { invoiceId: id, type: dto.type, amount: (0, currency_1.money)(dto.amount), reason: dto.reason, approvedBy: user.id },
            });
            return tx.invoice.update({
                where: { id },
                data: { amount: newAmount, status: computeStatus(newAmount, (0, currency_1.money)(inv.amountPaid), inv.dueDate) },
            });
        });
    }
    async waive(user, id, dto) {
        const inv = await this.getById(user, id);
        const remaining = (0, currency_1.money)(inv.amount).minus(inv.amountPaid);
        if (remaining.lessThanOrEqualTo(0))
            throw api_error_1.ApiError.badRequest('Nothing to waive');
        return database_1.prisma.$transaction(async (tx) => {
            await tx.invoiceAdjustment.create({
                data: { invoiceId: id, type: 'WAIVER', amount: remaining, reason: dto.reason, approvedBy: user.id },
            });
            const paid = (0, currency_1.money)(inv.amountPaid);
            if (paid.greaterThan(0)) {
                return tx.invoice.update({ where: { id }, data: { amount: paid, status: client_1.InvoiceStatus.PAID } });
            }
            return tx.invoice.update({ where: { id }, data: { status: client_1.InvoiceStatus.CANCELLED } });
        });
    }
    async overdue(user, requestedSchoolId) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, requestedSchoolId);
        return database_1.prisma.invoice.findMany({
            where: {
                ...(schoolId ? { schoolId } : {}),
                status: { in: [client_1.InvoiceStatus.UNPAID, client_1.InvoiceStatus.PARTIALLY_PAID, client_1.InvoiceStatus.OVERDUE] },
                dueDate: { lt: new Date() },
            },
            include: { student: { include: { class: true, guardians: { include: { guardian: true } } } } },
            orderBy: { dueDate: 'asc' },
        });
    }
    async print(user, id) {
        const inv = await this.getById(user, id);
        const school = await database_1.prisma.school.findUnique({ where: { id: inv.schoolId } });
        if (!school)
            throw api_error_1.ApiError.notFound('School');
        const student = inv.student;
        const className = student?.class?.name ?? '-';
        const guardian = student?.guardians?.[0]?.guardian;
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const fmt = (d) => {
            const dd = new Date(d);
            return `${dd.getDate()} ${months[dd.getMonth()]} ${dd.getFullYear()}`;
        };
        const num = (v) => Number(v ?? 0).toLocaleString('en-US');
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice ${inv.invoiceNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; line-height: 1.5; padding: 40px; max-width: 800px; margin: auto; }
  .header { text-align: center; margin-bottom: 24px; }
  .header h1 { font-size: 22px; color: #2563eb; }
  .header p { font-size: 13px; color: #666; }
  .divider { border-top: 2px solid #2563eb; margin: 16px 0; }
  .divider.thin { border-top: 1px solid #e5e7eb; }
  .title { font-size: 18px; font-weight: bold; margin-bottom: 12px; }
  .flex { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .label { font-size: 12px; color: #888; text-transform: uppercase; }
  .value { font-size: 14px; font-weight: 600; }
  .section { margin-bottom: 20px; }
  .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
  .row b { min-width: 140px; color: #555; }
  .total { background: #2563eb; color: white; padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 8px; }
  .bank { background: #f0f9ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 8px; margin-top: 12px; }
  .bank .row { border: none; }
  .footer { margin-top: 20px; font-size: 11px; color: #999; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <h1>${school.name}</h1>
  <p>${school.address || 'Dar es Salaam, Tanzania'}</p>
  <p>${school.phone}${school.email ? ' | ' + school.email : ''}</p>
</div>
<div class="divider"></div>
<div class="flex">
  <div>
    <div class="label">Invoice</div>
    <div class="value">${inv.invoiceNumber}</div>
  </div>
  <div style="text-align:right">
    <div class="label">Date</div>
    <div class="value">${fmt(inv.invoiceDate)}</div>
  </div>
</div>
<div class="divider thin"></div>
<div class="section">
  <div class="label">Student Details</div>
  <div class="row"><b>Name:</b><span>${student?.fullName ?? '-'}</span></div>
  <div class="row"><b>REG NO:</b><span>${student?.admissionNo ?? '-'}</span></div>
  <div class="row"><b>Class:</b><span>${className}</span></div>
  ${guardian ? `<div class="row"><b>Guardian:</b><span>${guardian.fullName} — ${guardian.phone}</span></div>` : ''}
</div>
<div class="divider thin"></div>
<div class="section">
  <div class="label">Fee Details</div>
  <div class="row"><b>Description:</b><span>School Fees - ${inv.notes || '-'}</span></div>
  <div class="row"><b>Amount:</b><span>TZS ${num(inv.amount)}</span></div>
  <div class="row"><b>Amount Paid:</b><span>TZS ${num(inv.amountPaid)}</span></div>
  <div class="row"><b>Balance:</b><span>TZS ${num(inv.balance)}</span></div>
  <div class="row"><b>Due Date:</b><span>${fmt(inv.dueDate)}</span></div>
  ${Number(inv.lateFee) > 0 ? `<div class="row"><b>Late Fee:</b><span>TZS ${num(inv.lateFee)}</span></div>` : ''}
</div>
<div class="total">
  <span>Total Due</span>
  <span>TZS ${num(inv.totalDue)}</span>
</div>
<div class="bank">
  <div class="label" style="margin-bottom:8px">Payment Instructions</div>
  <div class="row"><b>Bank:</b><span>${school.bankName}</span></div>
  <div class="row"><b>Account Name:</b><span>${school.bankAccountName}</span></div>
  <div class="row"><b>Account No:</b><span>${school.bankAccount}</span></div>
  <div class="row"><b>Reference:</b><span>${student?.admissionNo ?? '-'}</span></div>
</div>
<div class="footer">
  <p>Payment due by ${fmt(inv.dueDate)}. Late payment penalty: TZS ${num(school.lateFeeAmount)}.</p>
  <p>Please use the reference number for all payments. Thank you for your cooperation!</p>
  <div class="divider thin" style="margin-top:16px"></div>
  <p>This is a system generated invoice. No signature required.</p>
</div>
</body>
</html>`;
    }
    async summary(user, requestedSchoolId) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, requestedSchoolId);
        const where = schoolId ? { schoolId } : {};
        const [agg, byStatus] = await Promise.all([
            database_1.prisma.invoice.aggregate({ where, _sum: { amount: true, amountPaid: true, balance: true }, _count: true }),
            database_1.prisma.invoice.groupBy({ by: ['status'], where, _count: true }),
        ]);
        const invoiced = (0, currency_1.money)(agg._sum.amount ?? 0);
        const collected = (0, currency_1.money)(agg._sum.amountPaid ?? 0);
        return {
            totalInvoiced: invoiced,
            totalCollected: collected,
            totalOutstanding: (0, currency_1.money)(agg._sum.balance ?? 0),
            totalInvoices: agg._count,
            collectionRate: invoiced.greaterThan(0) ? collected.dividedBy(invoiced).times(100).toDecimalPlaces(1).toNumber() : 0,
            byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
        };
    }
    async generatePdf(user, id) {
        const inv = await this.getById(user, id);
        const school = await database_1.prisma.school.findUnique({ where: { id: inv.schoolId } });
        if (!school)
            throw api_error_1.ApiError.notFound('School');
        const student = inv.student;
        const className = student?.class?.name ?? '-';
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const fmt = (d) => {
            const dd = new Date(d);
            return `${dd.getDate()} ${months[dd.getMonth()]} ${dd.getFullYear()}`;
        };
        const num = (v) => Number(v ?? 0).toLocaleString('en-US');
        return new Promise((resolve, reject) => {
            const chunks = [];
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50, bufferPages: true });
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(20).font('Helvetica-Bold').text(school.name, { align: 'center' });
            doc.fontSize(10).font('Helvetica').text(school.address || 'Dar es Salaam, Tanzania', { align: 'center' });
            doc.text(`${school.phone}${school.email ? '  |  ' + school.email : ''}`, { align: 'center' });
            doc.moveTo(50, doc.y + 10).lineTo(545, doc.y + 10).lineWidth(2).stroke('#2563eb');
            doc.moveDown(2);
            doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Invoice No: ${inv.invoiceNumber}`, { continued: false });
            doc.text(`Date: ${fmt(inv.invoiceDate)}`, { align: 'right' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke('#ccc');
            doc.moveDown(1);
            doc.fontSize(11).font('Helvetica-Bold').text('Student Details');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${student?.fullName ?? '-'}`);
            doc.text(`REG NO: ${student?.admissionNo ?? '-'}`);
            doc.text(`Class: ${className}`);
            const guardian = student?.guardians?.[0]?.guardian;
            if (guardian) {
                doc.text(`Guardian: ${guardian.fullName}  |  ${guardian.phone}  |  ${guardian.relationship}`);
            }
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke('#ccc');
            doc.moveDown(1);
            doc.fontSize(11).font('Helvetica-Bold').text('Fee Details');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Description: School Fees - ${inv.notes || '-'}`);
            doc.text(`Amount: TZS ${num(inv.amount)}`);
            doc.text(`Amount Paid: TZS ${num(inv.amountPaid)}`);
            doc.text(`Balance: TZS ${num(inv.balance)}`);
            doc.text(`Due Date: ${fmt(inv.dueDate)}`);
            if (Number(inv.lateFee) > 0) {
                doc.text(`Late Fee: TZS ${num(inv.lateFee)}`);
            }
            doc.moveDown(0.5);
            doc.rect(50, doc.y, 495, 30).fill('#2563eb');
            doc.fill('#ffffff').fontSize(13).font('Helvetica-Bold');
            doc.text(`TOTAL DUE: TZS ${num(inv.totalDue)}`, 70, doc.y + 4, { continued: false });
            doc.fill('#000000');
            doc.moveDown(1.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke('#ccc');
            doc.moveDown(1);
            doc.fontSize(11).font('Helvetica-Bold').text('Payment Instructions');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Bank: ${school.bankName}`);
            doc.text(`Account Name: ${school.bankAccountName}`);
            doc.text(`Account Number: ${school.bankAccount}`);
            doc.text(`Reference: ${student?.admissionNo ?? '-'}`);
            doc.moveDown(1);
            doc.fontSize(8).text(`Payment due by ${fmt(inv.dueDate)}. Late payment penalty: TZS ${num(school.lateFeeAmount)}.`, { align: 'center' });
            doc.text('Please use the reference number for all payments. Thank you for your cooperation!', { align: 'center' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke('#ccc');
            doc.moveDown(0.5);
            doc.fontSize(7).fill('#999').text('This is a system generated invoice. No signature required.', { align: 'center' });
            doc.end();
        });
    }
}
exports.InvoiceService = InvoiceService;
exports.invoiceService = new InvoiceService();
//# sourceMappingURL=invoice.service.js.map