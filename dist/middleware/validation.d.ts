import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
interface Schemas {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}
export declare function validate(schemas: Schemas): (req: Request, _res: Response, next: NextFunction) => void;
export declare function getQuery<T>(req: Request): T;
export {};
//# sourceMappingURL=validation.d.ts.map