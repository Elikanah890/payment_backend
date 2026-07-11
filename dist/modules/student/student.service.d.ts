import { Prisma } from '@prisma/client';
import { AuthUser } from '../../types';
import { CreateStudentDto, UpdateStudentDto, WithdrawDto, ListStudentQuery } from './student.types';
export declare class StudentService {
    create(user: AuthUser, dto: CreateStudentDto): Promise<{
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
        academicYear: {
            name: string;
            id: string;
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
        };
        enrollments: ({
            feePackage: {
                name: string;
                id: string;
                schoolId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                annualFee: Prisma.Decimal;
                installmentType: import(".prisma/client").$Enums.InstallmentType;
                installmentCount: number;
                installmentAmount: Prisma.Decimal;
                hostelAvailable: boolean;
                hostelAnnualFee: Prisma.Decimal | null;
                hostelInstallment: Prisma.Decimal | null;
                siblingDiscountEnabled: boolean;
                siblingDiscountPercentage: Prisma.Decimal | null;
                siblingDiscountAppliesAfter: number;
            };
        } & {
            id: string;
            isActive: boolean;
            updatedAt: Date;
            academicYearId: string;
            studentId: string;
            feePackageId: string;
            isHostel: boolean;
            enrolledAt: Date;
        })[];
        guardians: ({
            guardian: {
                id: string;
                email: string | null;
                fullName: string;
                phone: string;
                schoolId: string;
                createdAt: Date;
                updatedAt: Date;
                address: string | null;
                relationship: import(".prisma/client").$Enums.RelationshipType;
                receivesSms: boolean;
                receivesEmail: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            studentId: string;
            guardianId: string;
            isPrimaryContact: boolean;
            isEmergencyContact: boolean;
        })[];
    } & {
        id: string;
        fullName: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        admissionNo: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        classId: string;
        academicYearId: string;
        status: import(".prisma/client").$Enums.StudentStatus;
        enrollmentDate: Date;
        withdrawalDate: Date | null;
        withdrawalReason: string | null;
        createdBy: string;
    }>;
    list(user: AuthUser, q: ListStudentQuery): Promise<{
        data: ({
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
            guardians: ({
                guardian: {
                    id: string;
                    email: string | null;
                    fullName: string;
                    phone: string;
                    schoolId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    address: string | null;
                    relationship: import(".prisma/client").$Enums.RelationshipType;
                    receivesSms: boolean;
                    receivesEmail: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                studentId: string;
                guardianId: string;
                isPrimaryContact: boolean;
                isEmergencyContact: boolean;
            })[];
        } & {
            id: string;
            fullName: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            admissionNo: string;
            dateOfBirth: Date | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            classId: string;
            academicYearId: string;
            status: import(".prisma/client").$Enums.StudentStatus;
            enrollmentDate: Date;
            withdrawalDate: Date | null;
            withdrawalReason: string | null;
            createdBy: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(user: AuthUser, id: string): Promise<{
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
        academicYear: {
            name: string;
            id: string;
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
        };
        enrollments: ({
            feePackage: {
                name: string;
                id: string;
                schoolId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                annualFee: Prisma.Decimal;
                installmentType: import(".prisma/client").$Enums.InstallmentType;
                installmentCount: number;
                installmentAmount: Prisma.Decimal;
                hostelAvailable: boolean;
                hostelAnnualFee: Prisma.Decimal | null;
                hostelInstallment: Prisma.Decimal | null;
                siblingDiscountEnabled: boolean;
                siblingDiscountPercentage: Prisma.Decimal | null;
                siblingDiscountAppliesAfter: number;
            };
        } & {
            id: string;
            isActive: boolean;
            updatedAt: Date;
            academicYearId: string;
            studentId: string;
            feePackageId: string;
            isHostel: boolean;
            enrolledAt: Date;
        })[];
        guardians: ({
            guardian: {
                id: string;
                email: string | null;
                fullName: string;
                phone: string;
                schoolId: string;
                createdAt: Date;
                updatedAt: Date;
                address: string | null;
                relationship: import(".prisma/client").$Enums.RelationshipType;
                receivesSms: boolean;
                receivesEmail: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            studentId: string;
            guardianId: string;
            isPrimaryContact: boolean;
            isEmergencyContact: boolean;
        })[];
    } & {
        id: string;
        fullName: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        admissionNo: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        classId: string;
        academicYearId: string;
        status: import(".prisma/client").$Enums.StudentStatus;
        enrollmentDate: Date;
        withdrawalDate: Date | null;
        withdrawalReason: string | null;
        createdBy: string;
    }>;
    permanentDelete(user: AuthUser, id: string): Promise<{
        deleted: boolean;
        admissionNo: string;
        fullName: string;
    }>;
    update(user: AuthUser, id: string, dto: UpdateStudentDto): Promise<{
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
        academicYear: {
            name: string;
            id: string;
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            startDate: Date;
            endDate: Date;
            isCurrent: boolean;
        };
        enrollments: ({
            feePackage: {
                name: string;
                id: string;
                schoolId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                annualFee: Prisma.Decimal;
                installmentType: import(".prisma/client").$Enums.InstallmentType;
                installmentCount: number;
                installmentAmount: Prisma.Decimal;
                hostelAvailable: boolean;
                hostelAnnualFee: Prisma.Decimal | null;
                hostelInstallment: Prisma.Decimal | null;
                siblingDiscountEnabled: boolean;
                siblingDiscountPercentage: Prisma.Decimal | null;
                siblingDiscountAppliesAfter: number;
            };
        } & {
            id: string;
            isActive: boolean;
            updatedAt: Date;
            academicYearId: string;
            studentId: string;
            feePackageId: string;
            isHostel: boolean;
            enrolledAt: Date;
        })[];
        guardians: ({
            guardian: {
                id: string;
                email: string | null;
                fullName: string;
                phone: string;
                schoolId: string;
                createdAt: Date;
                updatedAt: Date;
                address: string | null;
                relationship: import(".prisma/client").$Enums.RelationshipType;
                receivesSms: boolean;
                receivesEmail: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            studentId: string;
            guardianId: string;
            isPrimaryContact: boolean;
            isEmergencyContact: boolean;
        })[];
    } & {
        id: string;
        fullName: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        admissionNo: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        classId: string;
        academicYearId: string;
        status: import(".prisma/client").$Enums.StudentStatus;
        enrollmentDate: Date;
        withdrawalDate: Date | null;
        withdrawalReason: string | null;
        createdBy: string;
    }>;
    withdraw(user: AuthUser, id: string, dto: WithdrawDto): Promise<{
        id: string;
        fullName: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        admissionNo: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        classId: string;
        academicYearId: string;
        status: import(".prisma/client").$Enums.StudentStatus;
        enrollmentDate: Date;
        withdrawalDate: Date | null;
        withdrawalReason: string | null;
        createdBy: string;
    }>;
    bulkImport(user: AuthUser, students: CreateStudentDto[]): Promise<{
        total: number;
        succeeded: number;
        results: {
            index: number;
            ok: boolean;
            admissionNo?: string;
            error?: string;
        }[];
    }>;
}
export declare const studentService: StudentService;
//# sourceMappingURL=student.service.d.ts.map