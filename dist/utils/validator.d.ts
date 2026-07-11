import { z } from 'zod';
import { Request } from 'express';
export declare function param(req: Request, name: string): string;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const idParam: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare function paginate(page: number, limit: number): {
    skip: number;
    take: number;
};
export declare function meta(page: number, limit: number, total: number): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};
//# sourceMappingURL=validator.d.ts.map