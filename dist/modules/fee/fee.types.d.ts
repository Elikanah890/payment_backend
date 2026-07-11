import { z } from 'zod';
export declare const createFeePackageSchema: z.ZodObject<{
    schoolId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    annualFee: z.ZodCoercedNumber<unknown>;
    installmentType: z.ZodEnum<{
        MONTHLY: "MONTHLY";
        QUARTERLY: "QUARTERLY";
        TERMLY: "TERMLY";
    }>;
    installmentCount: z.ZodCoercedNumber<unknown>;
    installmentAmount: z.ZodCoercedNumber<unknown>;
    hostelAvailable: z.ZodDefault<z.ZodBoolean>;
    hostelAnnualFee: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    hostelInstallment: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    siblingDiscountEnabled: z.ZodDefault<z.ZodBoolean>;
    siblingDiscountPercentage: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    siblingDiscountAppliesAfter: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    classIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateFeePackageSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    annualFee: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    installmentType: z.ZodOptional<z.ZodEnum<{
        MONTHLY: "MONTHLY";
        QUARTERLY: "QUARTERLY";
        TERMLY: "TERMLY";
    }>>;
    installmentCount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    installmentAmount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    hostelAvailable: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    hostelAnnualFee: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    hostelInstallment: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    siblingDiscountEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    siblingDiscountPercentage: z.ZodOptional<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    siblingDiscountAppliesAfter: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export declare const assignClassSchema: z.ZodObject<{
    classId: z.ZodString;
}, z.core.$strip>;
export type CreateFeePackageDto = z.infer<typeof createFeePackageSchema>;
export type UpdateFeePackageDto = z.infer<typeof updateFeePackageSchema>;
//# sourceMappingURL=fee.types.d.ts.map