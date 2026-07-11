import { Request, Response } from 'express';
export declare class PaymentController {
    record(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    studentPayments(req: Request, res: Response): Promise<void>;
    verify(req: Request, res: Response): Promise<void>;
    void(req: Request, res: Response): Promise<void>;
    refund(req: Request, res: Response): Promise<void>;
    summary(req: Request, res: Response): Promise<void>;
}
export declare const paymentController: PaymentController;
//# sourceMappingURL=payment.controller.d.ts.map