import { Request, Response } from 'express';
import { classService } from './class.service';
import { ok, created } from '../../utils/api-error';
import { param } from '../../utils/validator';
import { recordAudit } from '../../middleware/audit';
import { CreateClassDto, UpdateClassDto } from './class.types';

export class ClassController {
  async list(req: Request, res: Response) {
    const includeInactive = req.query.includeInactive === 'true';
    ok(res, await classService.list(req.user!, req.query.schoolId as string | undefined, includeInactive));
  }

  async create(req: Request, res: Response) {
    const klass = await classService.create(req.user!, req.body as CreateClassDto);
    await recordAudit({ userId: req.user!.id, schoolId: klass.schoolId, action: 'SYSTEM_CONFIG_UPDATED', tableName: 'Class', recordId: klass.id, newValues: { name: klass.name } });
    created(res, klass, 'Class created');
  }

  async get(req: Request, res: Response) {
    ok(res, await classService.getById(req.user!, param(req, 'id')));
  }

  async update(req: Request, res: Response) {
    ok(res, await classService.update(req.user!, param(req, 'id'), req.body as UpdateClassDto), 'Class updated');
  }

  async deactivate(req: Request, res: Response) {
    ok(res, await classService.setActive(req.user!, param(req, 'id'), false), 'Class deactivated');
  }

  async reactivate(req: Request, res: Response) {
    ok(res, await classService.setActive(req.user!, param(req, 'id'), true), 'Class reactivated');
  }

  // Super-admin nested routes: /schools/:schoolId/classes
  async listForSchool(req: Request, res: Response) {
    ok(res, await classService.list(req.user!, param(req, 'schoolId'), req.query.includeInactive === 'true'));
  }

  async createForSchool(req: Request, res: Response) {
    const klass = await classService.create(req.user!, { ...(req.body as CreateClassDto), schoolId: param(req, 'schoolId') });
    created(res, klass, 'Class created');
  }
}

export const classController = new ClassController();
