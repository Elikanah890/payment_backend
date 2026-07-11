import { AuthUser } from '../types';
export declare function signAccessToken(user: AuthUser): string;
export declare function verifyAccessToken(token: string): AuthUser;
export declare function generateRefreshToken(): {
    token: string;
    hash: string;
};
export declare function hashToken(token: string): string;
//# sourceMappingURL=jwt.d.ts.map