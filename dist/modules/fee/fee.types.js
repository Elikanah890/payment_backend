"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignClassSchema = exports.updateFeePackageSchema = exports.createFeePackageSchema = void 0;
const zod_1 = require("zod");
exports.createFeePackageSchema = zod_1.z.object({
    schoolId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    annualFee: zod_1.z.coerce.number().positive(),
    installmentType: zod_1.z.enum(['MONTHLY', 'QUARTERLY', 'TERMLY']),
    installmentCount: zod_1.z.coerce.number().int().positive(),
    installmentAmount: zod_1.z.coerce.number().positive(),
    hostelAvailable: zod_1.z.boolean().default(false),
    hostelAnnualFee: zod_1.z.coerce.number().positive().optional(),
    hostelInstallment: zod_1.z.coerce.number().positive().optional(),
    siblingDiscountEnabled: zod_1.z.boolean().default(false),
    siblingDiscountPercentage: zod_1.z.coerce.number().min(0).max(100).optional(),
    siblingDiscountAppliesAfter: zod_1.z.coerce.number().int().min(1).default(2),
    classIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateFeePackageSchema = exports.createFeePackageSchema.partial().omit({ schoolId: true, classIds: true });
exports.assignClassSchema = zod_1.z.object({ classId: zod_1.z.string().min(1) });
//# sourceMappingURL=fee.types.js.map