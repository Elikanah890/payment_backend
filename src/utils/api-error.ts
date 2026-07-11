import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiResponse, PaginationMeta } from '../types';

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(m = 'Bad request', d?: unknown) {
    return new ApiError(400, m, d);
  }
  static unauthorized(m = 'Unauthorized') {
    return new ApiError(401, m);
  }
  static forbidden(m = 'Forbidden') {
    return new ApiError(403, m);
  }
  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found`);
  }
  static conflict(m = 'Conflict') {
    return new ApiError(409, m);
  }
  static tooMany(m = 'Too many requests') {
    return new ApiError(429, m);
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function ok<T>(res: Response, data?: T, message?: string, meta?: PaginationMeta): void {
  const body: ApiResponse<T> = { success: true, data, message, meta };
  res.json(body);
}

export function created<T>(res: Response, data?: T, message?: string): void {
  res.status(201).json({ success: true, data, message } satisfies ApiResponse<T>);
}
