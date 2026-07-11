import { Request, Response } from 'express';
export declare class SchoolController {
    create(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    deactivate(req: Request, res: Response): Promise<void>;
    reactivate(req: Request, res: Response): Promise<void>;
    stats(req: Request, res: Response): Promise<void>;
}
export declare const schoolController: SchoolController;
//# sourceMappingURL=school.controller.d.ts.map