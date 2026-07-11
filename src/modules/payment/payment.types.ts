import { z } from 'zod';

export const recordPaymentSchema = z.object({
  studentId: z.string().min(1),
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive().multipleOf(100),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'M_PESA', 'TIGO_PESA', 'AIRTEL_MONEY']),
  bankReference: z.string().optional(),
  notes: z.string().optional(),
  receiptPhoto: z.string().optional(),
  paymentDate: z.coerce.date().default(() => new Date()),
});

export const verifyPaymentSchema = z.object({
  notes: z.string().optional(),
});

export const refundPaymentSchema = z.object({
  reason: z.string().min(2),
  amount: z.coerce.number().positive().optional(),
});

export const voidPaymentSchema = z.object({
  reason: z.string().min(2),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  studentId: z.string().optional(),
  method: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'VOID']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  schoolId: z.string().optional(),
});

export const summaryQuerySchema = z.object({
  schoolId: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export type RecordPaymentDto = z.infer<typeof recordPaymentSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
