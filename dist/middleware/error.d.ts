import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
export declare function notFound(_req: Request, res: Response<ApiResponse>): void;
export declare function errorHandler(err: unknown, req: Request, res: Response<ApiResponse>, _next: NextFunction): void;
//# sourceMappingURL=error.d.ts.map