"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdminQuery = exports.updateAdminSchema = exports.createAdminSchema = void 0;
const zod_1 = require("zod");
exports.createAdminSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(7),
    schoolId: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8).optional(),
});
exports.updateAdminSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().min(7).optional(),
    email: zod_1.z.string().email().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.listAdminQuery = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    schoolId: zod_1.z.string().optional(),
    isActive: zod_1.z
        .string()
        .optional()
        .transform((v) => (v === undefined ? undefined : v === 'true')),
});
//# sourceMappingURL=admin.types.js.map