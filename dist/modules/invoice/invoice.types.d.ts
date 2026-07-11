import { z } from 'zod';
export declare const generateInvoiceSchema: z.ZodObject<{
    schoolId: z.ZodOptional<z.ZodString>;
    studentId: z.ZodOptional<z.ZodString>;
    classId: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    dueDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const adjustInvoiceSchema: z.ZodObject<{
    type: z.ZodEnum<{
        CREDIT_NOTE: "CREDIT_NOTE";
        DEBIT_NOTE: "DEBIT_NOTE";
        DISCOUNT: "DISCOUNT";
    }>;
    amount: z.ZodCoercedNumber<unknown>;
    reason: z.ZodString;
}, z.core.$strip>;
export declare const waiveInvoiceSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export declare const listInvoiceQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        VOID: "VOID";
        UNPAID: "UNPAID";
        PARTIALLY_PAID: "PARTIALLY_PAID";
        PAID: "PAID";
        OVERDUE: "OVERDUE";
        CANCELLED: "CANCELLED";
    }>>;
    classId: z.ZodOptional<z.ZodString>;
    studentId: z.ZodOptional<z.ZodString>;
    schoolId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GenerateInvoiceDto = z.infer<typeof generateInvoiceSchema>;
export type AdjustInvoiceDto = z.infer<typeof adjustInvoiceSchema>;
export type WaiveInvoiceDto = z.infer<typeof waiveInvoiceSchema>;
export type ListInvoiceQuery = z.infer<typeof listInvoiceQuery>;
//# sourceMappingURL=invoice.types.d.ts.map