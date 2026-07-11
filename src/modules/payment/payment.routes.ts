import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/api-error';
import { idParam } from '../../utils/validator';
import { recordPaymentSchema, verifyPaymentSchema, refundPaymentSchema, voidPaymentSchema } from './payment.types';

const router = Router();
router.use(authenticate);

router.post('/record', validate({ body: recordPaymentSchema }), asyncHandler(paymentController.record.bind(paymentController)));
router.get('/', asyncHandler(paymentController.list.bind(paymentController)));
router.get('/summary', asyncHandler(paymentController.summary.bind(paymentController)));
router.get('/student/:studentId', asyncHandler(paymentController.studentPayments.bind(paymentController)));
router.get('/:id', validate({ params: idParam }), asyncHandler(paymentController.get.bind(paymentController)));
router.put('/:id/verify', validate({ params: idParam, body: verifyPaymentSchema }), asyncHandler(paymentController.verify.bind(paymentController)));
router.put('/:id/void', validate({ params: idParam, body: voidPaymentSchema }), asyncHandler(paymentController.void.bind(paymentController)));
router.put('/:id/refund', validate({ params: idParam, body: refundPaymentSchema }), asyncHandler(paymentController.refund.bind(paymentController)));

export default router;
