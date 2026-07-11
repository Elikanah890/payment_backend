import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/api-error';
import { logger } from '../config/logger';
import { config } from '../config/env';
import { ApiResponse } from '../types';

export function notFound(_req: Request, res: Response<ApiResponse>): void {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message, errors: err.details });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: err.flatten() });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: `Duplicate value for ${(err.meta?.target as string[])?.join(', ') || 'field'}`,
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(409).json({
        success: false,
        message: 'Operation blocked: related records exist (referential integrity)',
      });
      return;
    }
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  logger.error('Unhandled error', { message, requestId: req.requestId, path: req.path });
  res.status(500).json({
    success: false,
    message: config.isProd ? 'Internal server error' : message,
  });
}
