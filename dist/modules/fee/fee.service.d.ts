import { AuthUser } from '../../types';
import { CreateFeePackageDto, UpdateFeePackageDto } from './fee.types';
export declare class FeeService {
    create(user: AuthUser, dto: CreateFeePackageDto): Promise<{
        classes: ({
            class: {
                level: import(".prisma/client").$Enums.ClassLevel;
                name: string;
                id: string;
                schoolId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                sortOrder: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            classId: string;
            feePackageId: string;
        })[];
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        annualFee: import("@prisma/client/runtime/library").Decimal;
        installmentType: import(".prisma/client").$Enums.InstallmentType;
        installmentCount: number;
        installmentAmount: import("@prisma/client/runtime/library").Decimal;
        hostelAvailable: boolean;
        hostelAnnualFee: import("@prisma/client/runtime/library").Decimal | null;
        hostelInstallment: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountEnabled: boolean;
        siblingDiscountPercentage: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountAppliesAfter: number;
    }>;
    list(user: AuthUser, requestedSchoolId?: string): Promise<({
        classes: ({
            class: {
                level: import(".prisma/client").$Enums.ClassLevel;
                name: string;
                id: string;
                schoolId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                sortOrder: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            classId: string;
            feePackageId: string;
        })[];
        _count: {
            enrollments: number;
        };
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        annualFee: import("@prisma/client/runtime/library").Decimal;
        installmentType: import(".prisma/client").$Enums.InstallmentType;
        installmentCount: number;
        installmentAmount: import("@prisma/client/runtime/library").Decimal;
        hostelAvailable: boolean;
        hostelAnnualFee: import("@prisma/client/runtime/library").Decimal | null;
        hostelInstallment: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountEnabled: boolean;
        siblingDiscountPercentage: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountAppliesAfter: number;
    })[]>;
    getById(user: AuthUser, id: string): Promise<{
        classes: ({
            class: {
                level: import(".prisma/client").$Enums.ClassLevel;
                name: string;
                id: string;
                schoolId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                sortOrder: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            classId: string;
            feePackageId: string;
        })[];
    } & {
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        annualFee: import("@prisma/client/runtime/library").Decimal;
        installmentType: import(".prisma/client").$Enums.InstallmentType;
        installmentCount: number;
        installmentAmount: import("@prisma/client/runtime/library").Decimal;
        hostelAvailable: boolean;
        hostelAnnualFee: import("@prisma/client/runtime/library").Decimal | null;
        hostelInstallment: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountEnabled: boolean;
        siblingDiscountPercentage: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountAppliesAfter: number;
    }>;
    update(user: AuthUser, id: string, dto: UpdateFeePackageDto): Promise<{
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        annualFee: import("@prisma/client/runtime/library").Decimal;
        installmentType: import(".prisma/client").$Enums.InstallmentType;
        installmentCount: number;
        installmentAmount: import("@prisma/client/runtime/library").Decimal;
        hostelAvailable: boolean;
        hostelAnnualFee: import("@prisma/client/runtime/library").Decimal | null;
        hostelInstallment: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountEnabled: boolean;
        siblingDiscountPercentage: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountAppliesAfter: number;
    }>;
    deactivate(user: AuthUser, id: string): Promise<{
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        annualFee: import("@prisma/client/runtime/library").Decimal;
        installmentType: import(".prisma/client").$Enums.InstallmentType;
        installmentCount: number;
        installmentAmount: import("@prisma/client/runtime/library").Decimal;
        hostelAvailable: boolean;
        hostelAnnualFee: import("@prisma/client/runtime/library").Decimal | null;
        hostelInstallment: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountEnabled: boolean;
        siblingDiscountPercentage: import("@prisma/client/runtime/library").Decimal | null;
        siblingDiscountAppliesAfter: number;
    }>;
    assignClass(user: AuthUser, id: string, classId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        classId: string;
        feePackageId: string;
    }>;
}
export declare const feeService: FeeService;
//# sourceMappingURL=fee.service.d.ts.map