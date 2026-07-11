import { CookieOptions } from 'express';
import { config } from './env';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const ACCESS_MS = 15 * 60 * 1000;
const REFRESH_MS = config.jwt.refreshExpiryDays * 24 * 60 * 60 * 1000;

export function accessCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'none' : 'lax',
    maxAge: ACCESS_MS,
    path: '/',
  };
}

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'none' : 'lax',
    maxAge: REFRESH_MS,
    path: '/api/auth',
  };
}

export const refreshExpiryDate = () => new Date(Date.now() + REFRESH_MS);
