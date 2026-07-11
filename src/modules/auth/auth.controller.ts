import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ok } from '../../utils/api-error';
import { ApiError } from '../../utils/api-error';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from '../../config/auth';
import { LoginDto, ChangePasswordDto, ResetPasswordDto } from './auth.types';

function ctxOf(req: Request) {
  return { ip: req.ip, userAgent: req.headers['user-agent'] };
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
}

export class AuthController {
  async login(req: Request, res: Response) {
    const dto = req.body as LoginDto;
    const { user, accessToken, refreshToken } = await authService.login(dto.email, dto.password, ctxOf(req));
    setAuthCookies(res, accessToken, refreshToken);
    ok(res, { user, accessToken, refreshToken }, 'Login successful');
  }

  async refresh(req: Request, res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] || (req.body?.refreshToken as string);
    const { user, accessToken, refreshToken } = await authService.refresh(raw, ctxOf(req));
    setAuthCookies(res, accessToken, refreshToken);
    ok(res, { user, accessToken, refreshToken }, 'Token refreshed');
  }

  async logout(req: Request, res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] || (req.body?.refreshToken as string);
    await authService.logout(raw, req.user?.id);
    res.clearCookie(ACCESS_COOKIE, accessCookieOptions());
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
    ok(res, undefined, 'Logged out');
  }

  async me(req: Request, res: Response) {
    ok(res, await authService.me(req.user!.id));
  }

  async changePassword(req: Request, res: Response) {
    await authService.changePassword(req.user!.id, req.body as ChangePasswordDto);
    ok(res, undefined, 'Password changed');
  }

  async resetPassword(req: Request, res: Response) {
    const dto = req.body as ResetPasswordDto;
    if (!req.user) throw ApiError.unauthorized();
    await authService.resetPassword(req.user, dto.userId, dto.newPassword);
    ok(res, undefined, 'Password reset');
  }

  async updateProfile(req: Request, res: Response) {
    const { fullName, phone, email } = req.body;
    ok(res, await authService.updateProfile(req.user!.id, { fullName, phone, email }), 'Profile updated');
  }
}

export const authController = new AuthController();
