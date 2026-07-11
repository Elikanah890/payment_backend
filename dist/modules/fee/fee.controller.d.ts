import { Request, Response } from 'express';
export declare class FeeController {
    create(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    remove(req: Request, res: Response): Promise<void>;
    assignClass(req: Request, res: Response): Promise<void>;
}
export declare const feeController: FeeController;
//# sourceMappingURL=fee.controller.d.ts.map