import { z } from 'zod';
import { Request } from 'express';

export function param(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? v[0] : v ?? '';
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParam = z.object({ id: z.string().min(1) });

export function paginate(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

export function meta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}
