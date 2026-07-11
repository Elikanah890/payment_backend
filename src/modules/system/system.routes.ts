import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth';
import { superAdminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validation';
import { asyncHandler, ok, created } from '../../utils/api-error';
import { paginationSchema } from '../../utils/validator';
import { systemService } from './system.service';

const configSchema = z.object({
  schoolId: z.string().optional(),
  key: z.string().min(1),
  value: z.any(),
  description: z.string().optional(),
});

export const auditRouter = Router();
auditRouter.use(authenticate);
auditRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationSchema.parse(req.query);
    const { data, meta } = await systemService.listAuditLogs(req.user!, {
      page,
      limit,
      action: req.query.action as string | undefined,
      schoolId: req.query.schoolId as string | undefined,
      userId: req.query.userId as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    ok(res, data, undefined, meta);
  })
);
auditRouter.get('/actions', asyncHandler(async (_req: Request, res: Response) => ok(res, await systemService.getAuditActions())));

export const systemRouter = Router();
systemRouter.use(authenticate);

systemRouter.get('/health', superAdminOnly, asyncHandler(async (_req: Request, res: Response) => ok(res, await systemService.health())));
systemRouter.get('/metrics', superAdminOnly, asyncHandler(async (_req: Request, res: Response) => ok(res, await systemService.metrics())));
systemRouter.get('/dashboard', superAdminOnly, asyncHandler(async (_req: Request, res: Response) => ok(res, await systemService.superAdminDashboard())));

systemRouter.get('/config', superAdminOnly, asyncHandler(async (req: Request, res: Response) => ok(res, await systemService.getConfig(req.user!, req.query.schoolId as string | undefined))));
systemRouter.put('/config', superAdminOnly, validate({ body: configSchema }), asyncHandler(async (req: Request, res: Response) => ok(res, await systemService.setConfig(req.user!, req.body.schoolId, req.body.key, req.body.value, req.body.description))));

systemRouter.post('/backup', superAdminOnly, asyncHandler(async (req: Request, res: Response) => created(res, await systemService.createBackup(req.user!), 'Backup queued')));
systemRouter.get('/backup', superAdminOnly, asyncHandler(async (req: Request, res: Response) => ok(res, await systemService.listBackups())));
systemRouter.post('/restore', superAdminOnly, asyncHandler(async (_req: Request, res: Response) => ok(res, { message: 'Restore must be run via ops tooling (pg_restore).' })));
