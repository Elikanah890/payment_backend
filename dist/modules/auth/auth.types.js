"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.changePasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.resetPasswordSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
//# sourceMappingURL=auth.types.js.map