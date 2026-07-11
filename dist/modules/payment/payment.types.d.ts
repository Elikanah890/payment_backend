import { z } from 'zod';
export declare const recordPaymentSchema: z.ZodObject<{
    studentId: z.ZodString;
    invoiceId: z.ZodString;
    amount: z.ZodCoercedNumber<unknown>;
    method: z.ZodEnum<{
        CASH: "CASH";
        BANK_TRANSFER: "BANK_TRANSFER";
        M_PESA: "M_PESA";
        TIGO_PESA: "TIGO_PESA";
        AIRTEL_MONEY: "AIRTEL_MONEY";
    }>;
    bankReference: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    receiptPhoto: z.ZodOptional<z.ZodString>;
    paymentDate: z.ZodDefault<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export declare const verifyPaymentSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const refundPaymentSchema: z.ZodObject<{
    reason: z.ZodString;
    amount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const voidPaymentSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export declare const paymentQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    studentId: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        COMPLETED: "COMPLETED";
        FAILED: "FAILED";
        REFUNDED: "REFUNDED";
        VOID: "VOID";
    }>>;
    startDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    endDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    schoolId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const summaryQuerySchema: z.ZodObject<{
    schoolId: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    month: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type RecordPaymentDto = z.infer<typeof recordPaymentSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
//# sourceMappingURL=payment.types.d.ts.map