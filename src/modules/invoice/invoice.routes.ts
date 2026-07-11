import { Router } from 'express';
import { invoiceController } from './invoice.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/api-error';
import { idParam } from '../../utils/validator';
import { generateInvoiceSchema, adjustInvoiceSchema, waiveInvoiceSchema } from './invoice.types';

const router = Router();
router.use(authenticate);

router.post('/generate', validate({ body: generateInvoiceSchema }), asyncHandler(invoiceController.generate.bind(invoiceController)));
router.get('/', asyncHandler(invoiceController.list.bind(invoiceController)));
router.get('/overdue', asyncHandler(invoiceController.overdue.bind(invoiceController)));
router.get('/summary', asyncHandler(invoiceController.summary.bind(invoiceController)));
router.get('/:id', validate({ params: idParam }), asyncHandler(invoiceController.get.bind(invoiceController)));
router.put('/:id/adjust', validate({ params: idParam, body: adjustInvoiceSchema }), asyncHandler(invoiceController.adjust.bind(invoiceController)));
router.post('/:id/waive', validate({ params: idParam, body: waiveInvoiceSchema }), asyncHandler(invoiceController.waive.bind(invoiceController)));
router.get('/:id/print', validate({ params: idParam }), asyncHandler(invoiceController.print.bind(invoiceController)));
router.get('/:id/download', validate({ params: idParam }), asyncHandler(invoiceController.download.bind(invoiceController)));

export default router;
