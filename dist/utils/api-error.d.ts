import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PaginationMeta } from '../types';
export declare class ApiError extends Error {
    statusCode: number;
    details?: unknown;
    constructor(statusCode: number, message: string, details?: unknown);
    static badRequest(m?: string, d?: unknown): ApiError;
    static unauthorized(m?: string): ApiError;
    static forbidden(m?: string): ApiError;
    static notFound(resource?: string): ApiError;
    static conflict(m?: string): ApiError;
    static tooMany(m?: string): ApiError;
}
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => RequestHandler;
export declare function ok<T>(res: Response, data?: T, message?: string, meta?: PaginationMeta): void;
export declare function created<T>(res: Response, data?: T, message?: string): void;
//# sourceMappingURL=api-error.d.ts.map