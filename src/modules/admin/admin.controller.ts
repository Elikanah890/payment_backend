import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { ok, created } from '../../utils/api-error';
import { param } from '../../utils/validator';
import { recordAudit } from '../../middleware/audit';
import { listAdminQuery, CreateAdminDto, UpdateAdminDto } from './admin.types';

export class AdminController {
  async create(req: Request, res: Response) {
    const result = await adminService.create(req.body as CreateAdminDto);
    await recordAudit({
      userId: req.user!.id,
      schoolId: result.user.schoolId,
      action: 'USER_CREATED',
      tableName: 'User',
      recordId: result.user.id,
    });
    created(res, result, 'Admin created. Share the temporary password securely.');
  }

  async list(req: Request, res: Response) {
    const q = listAdminQuery.parse(req.query);
    const { data, meta } = await adminService.list(req.user!, q);
    ok(res, data, undefined, meta);
  }

  async get(req: Request, res: Response) {
    ok(res, await adminService.getById(req.user!, param(req, 'id')));
  }

  async update(req: Request, res: Response) {
    const admin = await adminService.update(req.user!, param(req, 'id'), req.body as UpdateAdminDto);
    await recordAudit({ userId: req.user!.id, schoolId: admin.schoolId, action: 'USER_UPDATED', tableName: 'User', recordId: admin.id });
    ok(res, admin, 'Admin updated');
  }

  async deactivate(req: Request, res: Response) {
    const admin = await adminService.deactivate(req.user!, param(req, 'id'));
    await recordAudit({
      userId: req.user!.id,
      schoolId: admin.schoolId,
      action: 'USER_DEACTIVATED',
      tableName: 'User',
      recordId: admin.id,
    });
    ok(res, admin, 'Admin disabled');
  }

  async enable(req: Request, res: Response) {
    const admin = await adminService.enable(req.user!, param(req, 'id'));
    await recordAudit({
      userId: req.user!.id,
      schoolId: admin.schoolId,
      action: 'USER_UPDATED',
      tableName: 'User',
      recordId: admin.id,
      newValues: { isActive: true },
    });
    ok(res, admin, 'Admin re-enabled');
  }

  async resetPassword(req: Request, res: Response) {
    const result = await adminService.resetPassword(req.user!, param(req, 'id'));
    await recordAudit({ userId: req.user!.id, action: 'PASSWORD_RESET', tableName: 'User', recordId: param(req, 'id') });
    ok(res, result, 'Password reset. Share the temporary password securely.');
  }

  async activity(req: Request, res: Response) {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const { data, meta } = await adminService.activityLog(
      req.user!,
      param(req, 'id'),
      parseInt(page, 10),
      parseInt(limit, 10)
    );
    ok(res, data, undefined, meta);
  }
}

export const adminController = new AdminController();
