"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentService = exports.StudentService = void 0;
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const number_generator_1 = require("../../utils/number-generator");
const validator_1 = require("../../utils/validator");
const DETAIL = {
    class: true,
    academicYear: true,
    guardians: { include: { guardian: true } },
    enrollments: { include: { feePackage: true } },
};
class StudentService {
    async create(user, dto) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, dto.schoolId);
        if (!schoolId)
            throw api_error_1.ApiError.badRequest('schoolId is required');
        const [klass, feePackage, academicYear] = await Promise.all([
            database_1.prisma.class.findFirst({ where: { id: dto.classId, schoolId } }),
            database_1.prisma.feePackage.findFirst({ where: { id: dto.feePackageId, schoolId } }),
            database_1.prisma.academicYear.findFirst({ where: { schoolId, isCurrent: true } }),
        ]);
        if (!klass)
            throw api_error_1.ApiError.badRequest('Class not found in this school');
        if (!feePackage)
            throw api_error_1.ApiError.badRequest('Fee package not found in this school');
        if (!academicYear)
            throw api_error_1.ApiError.badRequest('No current academic year set for this school');
        return database_1.prisma.$transaction(async (tx) => {
            let guardianId = dto.guardianId;
            if (guardianId) {
                const g = await tx.guardian.findFirst({ where: { id: guardianId, schoolId } });
                if (!g)
                    throw api_error_1.ApiError.badRequest('Guardian not found in this school');
            }
            else if (dto.guardian) {
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
            const admissionNo = await (0, number_generator_1.nextAdmissionNumber)(tx, schoolId, klass.id, klass.name);
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
    async list(user, q) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, q.schoolId);
        const where = {
            ...(schoolId ? { schoolId } : {}),
            ...(q.classId ? { classId: q.classId } : {}),
            ...(q.status ? { status: q.status } : {}),
            ...(q.q
                ? { OR: [{ fullName: { contains: q.q, mode: 'insensitive' } }, { admissionNo: { contains: q.q, mode: 'insensitive' } }] }
                : {}),
        };
        const [data, total] = await Promise.all([
            database_1.prisma.student.findMany({ where, include: { class: true, guardians: { include: { guardian: true } } }, orderBy: { createdAt: 'desc' }, ...(0, validator_1.paginate)(q.page, q.limit) }),
            database_1.prisma.student.count({ where }),
        ]);
        return { data, meta: (0, validator_1.meta)(q.page, q.limit, total) };
    }
    async getById(user, id) {
        const student = await database_1.prisma.student.findUnique({ where: { id }, include: DETAIL });
        if (!student)
            throw api_error_1.ApiError.notFound('Student');
        (0, rbac_1.assertSameSchool)(user, student.schoolId);
        return student;
    }
    async permanentDelete(user, id) {
        const student = await database_1.prisma.student.findUnique({
            where: { id },
            include: { _count: { select: { invoices: true, payments: true, receipts: true, transactions: true } } },
        });
        if (!student)
            throw api_error_1.ApiError.notFound('Student');
        (0, rbac_1.assertSameSchool)(user, student.schoolId);
        const hasFin = (student._count?.invoices ?? 0) > 0 || (student._count?.payments ?? 0) > 0 ||
            (student._count?.receipts ?? 0) > 0 || (student._count?.transactions ?? 0) > 0;
        if (hasFin)
            throw api_error_1.ApiError.badRequest('Cannot permanently delete a student with financial records. Withdraw the student instead.');
        return database_1.prisma.$transaction(async (tx) => {
            await tx.studentGuardian.deleteMany({ where: { studentId: id } });
            await tx.studentFeeEnrollment.deleteMany({ where: { studentId: id } });
            await tx.student.delete({ where: { id } });
            return { deleted: true, admissionNo: student.admissionNo, fullName: student.fullName };
        });
    }
    async update(user, id, dto) {
        const student = await this.getById(user, id);
        if (dto.classId) {
            const klass = await database_1.prisma.class.findFirst({ where: { id: dto.classId, schoolId: student.schoolId } });
            if (!klass)
                throw api_error_1.ApiError.badRequest('Class not found in this school');
        }
        return database_1.prisma.student.update({ where: { id }, data: dto, include: DETAIL });
    }
    async withdraw(user, id, dto) {
        await this.getById(user, id);
        return database_1.prisma.student.update({
            where: { id },
            data: {
                status: dto.status,
                withdrawalReason: dto.reason,
                withdrawalDate: dto.status === 'WITHDRAWN' ? new Date() : undefined,
            },
        });
    }
    async bulkImport(user, students) {
        const results = [];
        for (let i = 0; i < students.length; i++) {
            try {
                const s = await this.create(user, students[i]);
                results.push({ index: i, ok: true, admissionNo: s.admissionNo });
            }
            catch (e) {
                results.push({ index: i, ok: false, error: e.message });
            }
        }
        return { total: students.length, succeeded: results.filter((r) => r.ok).length, results };
    }
}
exports.StudentService = StudentService;
exports.studentService = new StudentService();
//# sourceMappingURL=student.service.js.map