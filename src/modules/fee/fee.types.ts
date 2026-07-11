import { z } from 'zod';

export const createFeePackageSchema = z.object({
  schoolId: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  annualFee: z.coerce.number().positive(),
  installmentType: z.enum(['MONTHLY', 'QUARTERLY', 'TERMLY']),
  installmentCount: z.coerce.number().int().positive(),
  installmentAmount: z.coerce.number().positive(),
  hostelAvailable: z.boolean().default(false),
  hostelAnnualFee: z.coerce.number().positive().optional(),
  hostelInstallment: z.coerce.number().positive().optional(),
  siblingDiscountEnabled: z.boolean().default(false),
  siblingDiscountPercentage: z.coerce.number().min(0).max(100).optional(),
  siblingDiscountAppliesAfter: z.coerce.number().int().min(1).default(2),
  classIds: z.array(z.string()).optional(),
});

export const updateFeePackageSchema = createFeePackageSchema.partial().omit({ schoolId: true, classIds: true });

export const assignClassSchema = z.object({ classId: z.string().min(1) });

export type CreateFeePackageDto = z.infer<typeof createFeePackageSchema>;
export type UpdateFeePackageDto = z.infer<typeof updateFeePackageSchema>;
