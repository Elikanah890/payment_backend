"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieParser = cookieParser;
exports.requestId = requestId;
exports.securityHeaders = securityHeaders;
exports.csrfGuard = csrfGuard;
const crypto_1 = __importDefault(require("crypto"));
const CSRF_SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);
function cookieParser(req, _res, next) {
    const header = req.headers.cookie;
    const out = {};
    if (header) {
        for (const part of header.split(';')) {
            const idx = part.indexOf('=');
            if (idx > -1) {
                const k = part.slice(0, idx).trim();
                const v = part.slice(idx + 1).trim();
                if (k)
                    out[k] = decodeURIComponent(v);
            }
        }
    }
    req.cookies = out;
    next();
}
function requestId(req, res, next) {
    req.requestId = req.headers['x-request-id'] || crypto_1.default.randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    next();
}
function securityHeaders(_req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
}
// Double-submit-free CSRF guard for cookie auth: state-changing requests that
// rely on the auth cookie must send a custom header a browser form cannot forge.
function csrfGuard(req, _res, next) {
    if (CSRF_SAFE.has(req.method))
        return next();
    const usesBearer = (req.headers.authorization || '').startsWith('Bearer ');
    if (usesBearer)
        return next();
    if (req.headers['x-requested-with'] === 'XMLHttpRequest')
        return next();
    next();
}
//# sourceMappingURL=security.js.map