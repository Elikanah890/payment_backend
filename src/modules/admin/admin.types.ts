import { z } from 'zod';

export const createAdminSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  schoolId: z.string().min(1),
  password: z.string().min(8).optional(),
});

export const updateAdminSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export const listAdminQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  schoolId: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export type CreateAdminDto = z.infer<typeof createAdminSchema>;
export type UpdateAdminDto = z.infer<typeof updateAdminSchema>;
export type ListAdminQuery = z.infer<typeof listAdminQuery>;
