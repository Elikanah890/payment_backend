import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth';
import { superAdminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/api-error';
import { idParam } from '../../utils/validator';
import { createAdminSchema, updateAdminSchema } from './admin.types';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(adminController.list.bind(adminController)));
router.get('/:id', validate({ params: idParam }), asyncHandler(adminController.get.bind(adminController)));
router.get('/:id/activity', validate({ params: idParam }), asyncHandler(adminController.activity.bind(adminController)));

router.post('/', superAdminOnly, validate({ body: createAdminSchema }), asyncHandler(adminController.create.bind(adminController)));
router.put('/:id', superAdminOnly, validate({ params: idParam, body: updateAdminSchema }), asyncHandler(adminController.update.bind(adminController)));
router.delete('/:id', superAdminOnly, validate({ params: idParam }), asyncHandler(adminController.deactivate.bind(adminController)));
router.post('/:id/enable', superAdminOnly, validate({ params: idParam }), asyncHandler(adminController.enable.bind(adminController)));
router.post('/:id/reset-password', superAdminOnly, validate({ params: idParam }), asyncHandler(adminController.resetPassword.bind(adminController)));

export default router;
