import { NotificationChannel, NotificationStatus, InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolveSchoolScope } from '../../middleware/rbac';
import { paginate, meta } from '../../utils/validator';
import { AuthUser } from '../../types';
import { beemProvider } from './beem.provider';

interface Recipient {
  schoolId: string;
  studentId?: string;
  guardianId?: string;
  phone: string;
}

export class SmsService {
  private async deliver(rec: Recipient, message: string, createdBy?: string) {
    const result = await beemProvider.sendSms(rec.phone, message);
    return prisma.notificationLog.create({
      data: {
        schoolId: rec.schoolId,
        studentId: rec.studentId,
        guardianId: rec.guardianId,
        channel: NotificationChannel.SMS,
        recipient: rec.phone,
        message,
        senderId: 'BLESSHOPE',
        status: result.ok ? NotificationStatus.SENT : NotificationStatus.FAILED,
        providerRef: result.providerRef,
        error: result.error,
        sentAt: new Date(),
        createdBy,
      },
    });
  }

  async send(user: AuthUser, dto: { message: string; phone?: string; studentId?: string; guardianId?: string }) {
    const recipients = await this.resolveRecipients(user, dto);
    if (!recipients.length) throw ApiError.badRequest('No SMS recipients resolved');
    const logs = [];
    for (const r of recipients) logs.push(await this.deliver(r, dto.message, user.id));
    return { sent: logs.filter((l) => l.status === 'SENT').length, total: logs.length };
  }

  private async resolveRecipients(user: AuthUser, dto: { phone?: string; studentId?: string; guardianId?: string }): Promise<Recipient[]> {
    if (dto.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: dto.studentId },
        include: { guardians: { include: { guardian: true } } },
      });
      if (!student) throw ApiError.notFound('Student');
      resolveSchoolScope(user, student.schoolId);
      return student.guardians
        .filter((g) => g.guardian.receivesSms)
        .map((g) => ({ schoolId: student.schoolId, studentId: student.id, guardianId: g.guardianId, phone: g.guardian.phone }));
    }
    if (dto.guardianId) {
      const g = await prisma.guardian.findUnique({ where: { id: dto.guardianId } });
      if (!g) throw ApiError.notFound('Guardian');
      resolveSchoolScope(user, g.schoolId);
      return [{ schoolId: g.schoolId, guardianId: g.id, phone: g.phone }];
    }
    if (dto.phone) {
      const schoolId = resolveSchoolScope(user, undefined);
      if (!schoolId) throw ApiError.badRequest('schoolId context required for ad-hoc SMS');
      return [{ schoolId, phone: dto.phone }];
    }
    return [];
  }

  async bulk(user: AuthUser, dto: { message: string; studentIds: string[] }) {
    let sent = 0;
    let total = 0;
    for (const studentId of dto.studentIds) {
      const r = await this.send(user, { message: dto.message, studentId }).catch(() => ({ sent: 0, total: 0 }));
      sent += r.sent;
      total += r.total;
    }
    return { sent, total };
  }

  async history(user: AuthUser, page: number, limit: number, requestedSchoolId?: string) {
    const schoolId = resolveSchoolScope(user, requestedSchoolId);
    const where = schoolId ? { schoolId } : {};
    const [data, total] = await Promise.all([
      prisma.notificationLog.findMany({ where, orderBy: { sentAt: 'desc' }, ...paginate(page, limit) }),
      prisma.notificationLog.count({ where }),
    ]);
    return { data, meta: meta(page, limit, total) };
  }

  async balance() {
    const result = await beemProvider.balance();
    return {
      provider: 'beem',
      balance: result.balance,
      error: result.error,
    };
  }

  async sendOverdueReminders(schoolId?: string) {
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(schoolId ? { schoolId } : {}),
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
        dueDate: { lt: new Date() },
        student: { status: 'ACTIVE' },
      },
      include: { student: { include: { guardians: { include: { guardian: true } } } } },
    });

    let sent = 0;
    for (const inv of invoices) {
      const balance = Number(inv.balance);
      for (const g of inv.student.guardians) {
        if (!g.guardian.receivesSms) continue;
        const msg = `Reminder: ${inv.student.fullName}'s fee of TZS ${balance.toLocaleString()} is overdue (due ${new Date(inv.dueDate).toLocaleDateString()}). - Blessing Hope`;
        const log = await this.deliver(
          { schoolId: inv.schoolId, studentId: inv.studentId, guardianId: g.guardianId, phone: g.guardian.phone },
          msg
        );
        if (log.status === 'SENT') sent++;
      }
    }
    return { invoices: invoices.length, sent };
  }
}

export const smsService = new SmsService();
