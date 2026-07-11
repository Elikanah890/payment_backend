"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportSchema = exports.listStudentQuery = exports.withdrawSchema = exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
const guardianInline = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(7),
    relationship: zod_1.z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'UNCLE', 'AUNT', 'SISTER', 'BROTHER', 'OTHER']),
    email: zod_1.z.string().email().optional(),
});
exports.createStudentSchema = zod_1.z
    .object({
    schoolId: zod_1.z.string().optional(),
    fullName: zod_1.z.string().min(3).max(200),
    dateOfBirth: zod_1.z.coerce.date().optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE']).optional(),
    classId: zod_1.z.string().min(1),
    feePackageId: zod_1.z.string().min(1),
    isHostel: zod_1.z.boolean().default(false),
    guardianId: zod_1.z.string().optional(),
    guardian: guardianInline.optional(),
})
    .refine((d) => d.guardianId || d.guardian, {
    message: 'Provide guardianId or guardian details',
    path: ['guardian'],
});
exports.updateStudentSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(3).max(200).optional(),
    dateOfBirth: zod_1.z.coerce.date().optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE']).optional(),
    classId: zod_1.z.string().optional(),
});
exports.withdrawSchema = zod_1.z.object({
    status: zod_1.z.enum(['WITHDRAWN', 'TRANSFERRED', 'GRADUATED', 'SUSPENDED']),
    reason: zod_1.z.string().optional(),
});
exports.listStudentQuery = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    classId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'WITHDRAWN', 'GRADUATED', 'TRANSFERRED', 'SUSPENDED']).optional(),
    q: zod_1.z.string().optional(),
    schoolId: zod_1.z.string().optional(),
});
exports.bulkImportSchema = zod_1.z.object({
    students: zod_1.z.array(exports.createStudentSchema).min(1).max(500),
});
//# sourceMappingURL=student.types.js.map