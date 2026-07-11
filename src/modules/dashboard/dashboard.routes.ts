import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { asyncHandler } from '../../utils/api-error';
import { dashboardController } from './dashboard.controller';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.ADMIN),
  asyncHandler(dashboardController.overview.bind(dashboardController))
);

export default router;
