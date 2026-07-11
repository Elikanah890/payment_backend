import { z } from 'zod';
export declare const createAdminSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    schoolId: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateAdminSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const listAdminQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    schoolId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean | undefined, string | undefined>>;
}, z.core.$strip>;
export type CreateAdminDto = z.infer<typeof createAdminSchema>;
export type UpdateAdminDto = z.infer<typeof updateAdminSchema>;
export type ListAdminQuery = z.infer<typeof listAdminQuery>;
//# sourceMappingURL=admin.types.d.ts.map