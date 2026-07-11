import { Request, Response } from 'express';
export declare class InvoiceController {
    generate(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    adjust(req: Request, res: Response): Promise<void>;
    waive(req: Request, res: Response): Promise<void>;
    overdue(req: Request, res: Response): Promise<void>;
    summary(req: Request, res: Response): Promise<void>;
    print(req: Request, res: Response): Promise<void>;
    download(req: Request, res: Response): Promise<void>;
}
export declare const invoiceController: InvoiceController;
//# sourceMappingURL=invoice.controller.d.ts.map