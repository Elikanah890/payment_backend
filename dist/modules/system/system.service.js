"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemService = exports.SystemService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const env_1 = require("../../config/env");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const currency_1 = require("../../utils/currency");
const validator_1 = require("../../utils/validator");
class SystemService {
    async listAuditLogs(user, opts) {
        const scope = user.role === client_1.UserRole.SUPER_ADMIN ? opts.schoolId : user.schoolId ?? '__none__';
        const where = {
            ...(scope ? { schoolId: scope } : {}),
            ...(opts.action ? { action: opts.action } : {}),
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
            database_1.prisma.auditLog.findMany({
                where,
                include: { user: { select: { fullName: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                ...(0, validator_1.paginate)(opts.page, opts.limit),
            }),
            database_1.prisma.auditLog.count({ where }),
        ]);
        return { data, meta: (0, validator_1.meta)(opts.page, opts.limit, total) };
    }
    async getAuditActions() {
        const rows = await database_1.prisma.auditLog.findMany({ distinct: ['action'], select: { action: true }, take: 100 });
        return rows.map((r) => r.action);
    }
    async health() {
        const results = {};
        try {
            await database_1.prisma.$queryRaw `SELECT 1`;
            results.database = { ok: true, message: 'Connected' };
        }
        catch (e) {
            results.database = { ok: false, message: e.message };
        }
        try {
            await redis_1.redis.ping();
            results.redis = { ok: true, message: 'Connected' };
        }
        catch (e) {
            results.redis = { ok: false, message: e.message };
        }
        results.sms = env_1.config.beem.apiKey
            ? { ok: true, message: 'Configured (' + env_1.config.beem.senderId + ')' }
            : { ok: false, message: 'Not configured — set BEEM_API_KEY' };
        results.payment_gateway = env_1.config.selcom.apiKey
            ? { ok: true, message: 'Configured (' + env_1.config.selcom.environment + ')' }
            : { ok: false, message: 'Not configured — set SELCOM_API_KEY' };
        const backupCount = await database_1.prisma.backupRecord.count();
        const lastBackup = await database_1.prisma.backupRecord.findFirst({
            where: { status: client_1.BackupStatus.COMPLETED },
            orderBy: { completedAt: 'desc' },
            select: { completedAt: true, fileName: true },
        });
        results.backups = {
            ok: backupCount > 0,
            message: backupCount > 0 ? `${backupCount} total, last ${lastBackup?.fileName || 'unknown'}` : 'No backups found',
        };
        return results;
    }
    async metrics() {
        const [schools, admins, students, payments] = await Promise.all([
            database_1.prisma.school.count(),
            database_1.prisma.user.count({ where: { role: client_1.UserRole.ADMIN } }),
            database_1.prisma.student.count({ where: { status: 'ACTIVE' } }),
            database_1.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true }, _count: true }),
        ]);
        return {
            schools,
            admins,
            students,
            totalRevenue: (0, currency_1.money)(payments._sum.amount ?? 0),
            totalTransactions: payments._count,
            uptime: process.uptime(),
        };
    }
    async superAdminDashboard() {
        const [schools, admins, students, revenue] = await Promise.all([
            database_1.prisma.school.count(),
            database_1.prisma.user.count({ where: { role: client_1.UserRole.ADMIN } }),
            database_1.prisma.student.count({ where: { status: 'ACTIVE' } }),
            database_1.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
        ]);
        const recentActivity = await database_1.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { fullName: true } }, school: { select: { name: true } } },
        });
        const schoolList = await database_1.prisma.school.findMany({
            select: { id: true, name: true, subdomain: true, _count: { select: { admins: true, students: true } } },
            orderBy: { name: 'asc' },
        });
        const schoolRevenue = await database_1.prisma.payment.groupBy({
            by: ['schoolId'],
            where: { status: 'COMPLETED' },
            _sum: { amount: true },
        });
        const revMap = new Map(schoolRevenue.map((r) => [r.schoolId, (0, currency_1.money)(r._sum.amount ?? 0)]));
        return {
            counts: {
                schools,
                admins,
                students,
                totalRevenue: (0, currency_1.money)(revenue._sum.amount ?? 0),
            },
            recentActivity,
            schools: schoolList.map((s) => ({
                id: s.id,
                name: s.name,
                subdomain: s.subdomain,
                admins: s._count.admins,
                students: s._count.students,
                revenue: revMap.get(s.id) ?? (0, currency_1.money)(0),
            })),
        };
    }
    async getConfig(user, schoolIdReq) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, schoolIdReq);
        if (!schoolId)
            throw api_error_1.ApiError.badRequest('schoolId is required');
        return database_1.prisma.systemConfig.findMany({ where: { schoolId }, orderBy: { key: 'asc' } });
    }
    async setConfig(user, schoolIdReq, key, value, description) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, schoolIdReq);
        if (!schoolId)
            throw api_error_1.ApiError.badRequest('schoolId is required');
        return database_1.prisma.systemConfig.upsert({
            where: { schoolId_key: { schoolId, key } },
            update: { value, description, updatedBy: user.id },
            create: { schoolId, key, value, description, updatedBy: user.id },
        });
    }
    async createBackup(user) {
        const record = await database_1.prisma.backupRecord.create({
            data: {
                backupType: client_1.BackupType.FULL,
                fileName: `manual-${Date.now()}.sql.gz`,
                fileSize: 0,
                filePath: 'pending',
                status: client_1.BackupStatus.IN_PROGRESS,
                createdBy: user.id,
            },
        });
        return record;
    }
    async listBackups() {
        return database_1.prisma.backupRecord.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    }
}
exports.SystemService = SystemService;
exports.systemService = new SystemService();
//# sourceMappingURL=system.service.js.map