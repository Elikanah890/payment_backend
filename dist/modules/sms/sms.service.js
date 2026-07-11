"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SmsService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const validator_1 = require("../../utils/validator");
const beem_provider_1 = require("./beem.provider");
class SmsService {
    async deliver(rec, message, createdBy) {
        const result = await beem_provider_1.beemProvider.sendSms(rec.phone, message);
        return database_1.prisma.notificationLog.create({
            data: {
                schoolId: rec.schoolId,
                studentId: rec.studentId,
                guardianId: rec.guardianId,
                channel: client_1.NotificationChannel.SMS,
                recipient: rec.phone,
                message,
                senderId: 'BLESSHOPE',
                status: result.ok ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                providerRef: result.providerRef,
                error: result.error,
                sentAt: new Date(),
                createdBy,
            },
        });
    }
    async send(user, dto) {
        const recipients = await this.resolveRecipients(user, dto);
        if (!recipients.length)
            throw api_error_1.ApiError.badRequest('No SMS recipients resolved');
        const logs = [];
        for (const r of recipients)
            logs.push(await this.deliver(r, dto.message, user.id));
        return { sent: logs.filter((l) => l.status === 'SENT').length, total: logs.length };
    }
    async resolveRecipients(user, dto) {
        if (dto.studentId) {
            const student = await database_1.prisma.student.findUnique({
                where: { id: dto.studentId },
                include: { guardians: { include: { guardian: true } } },
            });
            if (!student)
                throw api_error_1.ApiError.notFound('Student');
            (0, rbac_1.resolveSchoolScope)(user, student.schoolId);
            return student.guardians
                .filter((g) => g.guardian.receivesSms)
                .map((g) => ({ schoolId: student.schoolId, studentId: student.id, guardianId: g.guardianId, phone: g.guardian.phone }));
        }
        if (dto.guardianId) {
            const g = await database_1.prisma.guardian.findUnique({ where: { id: dto.guardianId } });
            if (!g)
                throw api_error_1.ApiError.notFound('Guardian');
            (0, rbac_1.resolveSchoolScope)(user, g.schoolId);
            return [{ schoolId: g.schoolId, guardianId: g.id, phone: g.phone }];
        }
        if (dto.phone) {
            const schoolId = (0, rbac_1.resolveSchoolScope)(user, undefined);
            if (!schoolId)
                throw api_error_1.ApiError.badRequest('schoolId context required for ad-hoc SMS');
            return [{ schoolId, phone: dto.phone }];
        }
        return [];
    }
    async bulk(user, dto) {
        let sent = 0;
        let total = 0;
        for (const studentId of dto.studentIds) {
            const r = await this.send(user, { message: dto.message, studentId }).catch(() => ({ sent: 0, total: 0 }));
            sent += r.sent;
            total += r.total;
        }
        return { sent, total };
    }
    async history(user, page, limit, requestedSchoolId) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, requestedSchoolId);
        const where = schoolId ? { schoolId } : {};
        const [data, total] = await Promise.all([
            database_1.prisma.notificationLog.findMany({ where, orderBy: { sentAt: 'desc' }, ...(0, validator_1.paginate)(page, limit) }),
            database_1.prisma.notificationLog.count({ where }),
        ]);
        return { data, meta: (0, validator_1.meta)(page, limit, total) };
    }
    async balance() {
        const result = await beem_provider_1.beemProvider.balance();
        return {
            provider: 'beem',
            balance: result.balance,
            error: result.error,
        };
    }
    async sendOverdueReminders(schoolId) {
        const invoices = await database_1.prisma.invoice.findMany({
            where: {
                ...(schoolId ? { schoolId } : {}),
                status: { in: [client_1.InvoiceStatus.UNPAID, client_1.InvoiceStatus.PARTIALLY_PAID, client_1.InvoiceStatus.OVERDUE] },
                dueDate: { lt: new Date() },
                student: { status: 'ACTIVE' },
            },
            include: { student: { include: { guardians: { include: { guardian: true } } } } },
        });
        let sent = 0;
        for (const inv of invoices) {
            const balance = Number(inv.balance);
            for (const g of inv.student.guardians) {
                if (!g.guardian.receivesSms)
                    continue;
                const msg = `Reminder: ${inv.student.fullName}'s fee of TZS ${balance.toLocaleString()} is overdue (due ${new Date(inv.dueDate).toLocaleDateString()}). - Blessing Hope`;
                const log = await this.deliver({ schoolId: inv.schoolId, studentId: inv.studentId, guardianId: g.guardianId, phone: g.guardian.phone }, msg);
                if (log.status === 'SENT')
                    sent++;
            }
        }
        return { invoices: invoices.length, sent };
    }
}
exports.SmsService = SmsService;
exports.smsService = new SmsService();
//# sourceMappingURL=sms.service.js.map