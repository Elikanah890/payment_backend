import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
export declare function rateLimit(opts?: {
    windowSec?: number;
    max?: number;
    keyPrefix?: string;
}): (req: Request, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rate-limit.d.ts.map