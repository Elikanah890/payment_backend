import { z } from 'zod';

const guardianInline = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  relationship: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'UNCLE', 'AUNT', 'SISTER', 'BROTHER', 'OTHER']),
  email: z.string().email().optional(),
});

export const createStudentSchema = z
  .object({
    schoolId: z.string().optional(),
    fullName: z.string().min(3).max(200),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    classId: z.string().min(1),
    feePackageId: z.string().min(1),
    isHostel: z.boolean().default(false),
    guardianId: z.string().optional(),
    guardian: guardianInline.optional(),
  })
  .refine((d) => d.guardianId || d.guardian, {
    message: 'Provide guardianId or guardian details',
    path: ['guardian'],
  });

export const updateStudentSchema = z.object({
  fullName: z.string().min(3).max(200).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  classId: z.string().optional(),
});

export const withdrawSchema = z.object({
  status: z.enum(['WITHDRAWN', 'TRANSFERRED', 'GRADUATED', 'SUSPENDED']),
  reason: z.string().optional(),
});

export const listStudentQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  classId: z.string().optional(),
  status: z.enum(['ACTIVE', 'WITHDRAWN', 'GRADUATED', 'TRANSFERRED', 'SUSPENDED']).optional(),
  q: z.string().optional(),
  schoolId: z.string().optional(),
});

export const bulkImportSchema = z.object({
  students: z.array(createStudentSchema).min(1).max(500),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type WithdrawDto = z.infer<typeof withdrawSchema>;
export type ListStudentQuery = z.infer<typeof listStudentQuery>;
