import { CookieOptions } from 'express';
export declare const ACCESS_COOKIE = "access_token";
export declare const REFRESH_COOKIE = "refresh_token";
export declare function accessCookieOptions(): CookieOptions;
export declare function refreshCookieOptions(): CookieOptions;
export declare const refreshExpiryDate: () => Date;
//# sourceMappingURL=auth.d.ts.map