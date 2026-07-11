import { z } from 'zod';
export declare const createSchoolSchema: z.ZodObject<{
    name: z.ZodString;
    subdomain: z.ZodString;
    phone: z.ZodString;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    logoUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    bankName: z.ZodDefault<z.ZodString>;
    bankAccount: z.ZodString;
    bankAccountName: z.ZodString;
    lateFeeAmount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    lateFeeGraceDays: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    academicYearStart: z.ZodCoercedDate<unknown>;
    academicYearEnd: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
export declare const updateSchoolSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    bankName: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    bankAccount: z.ZodOptional<z.ZodString>;
    bankAccountName: z.ZodOptional<z.ZodString>;
    lateFeeAmount: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    lateFeeGraceDays: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    academicYearStart: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    academicYearEnd: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export type CreateSchoolDto = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolDto = z.infer<typeof updateSchoolSchema>;
//# sourceMappingURL=school.types.d.ts.map