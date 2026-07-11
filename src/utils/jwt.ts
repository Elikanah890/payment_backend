import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';
import { AuthUser } from '../types';

interface AccessPayload {
  sub: string;
  email: string;
  role: AuthUser['role'];
  schoolId: string | null;
}

export function signAccessToken(user: AuthUser): string {
  const payload: AccessPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
  };
  return jwt.sign(payload, config.jwt.accessSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AuthUser {
  const d = jwt.verify(token, config.jwt.accessSecret, { algorithms: ['HS256'] }) as AccessPayload;
  return { id: d.sub, email: d.email, role: d.role, schoolId: d.schoolId ?? null };
}

// Opaque refresh token; only its SHA-256 hash is stored.
export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(48).toString('hex');
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
