import { Request, Response, NextFunction } from 'express';
import { redisIncr, redisExpire } from '../config/redis';
import { config } from '../config/env';
import { ApiResponse } from '../types';

export function rateLimit(opts?: { windowSec?: number; max?: number; keyPrefix?: string }) {
  const windowSec = opts?.windowSec ?? config.security.rateWindowSec;
  const max = opts?.max ?? config.security.rateMax;
  const prefix = opts?.keyPrefix ?? 'rl';

  return async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    const id = req.user?.id || req.ip || 'anon';
    const key = `${prefix}:${id}:${Math.floor(Date.now() / (windowSec * 1000))}`;
    try {
      const count = await redisIncr(key);
      if (count === 1) await redisExpire(key, windowSec);
      if (count !== null && count > max) {
        res.status(429).json({ success: false, message: 'Too many requests' });
        return;
      }
    } catch {
      // fail-open if redis is unavailable
    }
    next();
  };
}
