import { ClassLevel, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolveSchoolScope, assertSameSchool } from '../../middleware/rbac';
import { AuthUser } from '../../types';
import { CreateClassDto, UpdateClassDto } from './class.types';

type Db = Pick<PrismaClient, 'class'>;

const DEFAULT_CLASSES: { name: string; level: ClassLevel; sortOrder: number }[] = [
  { name: 'JNR', level: ClassLevel.PRE_PRIMARY, sortOrder: 1 },
  { name: 'MID', level: ClassLevel.PRE_PRIMARY, sortOrder: 2 },
  { name: 'SNR', level: ClassLevel.PRE_PRIMARY, sortOrder: 3 },
  { name: 'CL1', level: ClassLevel.PRIMARY, sortOrder: 4 },
  { name: 'CL2', level: ClassLevel.PRIMARY, sortOrder: 5 },
  { name: 'CL3', level: ClassLevel.PRIMARY, sortOrder: 6 },
  { name: 'CL4', level: ClassLevel.PRIMARY, sortOrder: 7 },
];

export class ClassService {
  async list(user: AuthUser, requestedSchoolId?: string, includeInactive?: boolean) {
    const schoolId = resolveSchoolScope(user, requestedSchoolId);
    if (!schoolId) throw ApiError.badRequest('schoolId is required');
    return prisma.class.findMany({
      where: { schoolId, ...(includeInactive ? {} : { isActive: true }) },
      include: {
        _count: { select: { students: true } },
        feePackageClasses: { include: { feePackage: { select: { id: true, name: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(user: AuthUser, dto: CreateClassDto) {
    const schoolId = resolveSchoolScope(user, dto.schoolId);
    if (!schoolId) throw ApiError.badRequest('schoolId is required');

    const existing = await prisma.class.findUnique({ where: { schoolId_name: { schoolId, name: dto.name } } });
    if (existing) throw ApiError.conflict('A class with this name already exists in this school');

    return prisma.class.create({
      data: {
        schoolId,
        name: dto.name,
        level: dto.level as ClassLevel,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async getById(user: AuthUser, id: string) {
    const klass = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: { select: { students: true } },
        feePackageClasses: { include: { feePackage: { select: { id: true, name: true } } } },
      },
    });
    if (!klass) throw ApiError.notFound('Class');
    assertSameSchool(user, klass.schoolId);
    return klass;
  }

  async update(user: AuthUser, id: string, dto: UpdateClassDto) {
    const klass = await this.getById(user, id);
    if (dto.name && dto.name !== klass.name) {
      const clash = await prisma.class.findUnique({ where: { schoolId_name: { schoolId: klass.schoolId, name: dto.name } } });
      if (clash) throw ApiError.conflict('A class with this name already exists in this school');
    }
    return prisma.class.update({ where: { id }, data: dto as Prisma.ClassUpdateInput });
  }

  async setActive(user: AuthUser, id: string, isActive: boolean) {
    await this.getById(user, id);
    return prisma.class.update({ where: { id }, data: { isActive } });
  }

  // Seeds the standard class set for a freshly created school. Idempotent.
  async seedDefaultClasses(schoolId: string, db: Db = prisma) {
    for (const c of DEFAULT_CLASSES) {
      try {
        await db.class.create({ data: { schoolId, ...c } });
      } catch {
        /* skip duplicates */
      }
    }
  }
}

export const classService = new ClassService();
