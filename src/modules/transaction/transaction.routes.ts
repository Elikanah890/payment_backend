import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { asyncHandler, ok, created } from '../../utils/api-error';
import { idParam, param } from '../../utils/validator';
import { transactionService } from './transaction.service';

const initiateSchema = z.object({
  studentId: z.string().min(1),
  amount: z.coerce.number().positive().multipleOf(100),
  phone: z.string().min(9),
  provider: z.enum(['mpesa', 'tigo', 'airtel']).optional(),
});

const router = Router();
router.use(authenticate);

router.post(
  '/initiate',
  validate({ body: initiateSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    created(res, await transactionService.initiate(req.user!, req.body), 'Payment initiated');
  })
);

router.get(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req: Request, res: Response) => {
    ok(res, await transactionService.getById(param(req, 'id')));
  })
);

export default router;
