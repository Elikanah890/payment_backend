import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params) as any;
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.defineProperty(req, 'validatedQuery', { value: parsed, writable: true });
        (req as any).validatedQuery = parsed;
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function getQuery<T>(req: Request): T {
  return ((req as any).validatedQuery ?? req.query) as T;
}
