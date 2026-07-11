import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolveSchoolScope, assertSameSchool } from '../../middleware/rbac';
import { money } from '../../utils/currency';
import { AuthUser } from '../../types';
import { CreateFeePackageDto, UpdateFeePackageDto } from './fee.types';

export class FeeService {
  async create(user: AuthUser, dto: CreateFeePackageDto) {
    const schoolId = resolveSchoolScope(user, dto.schoolId);
    if (!schoolId) throw ApiError.badRequest('schoolId is required');

    if (dto.classIds?.length) {
      const count = await prisma.class.count({ where: { id: { in: dto.classIds }, schoolId } });
      if (count !== dto.classIds.length) throw ApiError.badRequest('One or more classes are not in this school');
    }

    return prisma.feePackage.create({
      data: {
        schoolId,
        name: dto.name,
        description: dto.description,
        annualFee: money(dto.annualFee),
        installmentType: dto.installmentType,
        installmentCount: dto.installmentCount,
        installmentAmount: money(dto.installmentAmount),
        hostelAvailable: dto.hostelAvailable,
        hostelAnnualFee: dto.hostelAnnualFee != null ? money(dto.hostelAnnualFee) : undefined,
        hostelInstallment: dto.hostelInstallment != null ? money(dto.hostelInstallment) : undefined,
        siblingDiscountEnabled: dto.siblingDiscountEnabled,
        siblingDiscountPercentage: dto.siblingDiscountPercentage != null ? money(dto.siblingDiscountPercentage) : undefined,
        siblingDiscountAppliesAfter: dto.siblingDiscountAppliesAfter,
        classes: dto.classIds?.length ? { create: dto.classIds.map((classId) => ({ classId })) } : undefined,
      },
      include: { classes: { include: { class: true } } },
    });
  }

  async list(user: AuthUser, requestedSchoolId?: string) {
    const schoolId = resolveSchoolScope(user, requestedSchoolId);
    return prisma.feePackage.findMany({
      where: { ...(schoolId ? { schoolId } : {}), isActive: true },
      include: { classes: { include: { class: true } }, _count: { select: { enrollments: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(user: AuthUser, id: string) {
    const pkg = await prisma.feePackage.findUnique({
      where: { id },
      include: { classes: { include: { class: true } } },
    });
    if (!pkg) throw ApiError.notFound('Fee package');
    assertSameSchool(user, pkg.schoolId);
    return pkg;
  }

  async update(user: AuthUser, id: string, dto: UpdateFeePackageDto) {
    await this.getById(user, id);
    const data: Record<string, unknown> = { ...dto };
    for (const k of ['annualFee', 'installmentAmount', 'hostelAnnualFee', 'hostelInstallment', 'siblingDiscountPercentage']) {
      if ((dto as any)[k] != null) data[k] = money((dto as any)[k]);
    }
    return prisma.feePackage.update({ where: { id }, data });
  }

  async deactivate(user: AuthUser, id: string) {
    await this.getById(user, id);
    return prisma.feePackage.update({ where: { id }, data: { isActive: false } });
  }

  async assignClass(user: AuthUser, id: string, classId: string) {
    const pkg = await this.getById(user, id);
    const klass = await prisma.class.findFirst({ where: { id: classId, schoolId: pkg.schoolId } });
    if (!klass) throw ApiError.badRequest('Class not found in this school');
    return prisma.feePackageClass.upsert({
      where: { feePackageId_classId: { feePackageId: id, classId } },
      update: { isActive: true },
      create: { feePackageId: id, classId },
    });
  }
}

export const feeService = new FeeService();
