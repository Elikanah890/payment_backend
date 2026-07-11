import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { superAdminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validation';
import { rateLimit } from '../../middleware/rate-limit';
import { asyncHandler } from '../../utils/api-error';
import { loginSchema, changePasswordSchema, resetPasswordSchema } from './auth.types';

const router = Router();

router.post(
  '/login',
  rateLimit({ max: 10, windowSec: 60, keyPrefix: 'login' }),
  validate({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController))
);
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));
router.post('/logout', asyncHandler(authController.logout.bind(authController)));

router.use(authenticate);
router.get('/me', asyncHandler(authController.me.bind(authController)));
router.post(
  '/change-password',
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword.bind(authController))
);
router.put('/profile', asyncHandler(authController.updateProfile.bind(authController)));
router.post(
  '/reset-password',
  superAdminOnly,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword.bind(authController))
);

export default router;
