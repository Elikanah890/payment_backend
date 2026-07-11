import { Prisma, PaymentMethod } from '@prisma/client';
import { AuthUser } from '../../types';
import { RecordPaymentDto, PaymentQuery } from './payment.types';
export declare class PaymentService {
    private buildQueue;
    private writeAllocation;
    private allocate;
    record(user: AuthUser, dto: RecordPaymentDto): Promise<{
        count: number;
        payments: {
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
        }[];
    }>;
    settleForStudent(actorId: string, studentId: string, amount: number | Prisma.Decimal, method: PaymentMethod, reference: string): Promise<{
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
    }[]>;
    list(user: AuthUser, q: PaymentQuery): Promise<{
        data: ({
            student: {
                fullName: string;
                admissionNo: string;
                class: {
                    name: string;
                };
            };
            receipts: {
                receiptNumber: string;
            }[];
            invoice: {
                invoiceNumber: string;
            };
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
        } & {
            status: import(".prisma/client").$Enums.StudentStatus;
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
            enrollmentDate: Date;
            withdrawalDate: Date | null;
            withdrawalReason: string | null;
            createdBy: string;
        };
        receipts: {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string;
            receiptNumber: string;
            studentId: string;
            amount: Prisma.Decimal;
            paymentId: string;
            amountInWords: string | null;
            receiptDate: Date;
            receiptData: Prisma.JsonValue;
            pdfUrl: string | null;
            isPrinted: boolean;
            isEmailSent: boolean;
            printedAt: Date | null;
            emailedAt: Date | null;
        }[];
        invoice: {
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
        };
        recordedByUser: {
            fullName: string;
        };
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
    }>;
    studentPayments(user: AuthUser, studentId: string): Promise<({
        receipts: {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string;
            receiptNumber: string;
            studentId: string;
            amount: Prisma.Decimal;
            paymentId: string;
            amountInWords: string | null;
            receiptDate: Date;
            receiptData: Prisma.JsonValue;
            pdfUrl: string | null;
            isPrinted: boolean;
            isEmailSent: boolean;
            printedAt: Date | null;
            emailedAt: Date | null;
        }[];
        invoice: {
            invoiceNumber: string;
        };
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
    })[]>;
    verify(user: AuthUser, id: string, notes?: string): Promise<{
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
    }>;
    void(user: AuthUser, id: string, reason: string): Promise<{
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
    }>;
    refund(user: AuthUser, id: string, reason: string): Promise<{
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
    }>;
    summary(user: AuthUser, requestedSchoolId?: string, year?: number, month?: number): Promise<{
        totalCollected: Prisma.Decimal;
        totalTransactions: number;
        byMethod: {
            method: import(".prisma/client").$Enums.PaymentMethod;
            total: Prisma.Decimal;
            count: number;
        }[];
    }>;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=payment.service.d.ts.map