"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const api_error_1 = require("../../utils/api-error");
const jwt_1 = require("../../utils/jwt");
const auth_1 = require("../../config/auth");
const audit_1 = require("../../middleware/audit");
function toAuthUser(u) {
    return { id: u.id, email: u.email, role: u.role, schoolId: u.schoolId };
}
class AuthService {
    constructor() {
        this.failKey = (email) => `login:fail:${email.toLowerCase()}`;
        this.lockKey = (email) => `login:lock:${email.toLowerCase()}`;
    }
    async assertNotLocked(email) {
        try {
            if (await redis_1.redis.get(this.lockKey(email))) {
                throw api_error_1.ApiError.tooMany('Account temporarily locked. Try again later.');
            }
        }
        catch (e) {
            if (e instanceof api_error_1.ApiError)
                throw e;
        }
    }
    async registerFailure(email) {
        try {
            const n = await redis_1.redis.incr(this.failKey(email));
            if (n === 1)
                await redis_1.redis.expire(this.failKey(email), env_1.config.security.loginLockMinutes * 60);
            if (n >= env_1.config.security.loginMaxAttempts) {
                await redis_1.redis.set(this.lockKey(email), '1', 'EX', env_1.config.security.loginLockMinutes * 60);
                await redis_1.redis.del(this.failKey(email));
            }
        }
        catch {
            /* fail-open */
        }
    }
    async clearFailures(email) {
        try {
            await redis_1.redis.del(this.failKey(email), this.lockKey(email));
        }
        catch {
            /* ignore */
        }
    }
    async login(email, password, ctx) {
        await this.assertNotLocked(email);
        const user = await database_1.prisma.user.findUnique({ where: { email }, include: { school: true } });
        if (!user || !user.isActive) {
            await this.registerFailure(email);
            throw api_error_1.ApiError.unauthorized('Invalid credentials');
        }
        const valid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!valid) {
            await this.registerFailure(email);
            throw api_error_1.ApiError.unauthorized('Invalid credentials');
        }
        await this.clearFailures(email);
        const tokens = await this.issueTokens(toAuthUser(user), ctx);
        await database_1.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
        await (0, audit_1.recordAudit)({
            userId: user.id,
            schoolId: user.schoolId,
            action: 'USER_LOGIN',
            tableName: 'User',
            recordId: user.id,
            ipAddress: ctx.ip,
            userAgent: ctx.userAgent,
        });
        logger_1.logger.info(`Login: ${user.email}`);
        return { user: this.publicUser(user), ...tokens };
    }
    async issueTokens(user, ctx) {
        const accessToken = (0, jwt_1.signAccessToken)(user);
        const { token: refreshToken, hash } = (0, jwt_1.generateRefreshToken)();
        await database_1.prisma.refreshToken.create({
            data: {
                tokenHash: hash,
                userId: user.id,
                expiresAt: (0, auth_1.refreshExpiryDate)(),
                ipAddress: ctx.ip,
                userAgent: ctx.userAgent,
            },
        });
        return { accessToken, refreshToken };
    }
    async refresh(rawToken, ctx) {
        if (!rawToken)
            throw api_error_1.ApiError.unauthorized('Refresh token required');
        const hash = (0, jwt_1.hashToken)(rawToken);
        const stored = await database_1.prisma.refreshToken.findUnique({
            where: { tokenHash: hash },
            include: { user: true },
        });
        if (!stored || stored.revokedAt || stored.expiresAt < new Date() || !stored.user.isActive) {
            throw api_error_1.ApiError.unauthorized('Invalid or expired refresh token');
        }
        // rotate
        await database_1.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
        const tokens = await this.issueTokens(toAuthUser(stored.user), ctx);
        return { user: this.publicUser(stored.user), ...tokens };
    }
    async logout(rawToken, userId) {
        if (rawToken) {
            await database_1.prisma.refreshToken.updateMany({
                where: { tokenHash: (0, jwt_1.hashToken)(rawToken) },
                data: { revokedAt: new Date() },
            });
        }
        else if (userId) {
            await database_1.prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
    }
    async changePassword(userId, dto) {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw api_error_1.ApiError.notFound('User');
        const valid = await bcrypt_1.default.compare(dto.oldPassword, user.passwordHash);
        if (!valid)
            throw api_error_1.ApiError.badRequest('Current password is incorrect');
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: await bcrypt_1.default.hash(dto.newPassword, env_1.config.security.bcryptRounds),
                passwordChangedAt: new Date(),
            },
        });
        // invalidate existing sessions
        await database_1.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
        await (0, audit_1.recordAudit)({ userId, schoolId: user.schoolId, action: 'PASSWORD_CHANGED', tableName: 'User', recordId: userId });
    }
    async resetPassword(actor, targetUserId, newPassword) {
        const target = await database_1.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!target)
            throw api_error_1.ApiError.notFound('User');
        if (target.role === client_1.UserRole.SUPER_ADMIN)
            throw api_error_1.ApiError.forbidden('Cannot reset a super admin here');
        await database_1.prisma.user.update({
            where: { id: targetUserId },
            data: {
                passwordHash: await bcrypt_1.default.hash(newPassword, env_1.config.security.bcryptRounds),
                passwordChangedAt: new Date(),
            },
        });
        await database_1.prisma.refreshToken.updateMany({ where: { userId: targetUserId, revokedAt: null }, data: { revokedAt: new Date() } });
        await (0, audit_1.recordAudit)({
            userId: actor.id,
            schoolId: target.schoolId,
            action: 'PASSWORD_RESET',
            tableName: 'User',
            recordId: targetUserId,
        });
    }
    async me(userId) {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId }, include: { school: true } });
        if (!user)
            throw api_error_1.ApiError.notFound('User');
        return this.publicUser(user);
    }
    async updateProfile(userId, dto) {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw api_error_1.ApiError.notFound('User');
        if (dto.email && dto.email !== user.email) {
            const clash = await database_1.prisma.user.findUnique({ where: { email: dto.email } });
            if (clash)
                throw api_error_1.ApiError.conflict('Email already in use');
        }
        await database_1.prisma.user.update({ where: { id: userId }, data: dto });
        return this.publicUser(await database_1.prisma.user.findUnique({ where: { id: userId }, include: { school: true } }));
    }
    publicUser(u) {
        return {
            id: u.id,
            email: u.email,
            fullName: u.fullName,
            phone: u.phone,
            role: u.role,
            schoolId: u.schoolId,
            school: u.school ? { id: u.school.id, name: u.school.name, subdomain: u.school.subdomain } : null,
            lastLogin: u.lastLogin,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map