import { AuthUser } from '../../types';
export declare class ReceiptService {
    getById(user: AuthUser, id: string): Promise<{
        student: {
            fullName: string;
            admissionNo: string;
        };
        payment: {
            student: {
                school: {
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
            invoice: {
                amount: import("@prisma/client/runtime/library").Decimal;
                invoiceNumber: string;
                balance: import("@prisma/client/runtime/library").Decimal;
            };
            recordedByUser: {
                fullName: string;
            };
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            receiptNumber: string;
            studentId: string;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            amountAllocated: import("@prisma/client/runtime/library").Decimal;
            amountRemaining: import("@prisma/client/runtime/library").Decimal;
            method: import(".prisma/client").$Enums.PaymentMethod;
            bankReference: string | null;
            transactionId: string | null;
            paymentDate: Date;
            receiptPhoto: string | null;
            verifiedBy: string | null;
            verifiedAt: Date | null;
            verificationNotes: string | null;
            recordedBy: string;
        };
    } & {
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        receiptNumber: string;
        studentId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentId: string;
        amountInWords: string | null;
        receiptDate: Date;
        receiptData: import("@prisma/client/runtime/library").JsonValue;
        pdfUrl: string | null;
        isPrinted: boolean;
        isEmailSent: boolean;
        printedAt: Date | null;
        emailedAt: Date | null;
    }>;
    markPrinted(id: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        receiptNumber: string;
        studentId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentId: string;
        amountInWords: string | null;
        receiptDate: Date;
        receiptData: import("@prisma/client/runtime/library").JsonValue;
        pdfUrl: string | null;
        isPrinted: boolean;
        isEmailSent: boolean;
        printedAt: Date | null;
        emailedAt: Date | null;
    }>;
    emailReceipt(user: AuthUser, id: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        receiptNumber: string;
        studentId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentId: string;
        amountInWords: string | null;
        receiptDate: Date;
        receiptData: import("@prisma/client/runtime/library").JsonValue;
        pdfUrl: string | null;
        isPrinted: boolean;
        isEmailSent: boolean;
        printedAt: Date | null;
        emailedAt: Date | null;
    }>;
    pdf(user: AuthUser, id: string): Promise<string>;
}
export declare const receiptService: ReceiptService;
//# sourceMappingURL=receipt.service.d.ts.map