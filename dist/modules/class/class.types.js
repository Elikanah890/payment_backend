"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
exports.createClassSchema = zod_1.z.object({
    schoolId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1).max(20),
    level: zod_1.z.enum(['PRE_PRIMARY', 'PRIMARY', 'SECONDARY']),
    description: zod_1.z.string().optional(),
    sortOrder: zod_1.z.coerce.number().int().min(0).optional(),
});
exports.updateClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(20).optional(),
    level: zod_1.z.enum(['PRE_PRIMARY', 'PRIMARY', 'SECONDARY']).optional(),
    description: zod_1.z.string().optional(),
    sortOrder: zod_1.z.coerce.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=class.types.js.map