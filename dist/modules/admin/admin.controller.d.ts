import { Request, Response } from 'express';
export declare class AdminController {
    create(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    deactivate(req: Request, res: Response): Promise<void>;
    enable(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    activity(req: Request, res: Response): Promise<void>;
}
export declare const adminController: AdminController;
//# sourceMappingURL=admin.controller.d.ts.map