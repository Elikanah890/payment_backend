"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolService = exports.SchoolService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const validator_1 = require("../../utils/validator");
const currency_1 = require("../../utils/currency");
const class_service_1 = require("../class/class.service");
class SchoolService {
    async create(dto) {
        const school = await database_1.prisma.school.create({
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
        await class_service_1.classService.seedDefaultClasses(school.id);
        return school;
    }
    async list(user, page, limit, search, isActive) {
        const where = {};
        if (user.role !== client_1.UserRole.SUPER_ADMIN) {
            where.id = user.schoolId ?? '__none__';
        }
        else {
            if (isActive !== undefined)
                where.isActive = isActive;
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { subdomain: { contains: search, mode: 'insensitive' } },
                ];
            }
        }
        const [data, total] = await Promise.all([
            database_1.prisma.school.findMany({ where: where, orderBy: { createdAt: 'desc' }, ...(0, validator_1.paginate)(page, limit) }),
            database_1.prisma.school.count({ where: where }),
        ]);
        return { data, meta: (0, validator_1.meta)(page, limit, total) };
    }
    async getById(user, id) {
        const school = await database_1.prisma.school.findUnique({
            where: { id },
            include: {
                _count: { select: { students: true, admins: true } },
                admins: { select: { id: true, fullName: true, email: true, isActive: true } },
                classes: { select: { id: true, name: true, level: true, _count: { select: { students: true } } }, orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!school)
            throw api_error_1.ApiError.notFound('School');
        (0, rbac_1.assertSameSchool)(user, school.id);
        return school;
    }
    async update(id, dto) {
        await this.ensureExists(id);
        return database_1.prisma.school.update({ where: { id }, data: dto });
    }
    async deactivate(id) {
        await this.ensureExists(id);
        return database_1.prisma.school.update({ where: { id }, data: { isActive: false } });
    }
    async reactivate(id) {
        await this.ensureExists(id);
        return database_1.prisma.school.update({ where: { id }, data: { isActive: true } });
    }
    async stats(user, id) {
        const school = await this.getById(user, id);
        const [revenue, collection] = await Promise.all([
            database_1.prisma.payment.aggregate({ where: { schoolId: id, status: 'COMPLETED' }, _sum: { amount: true } }),
            database_1.prisma.invoice.aggregate({ where: { schoolId: id }, _sum: { amount: true, amountPaid: true, balance: true } }),
        ]);
        const invoiced = (0, currency_1.money)(collection._sum.amount ?? 0);
        const collected = (0, currency_1.money)(collection._sum.amountPaid ?? 0);
        return {
            school,
            students: school._count?.students ?? 0,
            admins: school._count?.admins ?? 0,
            totalRevenue: (0, currency_1.money)(revenue._sum.amount ?? 0),
            totalInvoiced: invoiced,
            totalCollected: collected,
            outstanding: invoiced.minus(collected),
            collectionRate: invoiced.greaterThan(0) ? collected.dividedBy(invoiced).times(100).toFixed(1) : '0',
        };
    }
    async ensureExists(id) {
        const s = await database_1.prisma.school.findUnique({ where: { id }, select: { id: true } });
        if (!s)
            throw api_error_1.ApiError.notFound('School');
    }
}
exports.SchoolService = SchoolService;
exports.schoolService = new SchoolService();
//# sourceMappingURL=school.service.js.map