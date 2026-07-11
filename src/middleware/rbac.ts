import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ApiError } from '../utils/api-error';
import { AuthUser } from '../types';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (roles.length && !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}

export const superAdminOnly = authorize(UserRole.SUPER_ADMIN);

/**
 * Resolve which school a request operates on.
 * - SUPER_ADMIN: may target any school (via requestedSchoolId) or all (null).
 * - ADMIN: always locked to their own school; a mismatched request is forbidden.
 */
export function resolveSchoolScope(user: AuthUser, requestedSchoolId?: string): string | null {
  if (user.role === UserRole.SUPER_ADMIN) {
    return requestedSchoolId || null;
  }
  if (!user.schoolId) throw ApiError.forbidden('No school context');
  if (requestedSchoolId && requestedSchoolId !== user.schoolId) {
    throw ApiError.forbidden('Cannot access another school');
  }
  return user.schoolId;
}

/** Guard an entity's schoolId against the caller (IDOR prevention). */
export function assertSameSchool(user: AuthUser, entitySchoolId: string | null): void {
  if (user.role === UserRole.SUPER_ADMIN) return;
  if (!entitySchoolId || entitySchoolId !== user.schoolId) {
    throw ApiError.notFound('Resource');
  }
}
