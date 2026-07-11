import { Request, Response, NextFunction } from 'express';
export declare function cookieParser(req: Request, _res: Response, next: NextFunction): void;
export declare function requestId(req: Request, res: Response, next: NextFunction): void;
export declare function securityHeaders(_req: Request, res: Response, next: NextFunction): void;
export declare function csrfGuard(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=security.d.ts.map