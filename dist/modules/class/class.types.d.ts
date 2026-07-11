import { z } from 'zod';
export declare const createClassSchema: z.ZodObject<{
    schoolId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    level: z.ZodEnum<{
        PRE_PRIMARY: "PRE_PRIMARY";
        PRIMARY: "PRIMARY";
        SECONDARY: "SECONDARY";
    }>;
    description: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const updateClassSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodEnum<{
        PRE_PRIMARY: "PRE_PRIMARY";
        PRIMARY: "PRIMARY";
        SECONDARY: "SECONDARY";
    }>>;
    description: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateClassDto = z.infer<typeof createClassSchema>;
export type UpdateClassDto = z.infer<typeof updateClassSchema>;
//# sourceMappingURL=class.types.d.ts.map