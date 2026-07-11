import { Router, Request, Response } from 'express';
import { logger } from '../../config/logger';
import { asyncHandler } from '../../utils/api-error';
import { ApiResponse } from '../../types';
import { selcomProvider } from '../transaction/selcom.provider';
import { transactionService } from '../transaction/transaction.service';

const router = Router();

router.post(
  '/selcom',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const signature = (req.headers['x-webhook-signature'] as string) || (req.headers['x-selcom-signature'] as string) || '';
    const raw = (req as any).rawBody || JSON.stringify(req.body ?? {});

    if (!selcomProvider.verifyWebhookSignature(raw, signature)) {
      logger.warn('Rejected webhook: invalid signature');
      res.status(401).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const payload = req.body || {};
    const providerRef = (payload.reference || payload.transaction_id || payload.providerRef || payload.order_id) as string;
    if (!providerRef) {
      res.status(400).json({ success: false, message: 'Missing provider reference' });
      return;
    }

    const result = await transactionService.processWebhook(providerRef, payload);
    res.json({ success: true, message: 'Webhook processed', data: result });
  })
);

export default router;
