import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { ok, created } from '../../utils/api-error';
import { param } from '../../utils/validator';
import { recordAudit } from '../../middleware/audit';
import { paymentQuerySchema, summaryQuerySchema, RecordPaymentDto } from './payment.types';

export class PaymentController {
  async record(req: Request, res: Response) {
    const result = await paymentService.record(req.user!, req.body as RecordPaymentDto);
    for (const p of result.payments) {
      await recordAudit({
        userId: req.user!.id,
        schoolId: p.schoolId,
        action: 'PAYMENT_RECORDED',
        tableName: 'Payment',
        recordId: p.id,
        newValues: { amount: p.amount.toString(), receiptNumber: p.receiptNumber },
      }).catch(() => {});
    }
    created(res, result, `Recorded payment across ${result.count} allocation(s)`);
  }

  async list(req: Request, res: Response) {
    const q = paymentQuerySchema.parse(req.query);
    const { data, meta } = await paymentService.list(req.user!, q);
    ok(res, data, undefined, meta);
  }

  async get(req: Request, res: Response) {
    ok(res, await paymentService.getById(req.user!, param(req, 'id')));
  }

  async studentPayments(req: Request, res: Response) {
    ok(res, await paymentService.studentPayments(req.user!, param(req, 'studentId')));
  }

  async verify(req: Request, res: Response) {
    const p = await paymentService.verify(req.user!, param(req, 'id'), req.body?.notes);
    await recordAudit({ userId: req.user!.id, schoolId: p.schoolId, action: 'PAYMENT_VERIFIED', tableName: 'Payment', recordId: p.id });
    ok(res, p, 'Payment verified');
  }

  async void(req: Request, res: Response) {
    const p = await paymentService.void(req.user!, param(req, 'id'), req.body.reason);
    await recordAudit({ userId: req.user!.id, schoolId: p.schoolId, action: 'PAYMENT_VOIDED', tableName: 'Payment', recordId: p.id });
    ok(res, p, 'Payment voided');
  }

  async refund(req: Request, res: Response) {
    const p = await paymentService.refund(req.user!, param(req, 'id'), req.body.reason);
    await recordAudit({ userId: req.user!.id, schoolId: p.schoolId, action: 'PAYMENT_REFUNDED', tableName: 'Payment', recordId: p.id });
    ok(res, p, 'Payment refunded');
  }

  async summary(req: Request, res: Response) {
    const q = summaryQuerySchema.parse(req.query);
    ok(res, await paymentService.summary(req.user!, q.schoolId, q.year, q.month));
  }
}

export const paymentController = new PaymentController();
