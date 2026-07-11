import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { redisGet, redisSet, redisDel, redisIncr, redisExpire } from '../../config/redis';
import { config } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/api-error';
import { signAccessToken, generateRefreshToken, hashToken } from '../../utils/jwt';
import { refreshExpiryDate } from '../../config/auth';
import { recordAudit } from '../../middleware/audit';
import { AuthUser } from '../../types';
import { ChangePasswordDto } from './auth.types';

interface Ctx {
  ip?: string;
  userAgent?: string;
}

function toAuthUser(u: { id: string; email: string; role: UserRole; schoolId: string | null }): AuthUser {
  return { id: u.id, email: u.email, role: u.role, schoolId: u.schoolId };
}

export class AuthService {
  private failKey = (email: string) => `login:fail:${email.toLowerCase()}`;
  private lockKey = (email: string) => `login:lock:${email.toLowerCase()}`;

  private async assertNotLocked(email: string): Promise<void> {
    try {
      if (await redisGet(this.lockKey(email))) {
        throw ApiError.tooMany('Account temporarily locked. Try again later.');
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }
  }

  private async registerFailure(email: string): Promise<void> {
    try {
      const n = await redisIncr(this.failKey(email));
      if (n === 1) await redisExpire(this.failKey(email), config.security.loginLockMinutes * 60);
      if (n !== null && n >= config.security.loginMaxAttempts) {
        await redisSet(this.lockKey(email), '1', 'EX', config.security.loginLockMinutes * 60);
        await redisDel(this.failKey(email));
      }
    } catch {
      /* fail-open */
    }
  }

  private async clearFailures(email: string): Promise<void> {
    try {
      await redisDel(this.failKey(email), this.lockKey(email));
    } catch {
      /* ignore */
    }
  }

  async login(email: string, password: string, ctx: Ctx) {
    await this.assertNotLocked(email);

    const user = await prisma.user.findUnique({ where: { email }, include: { school: true } });
    if (!user || !user.isActive) {
      await this.registerFailure(email);
      throw ApiError.unauthorized('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.registerFailure(email);
      throw ApiError.unauthorized('Invalid credentials');
    }

    await this.clearFailures(email);
    const tokens = await this.issueTokens(toAuthUser(user), ctx);
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    await recordAudit({
      userId: user.id,
      schoolId: user.schoolId,
      action: 'USER_LOGIN',
      tableName: 'User',
      recordId: user.id,
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    logger.info(`Login: ${user.email}`);
    return { user: this.publicUser(user), ...tokens };
  }

  private async issueTokens(user: AuthUser, ctx: Ctx) {
    const accessToken = signAccessToken(user);
    const { token: refreshToken, hash } = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        tokenHash: hash,
        userId: user.id,
        expiresAt: refreshExpiryDate(),
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
      },
    });
    return { accessToken, refreshToken };
  }

  async refresh(rawToken: string, ctx: Ctx) {
    if (!rawToken) throw ApiError.unauthorized('Refresh token required');
    const hash = hashToken(rawToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || !stored.user.isActive) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // rotate
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const tokens = await this.issueTokens(toAuthUser(stored.user), ctx);
    return { user: this.publicUser(stored.user), ...tokens };
  }

  async logout(rawToken: string | undefined, userId?: string) {
    if (rawToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(rawToken) },
        data: { revokedAt: new Date() },
      });
    } else if (userId) {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User');
    const valid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!valid) throw ApiError.badRequest('Current password is incorrect');

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, config.security.bcryptRounds),
        passwordChangedAt: new Date(),
      },
    });
    // invalidate existing sessions
    await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    await recordAudit({ userId, schoolId: user.schoolId, action: 'PASSWORD_CHANGED', tableName: 'User', recordId: userId });
  }

  async resetPassword(actor: AuthUser, targetUserId: string, newPassword: string) {
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw ApiError.notFound('User');
    if (target.role === UserRole.SUPER_ADMIN) throw ApiError.forbidden('Cannot reset a super admin here');

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        passwordHash: await bcrypt.hash(newPassword, config.security.bcryptRounds),
        passwordChangedAt: new Date(),
      },
    });
    await prisma.refreshToken.updateMany({ where: { userId: targetUserId, revokedAt: null }, data: { revokedAt: new Date() } });
    await recordAudit({
      userId: actor.id,
      schoolId: target.schoolId,
      action: 'PASSWORD_RESET',
      tableName: 'User',
      recordId: targetUserId,
    });
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { school: true } });
    if (!user) throw ApiError.notFound('User');
    return this.publicUser(user);
  }

  async updateProfile(userId: string, dto: { fullName?: string; phone?: string; email?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User');
    if (dto.email && dto.email !== user.email) {
      const clash = await prisma.user.findUnique({ where: { email: dto.email } });
      if (clash) throw ApiError.conflict('Email already in use');
    }
    await prisma.user.update({ where: { id: userId }, data: dto });
    return this.publicUser(await prisma.user.findUnique({ where: { id: userId }, include: { school: true } }));
  }

  private publicUser(u: any) {
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

export const authService = new AuthService();
