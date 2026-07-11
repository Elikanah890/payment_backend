import { Request, Response } from 'express';
export declare class AuthController {
    login(req: Request, res: Response): Promise<void>;
    refresh(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    me(req: Request, res: Response): Promise<void>;
    changePassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    updateProfile(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map