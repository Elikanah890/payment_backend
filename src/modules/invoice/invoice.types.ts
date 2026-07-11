import { z } from 'zod';

export const generateInvoiceSchema = z.object({
  schoolId: z.string().optional(),
  studentId: z.string().optional(),
  classId: z.string().optional(),
  amount: z.coerce.number().positive().multipleOf(100).optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const adjustInvoiceSchema = z.object({
  type: z.enum(['CREDIT_NOTE', 'DEBIT_NOTE', 'DISCOUNT']),
  amount: z.coerce.number().positive(),
  reason: z.string().min(2),
});

export const waiveInvoiceSchema = z.object({
  reason: z.string().min(2),
});

export const listInvoiceQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID']).optional(),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  schoolId: z.string().optional(),
});

export type GenerateInvoiceDto = z.infer<typeof generateInvoiceSchema>;
export type AdjustInvoiceDto = z.infer<typeof adjustInvoiceSchema>;
export type WaiveInvoiceDto = z.infer<typeof waiveInvoiceSchema>;
export type ListInvoiceQuery = z.infer<typeof listInvoiceQuery>;
