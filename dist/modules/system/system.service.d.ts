import { Prisma } from '@prisma/client';
import { AuthUser } from '../../types';
export declare class SystemService {
    listAuditLogs(user: AuthUser, opts: {
        page: number;
        limit: number;
        action?: string;
        schoolId?: string;
        userId?: string;
        dateFrom?: string;
        dateTo?: string;
        search?: string;
    }): Promise<{
        data: ({
            user: {
                email: string;
                fullName: string;
            };
        } & {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            userId: string;
            ipAddress: string | null;
            userAgent: string | null;
            action: import(".prisma/client").$Enums.AuditAction;
            tableName: string;
            recordId: string;
            actionDetails: Prisma.JsonValue | null;
            oldValues: Prisma.JsonValue | null;
            newValues: Prisma.JsonValue | null;
            requestId: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAuditActions(): Promise<string[]>;
    health(): Promise<Record<string, {
        ok: boolean;
        message: string;
    }>>;
    metrics(): Promise<Record<string, unknown>>;
    superAdminDashboard(): Promise<{
        counts: {
            schools: number;
            admins: number;
            students: number;
            totalRevenue: Prisma.Decimal;
        };
        recentActivity: ({
            user: {
                fullName: string;
            };
            school: {
                name: string;
            } | null;
        } & {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            userId: string;
            ipAddress: string | null;
            userAgent: string | null;
            action: import(".prisma/client").$Enums.AuditAction;
            tableName: string;
            recordId: string;
            actionDetails: Prisma.JsonValue | null;
            oldValues: Prisma.JsonValue | null;
            newValues: Prisma.JsonValue | null;
            requestId: string | null;
        })[];
        schools: {
            id: string;
            name: string;
            subdomain: string;
            admins: number;
            students: number;
            revenue: Prisma.Decimal;
        }[];
    }>;
    getConfig(user: AuthUser, schoolIdReq?: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        value: Prisma.JsonValue;
        isEncrypted: boolean;
        updatedBy: string | null;
    }[]>;
    setConfig(user: AuthUser, schoolIdReq: string | undefined, key: string, value: Prisma.InputJsonValue, description?: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        value: Prisma.JsonValue;
        isEncrypted: boolean;
        updatedBy: string | null;
    }>;
    createBackup(user: AuthUser): Promise<{
        error: string | null;
        id: string;
        schoolId: string | null;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BackupStatus;
        createdBy: string | null;
        completedAt: Date | null;
        backupType: import(".prisma/client").$Enums.BackupType;
        fileName: string;
        fileSize: number;
        filePath: string;
        checksum: string | null;
        startedAt: Date;
    }>;
    listBackups(): Promise<{
        error: string | null;
        id: string;
        schoolId: string | null;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BackupStatus;
        createdBy: string | null;
        completedAt: Date | null;
        backupType: import(".prisma/client").$Enums.BackupType;
        fileName: string;
        fileSize: number;
        filePath: string;
        checksum: string | null;
        startedAt: Date;
    }[]>;
}
export declare const systemService: SystemService;
//# sourceMappingURL=system.service.d.ts.map