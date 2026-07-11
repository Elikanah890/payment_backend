import { Request, Response } from 'express';
import { schoolService } from './school.service';
import { ok, created } from '../../utils/api-error';
import { paginationSchema, param } from '../../utils/validator';
import { recordAudit } from '../../middleware/audit';
import { CreateSchoolDto, UpdateSchoolDto } from './school.types';

export class SchoolController {
  async create(req: Request, res: Response) {
    const school = await schoolService.create(req.body as CreateSchoolDto);
    await recordAudit({
      userId: req.user!.id,
      schoolId: school.id,
      action: 'SYSTEM_CONFIG_UPDATED',
      tableName: 'School',
      recordId: school.id,
      newValues: { name: school.name },
    });
    created(res, school, 'School created with default classes');
  }

  async list(req: Request, res: Response) {
    const { page, limit } = paginationSchema.parse(req.query);
    const search = req.query.search as string | undefined;
    const isActive = req.query.isActive === undefined ? undefined : req.query.isActive === 'true';
    const { data, meta } = await schoolService.list(req.user!, page, limit, search, isActive);
    ok(res, data, undefined, meta);
  }

  async get(req: Request, res: Response) {
    ok(res, await schoolService.getById(req.user!, param(req, 'id')));
  }

  async update(req: Request, res: Response) {
    const school = await schoolService.update(param(req, 'id'), req.body as UpdateSchoolDto);
    await recordAudit({
      userId: req.user!.id,
      schoolId: school.id,
      action: 'SYSTEM_CONFIG_UPDATED',
      tableName: 'School',
      recordId: school.id,
    });
    ok(res, school, 'School updated');
  }

  async deactivate(req: Request, res: Response) {
    const school = await schoolService.deactivate(param(req, 'id'));
    ok(res, school, 'School deactivated');
  }

  async reactivate(req: Request, res: Response) {
    const school = await schoolService.reactivate(param(req, 'id'));
    ok(res, school, 'School reactivated');
  }

  async stats(req: Request, res: Response) {
    ok(res, await schoolService.stats(req.user!, param(req, 'id')));
  }
}

export const schoolController = new SchoolController();
