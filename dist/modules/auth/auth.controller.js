"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const api_error_1 = require("../../utils/api-error");
const api_error_2 = require("../../utils/api-error");
const auth_1 = require("../../config/auth");
function ctxOf(req) {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
}
function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie(auth_1.ACCESS_COOKIE, accessToken, (0, auth_1.accessCookieOptions)());
    res.cookie(auth_1.REFRESH_COOKIE, refreshToken, (0, auth_1.refreshCookieOptions)());
}
class AuthController {
    async login(req, res) {
        const dto = req.body;
        const { user, accessToken, refreshToken } = await auth_service_1.authService.login(dto.email, dto.password, ctxOf(req));
        setAuthCookies(res, accessToken, refreshToken);
        (0, api_error_1.ok)(res, { user, accessToken, refreshToken }, 'Login successful');
    }
    async refresh(req, res) {
        const raw = req.cookies?.[auth_1.REFRESH_COOKIE] || req.body?.refreshToken;
        const { user, accessToken, refreshToken } = await auth_service_1.authService.refresh(raw, ctxOf(req));
        setAuthCookies(res, accessToken, refreshToken);
        (0, api_error_1.ok)(res, { user, accessToken, refreshToken }, 'Token refreshed');
    }
    async logout(req, res) {
        const raw = req.cookies?.[auth_1.REFRESH_COOKIE] || req.body?.refreshToken;
        await auth_service_1.authService.logout(raw, req.user?.id);
        res.clearCookie(auth_1.ACCESS_COOKIE, (0, auth_1.accessCookieOptions)());
        res.clearCookie(auth_1.REFRESH_COOKIE, (0, auth_1.refreshCookieOptions)());
        (0, api_error_1.ok)(res, undefined, 'Logged out');
    }
    async me(req, res) {
        (0, api_error_1.ok)(res, await auth_service_1.authService.me(req.user.id));
    }
    async changePassword(req, res) {
        await auth_service_1.authService.changePassword(req.user.id, req.body);
        (0, api_error_1.ok)(res, undefined, 'Password changed');
    }
    async resetPassword(req, res) {
        const dto = req.body;
        if (!req.user)
            throw api_error_2.ApiError.unauthorized();
        await auth_service_1.authService.resetPassword(req.user, dto.userId, dto.newPassword);
        (0, api_error_1.ok)(res, undefined, 'Password reset');
    }
    async updateProfile(req, res) {
        const { fullName, phone, email } = req.body;
        (0, api_error_1.ok)(res, await auth_service_1.authService.updateProfile(req.user.id, { fullName, phone, email }), 'Profile updated');
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map