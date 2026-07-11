import { Prisma, InvoiceStatus } from '@prisma/client';
import { AuthUser } from '../../types';
import { GenerateInvoiceDto, AdjustInvoiceDto, WaiveInvoiceDto, ListInvoiceQuery } from './invoice.types';
export declare function computeStatus(amount: Prisma.Decimal, amountPaid: Prisma.Decimal, dueDate: Date): InvoiceStatus;
export declare class InvoiceService {
    generate(user: AuthUser, dto: GenerateInvoiceDto): Promise<{
        generated: number;
        invoices: {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            academicYearId: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            createdBy: string | null;
            studentId: string;
            amount: Prisma.Decimal;
            invoiceNumber: string;
            amountPaid: Prisma.Decimal;
            balance: Prisma.Decimal;
            lateFee: Prisma.Decimal;
            totalDue: Prisma.Decimal;
            invoiceDate: Date;
            dueDate: Date;
            lateFeeAppliedAt: Date | null;
            notes: string | null;
        }[];
    }>;
    list(user: AuthUser, q: ListInvoiceQuery): Promise<{
        data: ({
            student: {
                id: string;
                fullName: string;
                admissionNo: string;
                class: {
                    name: string;
                };
            };
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            academicYearId: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            createdBy: string | null;
            studentId: string;
            amount: Prisma.Decimal;
            invoiceNumber: string;
            amountPaid: Prisma.Decimal;
            balance: Prisma.Decimal;
            lateFee: Prisma.Decimal;
            totalDue: Prisma.Decimal;
            invoiceDate: Date;
            dueDate: Date;
            lateFeeAppliedAt: Date | null;
            notes: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(user: AuthUser, id: string): Promise<{
        student: {
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
        };
        payments: {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            receiptNumber: string;
            studentId: string;
            invoiceId: string;
            amount: Prisma.Decimal;
            amountAllocated: Prisma.Decimal;
            amountRemaining: Prisma.Decimal;
            method: import(".prisma/client").$Enums.PaymentMethod;
            bankReference: string | null;
            transactionId: string | null;
            paymentDate: Date;
            receiptPhoto: string | null;
            verifiedBy: string | null;
            verifiedAt: Date | null;
            verificationNotes: string | null;
            recordedBy: string;
        }[];
        adjustments: {
            type: import(".prisma/client").$Enums.AdjustmentType;
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: Prisma.Decimal;
            reason: string;
            approvedBy: string;
        }[];
    } & {
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdBy: string | null;
        studentId: string;
        amount: Prisma.Decimal;
        invoiceNumber: string;
        amountPaid: Prisma.Decimal;
        balance: Prisma.Decimal;
        lateFee: Prisma.Decimal;
        totalDue: Prisma.Decimal;
        invoiceDate: Date;
        dueDate: Date;
        lateFeeAppliedAt: Date | null;
        notes: string | null;
    }>;
    adjust(user: AuthUser, id: string, dto: AdjustInvoiceDto): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdBy: string | null;
        studentId: string;
        amount: Prisma.Decimal;
        invoiceNumber: string;
        amountPaid: Prisma.Decimal;
        balance: Prisma.Decimal;
        lateFee: Prisma.Decimal;
        totalDue: Prisma.Decimal;
        invoiceDate: Date;
        dueDate: Date;
        lateFeeAppliedAt: Date | null;
        notes: string | null;
    }>;
    waive(user: AuthUser, id: string, dto: WaiveInvoiceDto): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdBy: string | null;
        studentId: string;
        amount: Prisma.Decimal;
        invoiceNumber: string;
        amountPaid: Prisma.Decimal;
        balance: Prisma.Decimal;
        lateFee: Prisma.Decimal;
        totalDue: Prisma.Decimal;
        invoiceDate: Date;
        dueDate: Date;
        lateFeeAppliedAt: Date | null;
        notes: string | null;
    }>;
    overdue(user: AuthUser, requestedSchoolId?: string): Promise<({
        student: {
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
        };
    } & {
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdBy: string | null;
        studentId: string;
        amount: Prisma.Decimal;
        invoiceNumber: string;
        amountPaid: Prisma.Decimal;
        balance: Prisma.Decimal;
        lateFee: Prisma.Decimal;
        totalDue: Prisma.Decimal;
        invoiceDate: Date;
        dueDate: Date;
        lateFeeAppliedAt: Date | null;
        notes: string | null;
    })[]>;
    print(user: AuthUser, id: string): Promise<string>;
    summary(user: AuthUser, requestedSchoolId?: string): Promise<{
        totalInvoiced: Prisma.Decimal;
        totalCollected: Prisma.Decimal;
        totalOutstanding: Prisma.Decimal;
        totalInvoices: number;
        collectionRate: number;
        byStatus: {
            [k: string]: number;
        };
    }>;
    generatePdf(user: AuthUser, id: string): Promise<Buffer>;
}
export declare const invoiceService: InvoiceService;
//# sourceMappingURL=invoice.service.d.ts.map