"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const api_error_1 = require("../utils/api-error");
const auth_1 = require("../config/auth");
function authenticate(req, _res, next) {
    try {
        const header = req.headers.authorization;
        let token;
        if (header && header.startsWith('Bearer ')) {
            token = header.slice(7);
        }
        else if (req.cookies?.[auth_1.ACCESS_COOKIE]) {
            token = req.cookies[auth_1.ACCESS_COOKIE];
        }
        if (!token)
            throw api_error_1.ApiError.unauthorized('Authentication required');
        req.user = (0, jwt_1.verifyAccessToken)(token);
        next();
    }
    catch (e) {
        if (e?.name === 'TokenExpiredError')
            return next(api_error_1.ApiError.unauthorized('Token expired'));
        if (e instanceof api_error_1.ApiError)
            return next(e);
        next(api_error_1.ApiError.unauthorized('Invalid token'));
    }
}
//# sourceMappingURL=auth.js.map