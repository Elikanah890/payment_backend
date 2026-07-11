import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthUser } from '../types';
export declare function authorize(...roles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare const superAdminOnly: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Resolve which school a request operates on.
 * - SUPER_ADMIN: may target any school (via requestedSchoolId) or all (null).
 * - ADMIN: always locked to their own school; a mismatched request is forbidden.
 */
export declare function resolveSchoolScope(user: AuthUser, requestedSchoolId?: string): string | null;
/** Guard an entity's schoolId against the caller (IDOR prevention). */
export declare function assertSameSchool(user: AuthUser, entitySchoolId: string | null): void;
//# sourceMappingURL=rbac.d.ts.map