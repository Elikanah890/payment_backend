"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchoolSchema = exports.createSchoolSchema = void 0;
const zod_1 = require("zod");
exports.createSchoolSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    subdomain: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers, hyphens only'),
    phone: zod_1.z.string().min(7),
    email: zod_1.z.string().email().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    logoUrl: zod_1.z.string().url().optional().nullable(),
    bankName: zod_1.z.string().default('CRDB'),
    bankAccount: zod_1.z.string().min(3),
    bankAccountName: zod_1.z.string().min(2),
    lateFeeAmount: zod_1.z.coerce.number().min(0).optional(),
    lateFeeGraceDays: zod_1.z.coerce.number().int().min(0).optional(),
    academicYearStart: zod_1.z.coerce.date(),
    academicYearEnd: zod_1.z.coerce.date(),
});
exports.updateSchoolSchema = exports.createSchoolSchema.partial().omit({ subdomain: true });
//# sourceMappingURL=school.types.js.map