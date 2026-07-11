import { Prisma } from '@prisma/client';
import { AuthUser } from '../../types';
import { CreateAdminDto, UpdateAdminDto, ListAdminQuery } from './admin.types';
export declare class AdminService {
    create(dto: CreateAdminDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            schoolId: string | null;
            isActive: boolean;
            lastLogin: Date | null;
            passwordChangedAt: Date | null;
            createdAt: Date;
            school: {
                name: string;
                id: string;
            } | null;
        };
        tempPassword: string;
    }>;
    list(user: AuthUser, q: ListAdminQuery): Promise<{
        data: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            schoolId: string | null;
            isActive: boolean;
            lastLogin: Date | null;
            passwordChangedAt: Date | null;
            createdAt: Date;
            school: {
                name: string;
                id: string;
            } | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(user: AuthUser, id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        schoolId: string | null;
        isActive: boolean;
        lastLogin: Date | null;
        passwordChangedAt: Date | null;
        createdAt: Date;
        school: {
            name: string;
            id: string;
        } | null;
    }>;
    update(actor: AuthUser, id: string, dto: UpdateAdminDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        schoolId: string | null;
        isActive: boolean;
        lastLogin: Date | null;
        passwordChangedAt: Date | null;
        createdAt: Date;
        school: {
            name: string;
            id: string;
        } | null;
    }>;
    deactivate(actor: AuthUser, id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        schoolId: string | null;
        isActive: boolean;
        lastLogin: Date | null;
        passwordChangedAt: Date | null;
        createdAt: Date;
        school: {
            name: string;
            id: string;
        } | null;
    }>;
    enable(actor: AuthUser, id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        schoolId: string | null;
        isActive: boolean;
        lastLogin: Date | null;
        passwordChangedAt: Date | null;
        createdAt: Date;
        school: {
            name: string;
            id: string;
        } | null;
    }>;
    resetPassword(actor: AuthUser, id: string): Promise<{
        tempPassword: string;
    }>;
    activityLog(user: AuthUser, adminId: string, page: number, limit: number): Promise<{
        data: {
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
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
export declare const adminService: AdminService;
//# sourceMappingURL=admin.service.d.ts.map