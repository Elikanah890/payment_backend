import { Prisma, PrismaClient, AuditAction } from '@prisma/client';
type Db = Pick<PrismaClient, 'auditLog'>;
export interface AuditInput {
    userId: string;
    schoolId?: string | null;
    action: AuditAction;
    tableName: string;
    recordId: string;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
    actionDetails?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
}
export declare function recordAudit(input: AuditInput, db?: Db): Promise<void>;
export {};
//# sourceMappingURL=audit.d.ts.map