import { Request, Response } from 'express';
export declare class ClassController {
    list(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    deactivate(req: Request, res: Response): Promise<void>;
    reactivate(req: Request, res: Response): Promise<void>;
    listForSchool(req: Request, res: Response): Promise<void>;
    createForSchool(req: Request, res: Response): Promise<void>;
}
export declare const classController: ClassController;
//# sourceMappingURL=class.controller.d.ts.map