import { Prisma } from '@prisma/client';
import { AuthUser } from '../../types';
export declare class TransactionService {
    initiate(user: AuthUser, dto: {
        studentId: string;
        amount: number;
        phone: string;
        provider?: 'mpesa' | 'tigo' | 'airtel';
    }): Promise<{
        status: import(".prisma/client").$Enums.TransactionStatus;
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        amount: Prisma.Decimal;
        paymentId: string | null;
        transactionRef: string;
        gateway: import(".prisma/client").$Enums.PaymentGateway;
        providerRef: string;
        currency: string;
        responseCode: string | null;
        responseMessage: string | null;
        requestPayload: Prisma.JsonValue | null;
        responsePayload: Prisma.JsonValue | null;
        webhookPayload: Prisma.JsonValue | null;
        initiatedAt: Date;
        completedAt: Date | null;
        webhookReceivedAt: Date | null;
        retryCount: number;
        lastRetryAt: Date | null;
    }>;
    getById(id: string): Promise<{
        payment: ({
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
        }) | null;
        logs: {
            status: import(".prisma/client").$Enums.TransactionStatus;
            error: string | null;
            id: string;
            createdAt: Date;
            action: string;
            transactionId: string;
            payload: Prisma.JsonValue | null;
        }[];
    } & {
        status: import(".prisma/client").$Enums.TransactionStatus;
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        amount: Prisma.Decimal;
        paymentId: string | null;
        transactionRef: string;
        gateway: import(".prisma/client").$Enums.PaymentGateway;
        providerRef: string;
        currency: string;
        responseCode: string | null;
        responseMessage: string | null;
        requestPayload: Prisma.JsonValue | null;
        responsePayload: Prisma.JsonValue | null;
        webhookPayload: Prisma.JsonValue | null;
        initiatedAt: Date;
        completedAt: Date | null;
        webhookReceivedAt: Date | null;
        retryCount: number;
        lastRetryAt: Date | null;
    }>;
    processWebhook(providerRef: string, payload: Record<string, unknown>): Promise<{
        alreadyProcessed: boolean;
        transactionId: string | undefined;
        paymentId?: undefined;
        receiptNo?: undefined;
        status?: undefined;
    } | {
        transactionId: string;
        paymentId: string;
        receiptNo: string | null | undefined;
        alreadyProcessed?: undefined;
        status?: undefined;
    } | {
        transactionId: string;
        status: "FAILED" | "PROCESSING" | "SUCCESS";
        alreadyProcessed?: undefined;
        paymentId?: undefined;
        receiptNo?: undefined;
    }>;
}
export declare const transactionService: TransactionService;
//# sourceMappingURL=transaction.service.d.ts.map