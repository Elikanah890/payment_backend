import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/api-error';
import { ACCESS_COOKIE } from '../config/auth';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    let token: string | undefined;

    if (header && header.startsWith('Bearer ')) {
      token = header.slice(7);
    } else if (req.cookies?.[ACCESS_COOKIE]) {
      token = req.cookies[ACCESS_COOKIE];
    }

    if (!token) throw ApiError.unauthorized('Authentication required');

    req.user = verifyAccessToken(token);
    next();
  } catch (e: any) {
    if (e?.name === 'TokenExpiredError') return next(ApiError.unauthorized('Token expired'));
    if (e instanceof ApiError) return next(e);
    next(ApiError.unauthorized('Invalid token'));
  }
}
