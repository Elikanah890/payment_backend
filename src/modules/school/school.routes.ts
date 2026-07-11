import { Router } from 'express';
import { schoolController } from './school.controller';
import { classController } from '../class/class.controller';
import { authenticate } from '../../middleware/auth';
import { superAdminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/api-error';
import { idParam } from '../../utils/validator';
import { createSchoolSchema, updateSchoolSchema } from './school.types';
import { createClassSchema } from '../class/class.types';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(schoolController.list.bind(schoolController)));

router.post(
  '/',
  superAdminOnly,
  validate({ body: createSchoolSchema }),
  asyncHandler(schoolController.create.bind(schoolController))
);

router.get('/:id', validate({ params: idParam }), asyncHandler(schoolController.get.bind(schoolController)));
router.get('/:id/stats', validate({ params: idParam }), asyncHandler(schoolController.stats.bind(schoolController)));
router.put(
  '/:id',
  superAdminOnly,
  validate({ params: idParam, body: updateSchoolSchema }),
  asyncHandler(schoolController.update.bind(schoolController))
);
router.delete('/:id', superAdminOnly, validate({ params: idParam }), asyncHandler(schoolController.deactivate.bind(schoolController)));
router.post('/:id/reactivate', superAdminOnly, asyncHandler(schoolController.reactivate.bind(schoolController)));

// Super Admin: manage classes for a specific school
router.get('/:schoolId/classes', superAdminOnly, asyncHandler(classController.listForSchool.bind(classController)));
router.post(
  '/:schoolId/classes',
  superAdminOnly,
  validate({ body: createClassSchema }),
  asyncHandler(classController.createForSchool.bind(classController))
);

export default router;
