import { Router } from 'express';
import { classController } from './class.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/api-error';
import { idParam } from '../../utils/validator';
import { createClassSchema, updateClassSchema } from './class.types';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(classController.list.bind(classController)));
router.post('/', validate({ body: createClassSchema }), asyncHandler(classController.create.bind(classController)));
router.get('/:id', validate({ params: idParam }), asyncHandler(classController.get.bind(classController)));
router.put('/:id', validate({ params: idParam, body: updateClassSchema }), asyncHandler(classController.update.bind(classController)));
router.delete('/:id', validate({ params: idParam }), asyncHandler(classController.deactivate.bind(classController)));
router.post('/:id/reactivate', validate({ params: idParam }), asyncHandler(classController.reactivate.bind(classController)));

export default router;
