"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshExpiryDate = exports.REFRESH_COOKIE = exports.ACCESS_COOKIE = void 0;
exports.accessCookieOptions = accessCookieOptions;
exports.refreshCookieOptions = refreshCookieOptions;
const env_1 = require("./env");
exports.ACCESS_COOKIE = 'access_token';
exports.REFRESH_COOKIE = 'refresh_token';
const ACCESS_MS = 15 * 60 * 1000;
const REFRESH_MS = env_1.config.jwt.refreshExpiryDays * 24 * 60 * 60 * 1000;
function accessCookieOptions() {
    return {
        httpOnly: true,
        secure: env_1.config.isProd,
        sameSite: env_1.config.isProd ? 'none' : 'lax',
        maxAge: ACCESS_MS,
        path: '/',
    };
}
function refreshCookieOptions() {
    return {
        httpOnly: true,
        secure: env_1.config.isProd,
        sameSite: env_1.config.isProd ? 'none' : 'lax',
        maxAge: REFRESH_MS,
        path: '/api/auth',
    };
}
const refreshExpiryDate = () => new Date(Date.now() + REFRESH_MS);
exports.refreshExpiryDate = refreshExpiryDate;
//# sourceMappingURL=auth.js.map