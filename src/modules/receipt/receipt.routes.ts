import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/api-error';
import { idParam } from '../../utils/validator';
import { receiptService } from './receipt.service';
import { ok } from '../../utils/api-error';
import { param } from '../../utils/validator';
import { Request, Response } from 'express';

const router = Router();
router.use(authenticate);

router.get('/:id', validate({ params: idParam }), asyncHandler(async (req: Request, res: Response) => {
  ok(res, await receiptService.getById(req.user!, param(req, 'id')));
}));
router.get('/:id/pdf', validate({ params: idParam }), asyncHandler(async (req: Request, res: Response) => {
  const html = await receiptService.pdf(req.user!, param(req, 'id'));
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}));
router.post('/:id/print', validate({ params: idParam }), asyncHandler(async (req: Request, res: Response) => {
  ok(res, await receiptService.markPrinted(param(req, 'id')));
}));
router.post('/:id/email', validate({ params: idParam }), asyncHandler(async (req: Request, res: Response) => {
  ok(res, await receiptService.emailReceipt(req.user!, param(req, 'id')));
}));

export default router;
