import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { asyncHandler, ok } from '../../utils/api-error';
import { paginationSchema } from '../../utils/validator';
import { smsService } from './sms.service';

const sendSchema = z.object({
  message: z.string().min(1).max(1600),
  phone: z.string().min(7).optional(),
  studentId: z.string().optional(),
  guardianId: z.string().optional(),
});
const bulkSchema = z.object({ message: z.string().min(1), studentIds: z.array(z.string()).min(1) });

const router = Router();
router.use(authenticate);

router.post('/send', validate({ body: sendSchema }), asyncHandler(async (req: Request, res: Response) => ok(res, await smsService.send(req.user!, req.body))));
router.post('/bulk', validate({ body: bulkSchema }), asyncHandler(async (req: Request, res: Response) => ok(res, await smsService.bulk(req.user!, req.body))));
router.get('/history', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationSchema.parse(req.query);
  const { data, meta } = await smsService.history(req.user!, page, limit, req.query.schoolId as string | undefined);
  ok(res, data, undefined, meta);
}));
router.get('/balance', asyncHandler(async (_req: Request, res: Response) => ok(res, await smsService.balance())));
router.post('/reminders', asyncHandler(async (req: Request, res: Response) => ok(res, await smsService.sendOverdueReminders(req.query.schoolId as string | undefined))));

export default router;
