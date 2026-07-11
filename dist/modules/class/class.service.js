"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classService = exports.ClassService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const rbac_1 = require("../../middleware/rbac");
const DEFAULT_CLASSES = [
    { name: 'JNR', level: client_1.ClassLevel.PRE_PRIMARY, sortOrder: 1 },
    { name: 'MID', level: client_1.ClassLevel.PRE_PRIMARY, sortOrder: 2 },
    { name: 'SNR', level: client_1.ClassLevel.PRE_PRIMARY, sortOrder: 3 },
    { name: 'CL1', level: client_1.ClassLevel.PRIMARY, sortOrder: 4 },
    { name: 'CL2', level: client_1.ClassLevel.PRIMARY, sortOrder: 5 },
    { name: 'CL3', level: client_1.ClassLevel.PRIMARY, sortOrder: 6 },
    { name: 'CL4', level: client_1.ClassLevel.PRIMARY, sortOrder: 7 },
];
class ClassService {
    async list(user, requestedSchoolId, includeInactive) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, requestedSchoolId);
        if (!schoolId)
            throw api_error_1.ApiError.badRequest('schoolId is required');
        return database_1.prisma.class.findMany({
            where: { schoolId, ...(includeInactive ? {} : { isActive: true }) },
            include: {
                _count: { select: { students: true } },
                feePackageClasses: { include: { feePackage: { select: { id: true, name: true } } } },
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async create(user, dto) {
        const schoolId = (0, rbac_1.resolveSchoolScope)(user, dto.schoolId);
        if (!schoolId)
            throw api_error_1.ApiError.badRequest('schoolId is required');
        const existing = await database_1.prisma.class.findUnique({ where: { schoolId_name: { schoolId, name: dto.name } } });
        if (existing)
            throw api_error_1.ApiError.conflict('A class with this name already exists in this school');
        return database_1.prisma.class.create({
            data: {
                schoolId,
                name: dto.name,
                level: dto.level,
                description: dto.description,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }
    async getById(user, id) {
        const klass = await database_1.prisma.class.findUnique({
            where: { id },
            include: {
                _count: { select: { students: true } },
                feePackageClasses: { include: { feePackage: { select: { id: true, name: true } } } },
            },
        });
        if (!klass)
            throw api_error_1.ApiError.notFound('Class');
        (0, rbac_1.assertSameSchool)(user, klass.schoolId);
        return klass;
    }
    async update(user, id, dto) {
        const klass = await this.getById(user, id);
        if (dto.name && dto.name !== klass.name) {
            const clash = await database_1.prisma.class.findUnique({ where: { schoolId_name: { schoolId: klass.schoolId, name: dto.name } } });
            if (clash)
                throw api_error_1.ApiError.conflict('A class with this name already exists in this school');
        }
        return database_1.prisma.class.update({ where: { id }, data: dto });
    }
    async setActive(user, id, isActive) {
        await this.getById(user, id);
        return database_1.prisma.class.update({ where: { id }, data: { isActive } });
    }
    // Seeds the standard class set for a freshly created school. Idempotent.
    async seedDefaultClasses(schoolId, db = database_1.prisma) {
        for (const c of DEFAULT_CLASSES) {
            try {
                await db.class.create({ data: { schoolId, ...c } });
            }
            catch {
                /* skip duplicates */
            }
        }
    }
}
exports.ClassService = ClassService;
exports.classService = new ClassService();
//# sourceMappingURL=class.service.js.map