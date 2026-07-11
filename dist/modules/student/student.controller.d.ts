import { Request, Response } from 'express';
export declare class StudentController {
    create(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
    search(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    withdraw(req: Request, res: Response): Promise<void>;
    permanentDelete(req: Request, res: Response): Promise<void>;
    bulk(req: Request, res: Response): Promise<void>;
}
export declare const studentController: StudentController;
//# sourceMappingURL=student.controller.d.ts.map