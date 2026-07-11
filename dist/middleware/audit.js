"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAudit = recordAudit;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
async function recordAudit(input, db = database_1.prisma) {
    try {
        await db.auditLog.create({
            data: {
                userId: input.userId,
                schoolId: input.schoolId ?? null,
                action: input.action,
                tableName: input.tableName,
                recordId: input.recordId,
                oldValues: input.oldValues,
                newValues: input.newValues,
                actionDetails: input.actionDetails,
                ipAddress: input.ipAddress,
                userAgent: input.userAgent,
                requestId: input.requestId,
            },
        });
    }
    catch (e) {
        logger_1.logger.warn(`Audit log failed: ${e.message}`);
    }
}
//# sourceMappingURL=audit.js.map