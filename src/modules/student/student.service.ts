import { Prisma, StudentStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolveSchoolScope, assertSameSchool } from '../../middleware/rbac';
import { nextAdmissionNumber } from '../../utils/number-generator';
import { paginate, meta } from '../../utils/validator';
import { AuthUser } from '../../types';
import { CreateStudentDto, UpdateStudentDto, WithdrawDto, ListStudentQuery } from './student.types';

const DETAIL = {
  class: true,
  academicYear: true,
  guardians: { include: { guardian: true } },
  enrollments: { include: { feePackage: true } },
};

export class StudentService {
  async create(user: AuthUser, dto: CreateStudentDto) {
    const schoolId = resolveSchoolScope(user, dto.schoolId);
    if (!schoolId) throw ApiError.badRequest('schoolId is required');

    const [klass, feePackage, academicYear] = await Promise.all([
      prisma.class.findFirst({ where: { id: dto.classId, schoolId } }),
      prisma.feePackage.findFirst({ where: { id: dto.feePackageId, schoolId } }),
      prisma.academicYear.findFirst({ where: { schoolId, isCurrent: true } }),
    ]);
    if (!klass) throw ApiError.badRequest('Class not found in this school');
    if (!feePackage) throw ApiError.badRequest('Fee package not found in this school');
    if (!academicYear) throw ApiError.badRequest('No current academic year set for this school');

    return prisma.$transaction(async (tx) => {
      let guardianId = dto.guardianId;
      if (guardianId) {
        const g = await tx.guardian.findFirst({ where: { id: guardianId, schoolId } });
        if (!g) throw ApiError.badRequest('Guardian not found in this school');
      } else if (dto.guardian) {
        const g = await tx.guardian.upsert({
          where: { schoolId_phone: { schoolId, phone: dto.guardian.phone } },
          update: { fullName: dto.guardian.fullName, relationship: dto.guardian.relationship, email: dto.guardian.email },
          create: {
            schoolId,
            fullName: dto.guardian.fullName,
            phone: dto.guardian.phone,
            relationship: dto.guardian.relationship,
            email: dto.guardian.email,
          },
        });
        guardianId = g.id;
      }

      const admissionNo = await nextAdmissionNumber(tx, schoolId, klass.id, klass.name);

      const student = await tx.student.create({
        data: {
          schoolId,
          admissionNo,
          fullName: dto.fullName,
          dateOfBirth: dto.dateOfBirth,
          gender: dto.gender,
          classId: klass.id,
          academicYearId: academicYear.id,
          createdBy: user.id,
          guardians: guardianId
            ? { create: { guardianId, isPrimaryContact: true } }
            : undefined,
          enrollments: {
            create: {
              feePackageId: feePackage.id,
              academicYearId: academicYear.id,
              isHostel: dto.isHostel,
            },
          },
        },
        include: DETAIL,
      });

      return student;
    });
  }

  async list(user: AuthUser, q: ListStudentQuery) {
    const schoolId = resolveSchoolScope(user, q.schoolId);
    const where: Prisma.StudentWhereInput = {
      ...(schoolId ? { schoolId } : {}),
      ...(q.classId ? { classId: q.classId } : {}),
      ...(q.status ? { status: q.status as StudentStatus } : {}),
      ...(q.q
        ? { OR: [{ fullName: { contains: q.q, mode: 'insensitive' } }, { admissionNo: { contains: q.q, mode: 'insensitive' } }] }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.student.findMany({ where, include: { class: true, guardians: { include: { guardian: true } } }, orderBy: { createdAt: 'desc' }, ...paginate(q.page, q.limit) }),
      prisma.student.count({ where }),
    ]);
    return { data, meta: meta(q.page, q.limit, total) };
  }

  async getById(user: AuthUser, id: string) {
    const student = await prisma.student.findUnique({ where: { id }, include: DETAIL });
    if (!student) throw ApiError.notFound('Student');
    assertSameSchool(user, student.schoolId);
    return student;
  }

  async permanentDelete(user: AuthUser, id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { _count: { select: { invoices: true, payments: true, receipts: true, transactions: true } } },
    });
    if (!student) throw ApiError.notFound('Student');
    assertSameSchool(user, student.schoolId);

    const hasFin = (student._count?.invoices ?? 0) > 0 || (student._count?.payments ?? 0) > 0 ||
      (student._count?.receipts ?? 0) > 0 || (student._count?.transactions ?? 0) > 0;

    if (hasFin) throw ApiError.badRequest(
      'Cannot permanently delete a student with financial records. Withdraw the student instead.'
    );

    return prisma.$transaction(async (tx) => {
      await tx.studentGuardian.deleteMany({ where: { studentId: id } });
      await tx.studentFeeEnrollment.deleteMany({ where: { studentId: id } });
      await tx.student.delete({ where: { id } });
      return { deleted: true, admissionNo: student.admissionNo, fullName: student.fullName };
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateStudentDto) {
    const student = await this.getById(user, id);
    if (dto.classId) {
      const klass = await prisma.class.findFirst({ where: { id: dto.classId, schoolId: student.schoolId } });
      if (!klass) throw ApiError.badRequest('Class not found in this school');
    }
    return prisma.student.update({ where: { id }, data: dto, include: DETAIL });
  }

  async withdraw(user: AuthUser, id: string, dto: WithdrawDto) {
    await this.getById(user, id);
    return prisma.student.update({
      where: { id },
      data: {
        status: dto.status as StudentStatus,
        withdrawalReason: dto.reason,
        withdrawalDate: dto.status === 'WITHDRAWN' ? new Date() : undefined,
      },
    });
  }

  async bulkImport(user: AuthUser, students: CreateStudentDto[]) {
    const results: { index: number; ok: boolean; admissionNo?: string; error?: string }[] = [];
    for (let i = 0; i < students.length; i++) {
      try {
        const s = await this.create(user, students[i]);
        results.push({ index: i, ok: true, admissionNo: s.admissionNo });
      } catch (e: any) {
        results.push({ index: i, ok: false, error: e.message });
      }
    }
    return { total: students.length, succeeded: results.filter((r) => r.ok).length, results };
  }
}

export const studentService = new StudentService();
