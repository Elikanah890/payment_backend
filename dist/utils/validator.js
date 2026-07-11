"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParam = exports.paginationSchema = void 0;
exports.param = param;
exports.paginate = paginate;
exports.meta = meta;
const zod_1 = require("zod");
function param(req, name) {
    const v = req.params[name];
    return Array.isArray(v) ? v[0] : v ?? '';
}
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.idParam = zod_1.z.object({ id: zod_1.z.string().min(1) });
function paginate(page, limit) {
    return { skip: (page - 1) * limit, take: limit };
}
function meta(page, limit, total) {
    return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}
//# sourceMappingURL=validator.js.map