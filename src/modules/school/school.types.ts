import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(2),
  subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers, hyphens only'),
  phone: z.string().min(7),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  bankName: z.string().default('CRDB'),
  bankAccount: z.string().min(3),
  bankAccountName: z.string().min(2),
  lateFeeAmount: z.coerce.number().min(0).optional(),
  lateFeeGraceDays: z.coerce.number().int().min(0).optional(),
  academicYearStart: z.coerce.date(),
  academicYearEnd: z.coerce.date(),
});

export const updateSchoolSchema = createSchoolSchema.partial().omit({ subdomain: true });

export type CreateSchoolDto = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolDto = z.infer<typeof updateSchoolSchema>;
