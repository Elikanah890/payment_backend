import { z } from 'zod';

export const createClassSchema = z.object({
  schoolId: z.string().optional(),
  name: z.string().min(1).max(20),
  level: z.enum(['PRE_PRIMARY', 'PRIMARY', 'SECONDARY']),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const updateClassSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  level: z.enum(['PRE_PRIMARY', 'PRIMARY', 'SECONDARY']).optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateClassDto = z.infer<typeof createClassSchema>;
export type UpdateClassDto = z.infer<typeof updateClassSchema>;
