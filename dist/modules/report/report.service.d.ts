import { Prisma } from '@prisma/client';
import { AuthUser } from '../../types';
export declare class ReportService {
    daily(user: AuthUser, dateStr: string | undefined, schoolIdReq?: string): Promise<{
        date: string;
        total: Prisma.Decimal;
        count: number;
        payments: ({
            student: {
                fullName: string;
                admissionNo: string;
            };
            receipts: {
                receiptNumber: string;
            }[];
        } & {
            status: import(".prisma/client").$Enums.PaymentStatus;
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
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
        })[];
    }>;
    aging(user: AuthUser, schoolIdReq?: string): Promise<{
        count: number;
        buckets: {
            '0-30': Prisma.Decimal;
            '31-60': Prisma.Decimal;
            '61-90': Prisma.Decimal;
            '90+': Prisma.Decimal;
        };
    }>;
    feePackageSummary(user: AuthUser, schoolIdReq?: string): Promise<{
        id: string;
        name: string;
        installmentType: import(".prisma/client").$Enums.InstallmentType;
        installmentAmount: Prisma.Decimal;
        annualFee: Prisma.Decimal;
        enrollments: number;
    }[]>;
    hostel(user: AuthUser, schoolIdReq?: string): Promise<{
        hostel: number;
        dayScholar: number;
        total: number;
    }>;
    channels(user: AuthUser, schoolIdReq?: string): Promise<{
        method: import(".prisma/client").$Enums.PaymentMethod;
        total: Prisma.Decimal;
        count: number;
    }[]>;
    studentStatement(user: AuthUser, studentId: string): Promise<{
        student: {
            id: string;
            fullName: string;
            admissionNo: string;
            class: string;
        };
        totals: {
            invoiced: Prisma.Decimal;
            paid: Prisma.Decimal;
            balance: Prisma.Decimal;
        };
        invoices: {
            status: import(".prisma/client").$Enums.InvoiceStatus;
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            academicYearId: string;
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
        payments: ({
            receipts: {
                receiptNumber: string;
            }[];
        } & {
            status: import(".prisma/client").$Enums.PaymentStatus;
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
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
        })[];
    }>;
}
export declare const reportService: ReportService;
//# sourceMappingURL=report.service.d.ts.map