import { Prisma, AuditAction, BackupStatus, BackupType, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { config } from '../../config/env';
import { ApiError } from '../../utils/api-error';
import { resolveSchoolScope } from '../../middleware/rbac';
import { money } from '../../utils/currency';
import { paginate, meta } from '../../utils/validator';
import { AuthUser } from '../../types';

export class SystemService {
  async listAuditLogs(
    user: AuthUser,
    opts: {
      page: number;
      limit: number;
      action?: string;
      schoolId?: string;
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    }
  ) {
    const scope = user.role === UserRole.SUPER_ADMIN ? opts.schoolId : user.schoolId ?? '__none__';
    const where: Prisma.AuditLogWhereInput = {
      ...(scope ? { schoolId: scope } : {}),
      ...(opts.action ? { action: opts.action as AuditAction } : {}),
      ...(opts.userId ? { userId: opts.userId } : {}),
      ...(opts.dateFrom || opts.dateTo
        ? {
            createdAt: {
              ...(opts.dateFrom ? { gte: new Date(opts.dateFrom) } : {}),
              ...(opts.dateTo ? { lte: new Date(opts.dateTo + 'T23:59:59Z') } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        ...paginate(opts.page, opts.limit),
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, meta: meta(opts.page, opts.limit, total) };
  }

  async getAuditActions(): Promise<string[]> {
    const rows = await prisma.auditLog.findMany({ distinct: ['action'], select: { action: true }, take: 100 });
    return rows.map((r) => r.action);
  }

  async health(): Promise<Record<string, { ok: boolean; message: string }>> {
    const results: Record<string, { ok: boolean; message: string }> = {};

    try {
      await prisma.$queryRaw`SELECT 1`;
      results.database = { ok: true, message: 'Connected' };
    } catch (e: any) {
      results.database = { ok: false, message: e.message };
    }

    try {
      await redis.ping();
      results.redis = { ok: true, message: 'Connected' };
    } catch (e: any) {
      results.redis = { ok: false, message: e.message };
    }

    results.sms = config.beem.apiKey
      ? { ok: true, message: 'Configured (' + config.beem.senderId + ')' }
      : { ok: false, message: 'Not configured — set BEEM_API_KEY' };

    results.payment_gateway = config.selcom.apiKey
      ? { ok: true, message: 'Configured (' + config.selcom.environment + ')' }
      : { ok: false, message: 'Not configured — set SELCOM_API_KEY' };

    const backupCount = await prisma.backupRecord.count();
    const lastBackup = await prisma.backupRecord.findFirst({
      where: { status: BackupStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true, fileName: true },
    });

    results.backups = {
      ok: backupCount > 0,
      message: backupCount > 0 ? `${backupCount} total, last ${lastBackup?.fileName || 'unknown'}` : 'No backups found',
    };

    return results;
  }

  async metrics(): Promise<Record<string, unknown>> {
    const [schools, admins, students, payments] = await Promise.all([
      prisma.school.count(),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true }, _count: true }),
    ]);
    return {
      schools,
      admins,
      students,
      totalRevenue: money(payments._sum.amount ?? 0),
      totalTransactions: payments._count,
      uptime: process.uptime(),
    };
  }

  async superAdminDashboard() {
    const [schools, admins, students, revenue] = await Promise.all([
      prisma.school.count(),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    ]);

    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { fullName: true } }, school: { select: { name: true } } },
    });

    const schoolList = await prisma.school.findMany({
      select: { id: true, name: true, subdomain: true, _count: { select: { admins: true, students: true } } },
      orderBy: { name: 'asc' },
    });

    const schoolRevenue = await prisma.payment.groupBy({
      by: ['schoolId'],
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });
    const revMap = new Map(schoolRevenue.map((r) => [r.schoolId, money(r._sum.amount ?? 0)]));

    return {
      counts: {
        schools,
        admins,
        students,
        totalRevenue: money(revenue._sum.amount ?? 0),
      },
      recentActivity,
      schools: schoolList.map((s) => ({
        id: s.id,
        name: s.name,
        subdomain: s.subdomain,
        admins: s._count.admins,
        students: s._count.students,
        revenue: revMap.get(s.id) ?? money(0),
      })),
    };
  }

  async getConfig(user: AuthUser, schoolIdReq?: string) {
    const schoolId = resolveSchoolScope(user, schoolIdReq);
    if (!schoolId) throw ApiError.badRequest('schoolId is required');
    return prisma.systemConfig.findMany({ where: { schoolId }, orderBy: { key: 'asc' } });
  }

  async setConfig(user: AuthUser, schoolIdReq: string | undefined, key: string, value: Prisma.InputJsonValue, description?: string) {
    const schoolId = resolveSchoolScope(user, schoolIdReq);
    if (!schoolId) throw ApiError.badRequest('schoolId is required');
    return prisma.systemConfig.upsert({
      where: { schoolId_key: { schoolId, key } },
      update: { value, description, updatedBy: user.id },
      create: { schoolId, key, value, description, updatedBy: user.id },
    });
  }

  async createBackup(user: AuthUser) {
    const record = await prisma.backupRecord.create({
      data: {
        backupType: BackupType.FULL,
        fileName: `manual-${Date.now()}.sql.gz`,
        fileSize: 0,
        filePath: 'pending',
        status: BackupStatus.IN_PROGRESS,
        createdBy: user.id,
      },
    });
    return record;
  }

  async listBackups() {
    return prisma.backupRecord.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }
}

export const systemService = new SystemService();
