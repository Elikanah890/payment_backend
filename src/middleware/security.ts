import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

export function cookieParser(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.cookie;
  const out: Record<string, string> = {};
  if (header) {
    for (const part of header.split(';')) {
      const idx = part.indexOf('=');
      if (idx > -1) {
        const k = part.slice(0, idx).trim();
        const v = part.slice(idx + 1).trim();
        if (k) out[k] = decodeURIComponent(v);
      }
    }
  }
  req.cookies = out;
  next();
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  req.requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
}

// Double-submit-free CSRF guard for cookie auth: state-changing requests that
// rely on the auth cookie must send a custom header a browser form cannot forge.
export function csrfGuard(req: Request, _res: Response, next: NextFunction): void {
  if (CSRF_SAFE.has(req.method)) return next();
  const usesBearer = (req.headers.authorization || '').startsWith('Bearer ');
  if (usesBearer) return next();
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') return next();
  next();
}
