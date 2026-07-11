import { AuthUser } from '../../types';
import { ChangePasswordDto } from './auth.types';
interface Ctx {
    ip?: string;
    userAgent?: string;
}
export declare class AuthService {
    private failKey;
    private lockKey;
    private assertNotLocked;
    private registerFailure;
    private clearFailures;
    login(email: string, password: string, ctx: Ctx): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            phone: any;
            role: any;
            schoolId: any;
            school: {
                id: any;
                name: any;
                subdomain: any;
            } | null;
            lastLogin: any;
        };
    }>;
    private issueTokens;
    refresh(rawToken: string, ctx: Ctx): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            phone: any;
            role: any;
            schoolId: any;
            school: {
                id: any;
                name: any;
                subdomain: any;
            } | null;
            lastLogin: any;
        };
    }>;
    logout(rawToken: string | undefined, userId?: string): Promise<void>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    resetPassword(actor: AuthUser, targetUserId: string, newPassword: string): Promise<void>;
    me(userId: string): Promise<{
        id: any;
        email: any;
        fullName: any;
        phone: any;
        role: any;
        schoolId: any;
        school: {
            id: any;
            name: any;
            subdomain: any;
        } | null;
        lastLogin: any;
    }>;
    updateProfile(userId: string, dto: {
        fullName?: string;
        phone?: string;
        email?: string;
    }): Promise<{
        id: any;
        email: any;
        fullName: any;
        phone: any;
        role: any;
        schoolId: any;
        school: {
            id: any;
            name: any;
            subdomain: any;
        } | null;
        lastLogin: any;
    }>;
    private publicUser;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map