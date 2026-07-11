import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { config } from '../../config/env';
import { ApiError } from '../../utils/api-error';
import { assertSameSchool, resolveSchoolScope } from '../../middleware/rbac';
import { paginate, meta } from '../../utils/validator';
import { AuthUser } from '../../types';
import { CreateAdminDto, UpdateAdminDto, ListAdminQuery } from './admin.types';

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

function tempPassword(): string {
  return crypto.randomBytes(12).toString('base64url').slice(0, 16);
}

export class AdminService {
  async create(dto: CreateAdminDto) {
    const school = await prisma.school.findUnique({ where: { id: dto.schoolId }, select: { id: true } });
    if (!school) throw ApiError.badRequest('School does not exist');

    const plain = dto.password || tempPassword();
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: await bcrypt.hash(plain, config.security.bcryptRounds),
        fullName: dto.fullName,
        phone: dto.phone,
        role: UserRole.ADMIN,
        schoolId: dto.schoolId,
      },
      select: SELECT,
    });
    return { user, tempPassword: plain };
  }

  async list(user: AuthUser, q: ListAdminQuery) {
    const schoolId = resolveSchoolScope(user, q.schoolId);
    const where: Prisma.UserWhereInput = {
      role: UserRole.ADMIN,
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
      prisma.user.findMany({ where, select: SELECT, orderBy: { createdAt: 'desc' }, ...paginate(q.page, q.limit) }),
      prisma.user.count({ where }),
    ]);
    return { data, meta: meta(q.page, q.limit, total) };
  }

  async getById(user: AuthUser, id: string) {
    const admin = await prisma.user.findFirst({ where: { id, role: UserRole.ADMIN }, select: SELECT });
    if (!admin) throw ApiError.notFound('Admin');
    assertSameSchool(user, admin.schoolId);
    return admin;
  }

  async update(actor: AuthUser, id: string, dto: UpdateAdminDto) {
    await this.getById(actor, id);
    return prisma.user.update({ where: { id }, data: dto as Prisma.UserUpdateInput, select: SELECT });
  }

  async deactivate(actor: AuthUser, id: string) {
    const admin = await this.getById(actor, id);
    if (admin.role === UserRole.SUPER_ADMIN) throw ApiError.badRequest('Cannot disable a super admin');
    if (actor.id === id) throw ApiError.badRequest('Cannot disable your own account');
    await prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    return prisma.user.update({ where: { id }, data: { isActive: false }, select: SELECT });
  }

  async enable(actor: AuthUser, id: string) {
    await this.getById(actor, id);
    return prisma.user.update({ where: { id }, data: { isActive: true }, select: SELECT });
  }

  async resetPassword(actor: AuthUser, id: string) {
    const admin = await prisma.user.findFirst({ where: { id, role: UserRole.ADMIN } });
    if (!admin) throw ApiError.notFound('Admin');
    if (admin.role === UserRole.SUPER_ADMIN) throw ApiError.badRequest('Cannot reset a super admin');
    const plain = tempPassword();
    await prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(plain, config.security.bcryptRounds), passwordChangedAt: new Date() },
    });
    await prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    return { tempPassword: plain };
  }

  async activityLog(user: AuthUser, adminId: string, page: number, limit: number) {
    const admin = await prisma.user.findFirst({ where: { id: adminId, role: UserRole.ADMIN }, select: { id: true, schoolId: true } });
    if (!admin) throw ApiError.notFound('Admin');
    assertSameSchool(user, admin.schoolId);

    const where: Prisma.AuditLogWhereInput = { userId: adminId };
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, meta: meta(page, limit, total) };
  }
}

export const adminService = new AdminService();
