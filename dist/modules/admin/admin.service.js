"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const validator_1 = require("../../utils/validator");
const SELECT = {
    id: true,
    email: true,
    fullName: true,
    phone: true,
    role: true,
    schoolId: true,
    isActive: true,
    lastLogin: true,
    createdAt: true,
    passwordChangedAt: true,
    school: { select: { id: true, name: true } },
};
function tempPassword() {
    return crypto_1.default.randomBytes(12).toString('base64url').slice(0, 16);
}
class AdminService {
    async create(dto) {
        const school = await database_1.prisma.school.findUnique({ where: { id: dto.schoolId }, select: { id: true } });
        if (!school)
            throw api_error_1.ApiError.badRequest('School does not exist');
        const plain = dto.password || tempPassword();
        const user = await database_1.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: await bcrypt_1.default.hash(plain, env_1.config.security.bcryptRounds),
                fullName: dto.fullName,
                phone: dto.phone,
                role: client_1.UserRole.ADMIN,
                schoolId: dto.schoolId,
            },
            select: SELECT,
        });
        return { user, tempPassword: plain };
    }
    async list(user, q) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, q.schoolId);
        const where = {
            role: client_1.UserRole.ADMIN,
            ...(schoolId ? { schoolId } : {}),
            ...(q.isActive !== undefined ? { isActive: q.isActive } : {}),
            ...(q.search
                ? {
                    OR: [
                        { fullName: { contains: q.search, mode: 'insensitive' } },
                        { email: { contains: q.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [data, total] = await Promise.all([
            database_1.prisma.user.findMany({ where, select: SELECT, orderBy: { createdAt: 'desc' }, ...(0, validator_1.paginate)(q.page, q.limit) }),
            database_1.prisma.user.count({ where }),
        ]);
        return { data, meta: (0, validator_1.meta)(q.page, q.limit, total) };
    }
    async getById(user, id) {
        const admin = await database_1.prisma.user.findFirst({ where: { id, role: client_1.UserRole.ADMIN }, select: SELECT });
        if (!admin)
            throw api_error_1.ApiError.notFound('Admin');
        (0, rbac_1.assertSameSchool)(user, admin.schoolId);
        return admin;
    }
    async update(actor, id, dto) {
        await this.getById(actor, id);
        return database_1.prisma.user.update({ where: { id }, data: dto, select: SELECT });
    }
    async deactivate(actor, id) {
        const admin = await this.getById(actor, id);
        if (admin.role === client_1.UserRole.SUPER_ADMIN)
            throw api_error_1.ApiError.badRequest('Cannot disable a super admin');
        if (actor.id === id)
            throw api_error_1.ApiError.badRequest('Cannot disable your own account');
        await database_1.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
        return database_1.prisma.user.update({ where: { id }, data: { isActive: false }, select: SELECT });
    }
    async enable(actor, id) {
        await this.getById(actor, id);
        return database_1.prisma.user.update({ where: { id }, data: { isActive: true }, select: SELECT });
    }
    async resetPassword(actor, id) {
        const admin = await database_1.prisma.user.findFirst({ where: { id, role: client_1.UserRole.ADMIN } });
        if (!admin)
            throw api_error_1.ApiError.notFound('Admin');
        if (admin.role === client_1.UserRole.SUPER_ADMIN)
            throw api_error_1.ApiError.badRequest('Cannot reset a super admin');
        const plain = tempPassword();
        await database_1.prisma.user.update({
            where: { id },
            data: { passwordHash: await bcrypt_1.default.hash(plain, env_1.config.security.bcryptRounds), passwordChangedAt: new Date() },
        });
        await database_1.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
        return { tempPassword: plain };
    }
    async activityLog(user, adminId, page, limit) {
        const admin = await database_1.prisma.user.findFirst({ where: { id: adminId, role: client_1.UserRole.ADMIN }, select: { id: true, schoolId: true } });
        if (!admin)
            throw api_error_1.ApiError.notFound('Admin');
        (0, rbac_1.assertSameSchool)(user, admin.schoolId);
        const where = { userId: adminId };
        const [data, total] = await Promise.all([
            database_1.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                ...(0, validator_1.paginate)(page, limit),
            }),
            database_1.prisma.auditLog.count({ where }),
        ]);
        return { data, meta: (0, validator_1.meta)(page, limit, total) };
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
//# sourceMappingURL=admin.service.js.map