"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.hashToken = hashToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
function signAccessToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwt.accessSecret, {
        algorithm: 'HS256',
        expiresIn: env_1.config.jwt.accessExpiry,
    });
}
function verifyAccessToken(token) {
    const d = jsonwebtoken_1.default.verify(token, env_1.config.jwt.accessSecret, { algorithms: ['HS256'] });
    return { id: d.sub, email: d.email, role: d.role, schoolId: d.schoolId ?? null };
}
// Opaque refresh token; only its SHA-256 hash is stored.
function generateRefreshToken() {
    const token = crypto_1.default.randomBytes(48).toString('hex');
    return { token, hash: hashToken(token) };
}
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
//# sourceMappingURL=jwt.js.map