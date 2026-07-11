import { Router } from 'express';
import { feeController } from './fee.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/api-error';
import { idParam } from '../../utils/validator';
import { createFeePackageSchema, updateFeePackageSchema, assignClassSchema } from './fee.types';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(feeController.list.bind(feeController)));
router.post('/', validate({ body: createFeePackageSchema }), asyncHandler(feeController.create.bind(feeController)));
router.get('/:id', validate({ params: idParam }), asyncHandler(feeController.get.bind(feeController)));
router.put('/:id', validate({ params: idParam, body: updateFeePackageSchema }), asyncHandler(feeController.update.bind(feeController)));
router.delete('/:id', validate({ params: idParam }), asyncHandler(feeController.remove.bind(feeController)));
router.post('/:id/assign-class', validate({ params: idParam, body: assignClassSchema }), asyncHandler(feeController.assignClass.bind(feeController)));

export default router;
