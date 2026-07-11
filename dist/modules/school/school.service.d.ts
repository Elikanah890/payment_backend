import { AuthUser } from '../../types';
import { CreateSchoolDto, UpdateSchoolDto } from './school.types';
export declare class SchoolService {
    create(dto: CreateSchoolDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subdomain: string;
        address: string | null;
        logoUrl: string | null;
        bankName: string;
        bankAccount: string;
        bankAccountName: string;
        lateFeeAmount: import("@prisma/client/runtime/library").Decimal;
        lateFeeGraceDays: number;
        academicYearStart: Date;
        academicYearEnd: Date;
    }>;
    list(user: AuthUser, page: number, limit: number, search?: string, isActive?: boolean): Promise<{
        data: {
            name: string;
            id: string;
            email: string | null;
            phone: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            subdomain: string;
            address: string | null;
            logoUrl: string | null;
            bankName: string;
            bankAccount: string;
            bankAccountName: string;
            lateFeeAmount: import("@prisma/client/runtime/library").Decimal;
            lateFeeGraceDays: number;
            academicYearStart: Date;
            academicYearEnd: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(user: AuthUser, id: string): Promise<{
        admins: {
            id: string;
            email: string;
            fullName: string;
            isActive: boolean;
        }[];
        classes: {
            level: import(".prisma/client").$Enums.ClassLevel;
            name: string;
            id: string;
            _count: {
                students: number;
            };
        }[];
        _count: {
            admins: number;
            students: number;
        };
    } & {
        name: string;
        id: string;
        email: string | null;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subdomain: string;
        address: string | null;
        logoUrl: string | null;
        bankName: string;
        bankAccount: string;
        bankAccountName: string;
        lateFeeAmount: import("@prisma/client/runtime/library").Decimal;
        lateFeeGraceDays: number;
        academicYearStart: Date;
        academicYearEnd: Date;
    }>;
    update(id: string, dto: UpdateSchoolDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subdomain: string;
        address: string | null;
        logoUrl: string | null;
        bankName: string;
        bankAccount: string;
        bankAccountName: string;
        lateFeeAmount: import("@prisma/client/runtime/library").Decimal;
        lateFeeGraceDays: number;
        academicYearStart: Date;
        academicYearEnd: Date;
    }>;
    deactivate(id: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subdomain: string;
        address: string | null;
        logoUrl: string | null;
        bankName: string;
        bankAccount: string;
        bankAccountName: string;
        lateFeeAmount: import("@prisma/client/runtime/library").Decimal;
        lateFeeGraceDays: number;
        academicYearStart: Date;
        academicYearEnd: Date;
    }>;
    reactivate(id: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        subdomain: string;
        address: string | null;
        logoUrl: string | null;
        bankName: string;
        bankAccount: string;
        bankAccountName: string;
        lateFeeAmount: import("@prisma/client/runtime/library").Decimal;
        lateFeeGraceDays: number;
        academicYearStart: Date;
        academicYearEnd: Date;
    }>;
    stats(user: AuthUser, id: string): Promise<{
        school: {
            admins: {
                id: string;
                email: string;
                fullName: string;
                isActive: boolean;
            }[];
            classes: {
                level: import(".prisma/client").$Enums.ClassLevel;
                name: string;
                id: string;
                _count: {
                    students: number;
                };
            }[];
            _count: {
                admins: number;
                students: number;
            };
        } & {
            name: string;
            id: string;
            email: string | null;
            phone: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            subdomain: string;
            address: string | null;
            logoUrl: string | null;
            bankName: string;
            bankAccount: string;
            bankAccountName: string;
            lateFeeAmount: import("@prisma/client/runtime/library").Decimal;
            lateFeeGraceDays: number;
            academicYearStart: Date;
            academicYearEnd: Date;
        };
        students: any;
        admins: any;
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        totalInvoiced: import("@prisma/client/runtime/library").Decimal;
        totalCollected: import("@prisma/client/runtime/library").Decimal;
        outstanding: import("@prisma/client/runtime/library").Decimal;
        collectionRate: string;
    }>;
    private ensureExists;
}
export declare const schoolService: SchoolService;
//# sourceMappingURL=school.service.d.ts.map