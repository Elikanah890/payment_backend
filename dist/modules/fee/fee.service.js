"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeService = exports.FeeService = void 0;
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const currency_1 = require("../../utils/currency");
class FeeService {
    async create(user, dto) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, dto.schoolId);
        if (!schoolId)
            throw api_error_1.ApiError.badRequest('schoolId is required');
        if (dto.classIds?.length) {
            const count = await database_1.prisma.class.count({ where: { id: { in: dto.classIds }, schoolId } });
            if (count !== dto.classIds.length)
                throw api_error_1.ApiError.badRequest('One or more classes are not in this school');
        }
        return database_1.prisma.feePackage.create({
            data: {
                schoolId,
                name: dto.name,
                description: dto.description,
                annualFee: (0, currency_1.money)(dto.annualFee),
                installmentType: dto.installmentType,
                installmentCount: dto.installmentCount,
                installmentAmount: (0, currency_1.money)(dto.installmentAmount),
                hostelAvailable: dto.hostelAvailable,
                hostelAnnualFee: dto.hostelAnnualFee != null ? (0, currency_1.money)(dto.hostelAnnualFee) : undefined,
                hostelInstallment: dto.hostelInstallment != null ? (0, currency_1.money)(dto.hostelInstallment) : undefined,
                siblingDiscountEnabled: dto.siblingDiscountEnabled,
                siblingDiscountPercentage: dto.siblingDiscountPercentage != null ? (0, currency_1.money)(dto.siblingDiscountPercentage) : undefined,
                siblingDiscountAppliesAfter: dto.siblingDiscountAppliesAfter,
                classes: dto.classIds?.length ? { create: dto.classIds.map((classId) => ({ classId })) } : undefined,
            },
            include: { classes: { include: { class: true } } },
        });
    }
    async list(user, requestedSchoolId) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, requestedSchoolId);
        return database_1.prisma.feePackage.findMany({
            where: { ...(schoolId ? { schoolId } : {}), isActive: true },
            include: { classes: { include: { class: true } }, _count: { select: { enrollments: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(user, id) {
        const pkg = await database_1.prisma.feePackage.findUnique({
            where: { id },
            include: { classes: { include: { class: true } } },
        });
        if (!pkg)
            throw api_error_1.ApiError.notFound('Fee package');
        (0, rbac_1.assertSameSchool)(user, pkg.schoolId);
        return pkg;
    }
    async update(user, id, dto) {
        await this.getById(user, id);
        const data = { ...dto };
        for (const k of ['annualFee', 'installmentAmount', 'hostelAnnualFee', 'hostelInstallment', 'siblingDiscountPercentage']) {
            if (dto[k] != null)
                data[k] = (0, currency_1.money)(dto[k]);
        }
        return database_1.prisma.feePackage.update({ where: { id }, data });
    }
    async deactivate(user, id) {
        await this.getById(user, id);
        return database_1.prisma.feePackage.update({ where: { id }, data: { isActive: false } });
    }
    async assignClass(user, id, classId) {
        const pkg = await this.getById(user, id);
        const klass = await database_1.prisma.class.findFirst({ where: { id: classId, schoolId: pkg.schoolId } });
        if (!klass)
            throw api_error_1.ApiError.badRequest('Class not found in this school');
        return database_1.prisma.feePackageClass.upsert({
            where: { feePackageId_classId: { feePackageId: id, classId } },
            update: { isActive: true },
            create: { feePackageId: id, classId },
        });
    }
}
exports.FeeService = FeeService;
exports.feeService = new FeeService();
//# sourceMappingURL=fee.service.js.map