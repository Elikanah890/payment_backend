import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { assertSameSchool } from '../../middleware/rbac';
import { paginate, meta } from '../../utils/validator';
import { money } from '../../utils/currency';
import { classService } from '../class/class.service';
import { AuthUser } from '../../types';
import { CreateSchoolDto, UpdateSchoolDto } from './school.types';

export class SchoolService {
  async create(dto: CreateSchoolDto) {
    const school = await prisma.school.create({
      data: {
        name: dto.name,
        subdomain: dto.subdomain,
        phone: dto.phone,
        email: dto.email ?? undefined,
        address: dto.address ?? undefined,
        logoUrl: dto.logoUrl ?? undefined,
        bankName: dto.bankName,
        bankAccount: dto.bankAccount,
        bankAccountName: dto.bankAccountName,
        lateFeeAmount: dto.lateFeeAmount ?? undefined,
        lateFeeGraceDays: dto.lateFeeGraceDays ?? undefined,
        academicYearStart: dto.academicYearStart,
        academicYearEnd: dto.academicYearEnd,
      },
    });
    await classService.seedDefaultClasses(school.id);
    return school;
  }

  async list(user: AuthUser, page: number, limit: number, search?: string, isActive?: boolean) {
    const where: Record<string, unknown> = {};
    if (user.role !== UserRole.SUPER_ADMIN) {
      where.id = user.schoolId ?? '__none__';
    } else {
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { subdomain: { contains: search, mode: 'insensitive' } },
        ];
      }
    }
    const [data, total] = await Promise.all([
      prisma.school.findMany({ where: where as any, orderBy: { createdAt: 'desc' }, ...paginate(page, limit) }),
      prisma.school.count({ where: where as any }),
    ]);
    return { data, meta: meta(page, limit, total) };
  }

  async getById(user: AuthUser, id: string) {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: { select: { students: true, admins: true } },
        admins: { select: { id: true, fullName: true, email: true, isActive: true } },
        classes: { select: { id: true, name: true, level: true, _count: { select: { students: true } } }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!school) throw ApiError.notFound('School');
    assertSameSchool(user, school.id);
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto) {
    await this.ensureExists(id);
    return prisma.school.update({ where: { id }, data: dto as any });
  }

  async deactivate(id: string) {
    await this.ensureExists(id);
    return prisma.school.update({ where: { id }, data: { isActive: false } });
  }

  async reactivate(id: string) {
    await this.ensureExists(id);
    return prisma.school.update({ where: { id }, data: { isActive: true } });
  }

  async stats(user: AuthUser, id: string) {
    const school = await this.getById(user, id);
    const [revenue, collection] = await Promise.all([
      prisma.payment.aggregate({ where: { schoolId: id, status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.invoice.aggregate({ where: { schoolId: id }, _sum: { amount: true, amountPaid: true, balance: true } }),
    ]);
    const invoiced = money(collection._sum.amount ?? 0);
    const collected = money(collection._sum.amountPaid ?? 0);
    return {
      school,
      students: (school as any)._count?.students ?? 0,
      admins: (school as any)._count?.admins ?? 0,
      totalRevenue: money(revenue._sum.amount ?? 0),
      totalInvoiced: invoiced,
      totalCollected: collected,
      outstanding: invoiced.minus(collected),
      collectionRate: invoiced.greaterThan(0) ? collected.dividedBy(invoiced).times(100).toFixed(1) : '0',
    };
  }

  private async ensureExists(id: string) {
    const s = await prisma.school.findUnique({ where: { id }, select: { id: true } });
    if (!s) throw ApiError.notFound('School');
  }
}

export const schoolService = new SchoolService();
