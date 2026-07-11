import { z } from 'zod';
export declare const createStudentSchema: z.ZodObject<{
    schoolId: z.ZodOptional<z.ZodString>;
    fullName: z.ZodString;
    dateOfBirth: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    gender: z.ZodOptional<z.ZodEnum<{
        MALE: "MALE";
        FEMALE: "FEMALE";
    }>>;
    classId: z.ZodString;
    feePackageId: z.ZodString;
    isHostel: z.ZodDefault<z.ZodBoolean>;
    guardianId: z.ZodOptional<z.ZodString>;
    guardian: z.ZodOptional<z.ZodObject<{
        fullName: z.ZodString;
        phone: z.ZodString;
        relationship: z.ZodEnum<{
            OTHER: "OTHER";
            FATHER: "FATHER";
            MOTHER: "MOTHER";
            GUARDIAN: "GUARDIAN";
            UNCLE: "UNCLE";
            AUNT: "AUNT";
            SISTER: "SISTER";
            BROTHER: "BROTHER";
        }>;
        email: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateStudentSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    gender: z.ZodOptional<z.ZodEnum<{
        MALE: "MALE";
        FEMALE: "FEMALE";
    }>>;
    classId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const withdrawSchema: z.ZodObject<{
    status: z.ZodEnum<{
        WITHDRAWN: "WITHDRAWN";
        GRADUATED: "GRADUATED";
        TRANSFERRED: "TRANSFERRED";
        SUSPENDED: "SUSPENDED";
    }>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const listStudentQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    classId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        WITHDRAWN: "WITHDRAWN";
        GRADUATED: "GRADUATED";
        TRANSFERRED: "TRANSFERRED";
        SUSPENDED: "SUSPENDED";
    }>>;
    q: z.ZodOptional<z.ZodString>;
    schoolId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const bulkImportSchema: z.ZodObject<{
    students: z.ZodArray<z.ZodObject<{
        schoolId: z.ZodOptional<z.ZodString>;
        fullName: z.ZodString;
        dateOfBirth: z.ZodOptional<z.ZodCoercedDate<unknown>>;
        gender: z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
        }>>;
        classId: z.ZodString;
        feePackageId: z.ZodString;
        isHostel: z.ZodDefault<z.ZodBoolean>;
        guardianId: z.ZodOptional<z.ZodString>;
        guardian: z.ZodOptional<z.ZodObject<{
            fullName: z.ZodString;
            phone: z.ZodString;
            relationship: z.ZodEnum<{
                OTHER: "OTHER";
                FATHER: "FATHER";
                MOTHER: "MOTHER";
                GUARDIAN: "GUARDIAN";
                UNCLE: "UNCLE";
                AUNT: "AUNT";
                SISTER: "SISTER";
                BROTHER: "BROTHER";
            }>;
            email: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type WithdrawDto = z.infer<typeof withdrawSchema>;
export type ListStudentQuery = z.infer<typeof listStudentQuery>;
//# sourceMappingURL=student.types.d.ts.map