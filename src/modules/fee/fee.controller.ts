import { Request, Response } from 'express';
import { feeService } from './fee.service';
import { ok, created } from '../../utils/api-error';
import { param } from '../../utils/validator';
import { recordAudit } from '../../middleware/audit';
import { CreateFeePackageDto, UpdateFeePackageDto } from './fee.types';

export class FeeController {
  async create(req: Request, res: Response) {
    const pkg = await feeService.create(req.user!, req.body as CreateFeePackageDto);
    await recordAudit({ userId: req.user!.id, schoolId: pkg.schoolId, action: 'FEE_PACKAGE_CREATED', tableName: 'FeePackage', recordId: pkg.id });
    created(res, pkg, 'Fee package created');
  }

  async list(req: Request, res: Response) {
    ok(res, await feeService.list(req.user!, req.query.schoolId as string | undefined));
  }

  async get(req: Request, res: Response) {
    ok(res, await feeService.getById(req.user!, param(req, 'id')));
  }

  async update(req: Request, res: Response) {
    const pkg = await feeService.update(req.user!, param(req, 'id'), req.body as UpdateFeePackageDto);
    await recordAudit({ userId: req.user!.id, schoolId: pkg.schoolId, action: 'FEE_PACKAGE_UPDATED', tableName: 'FeePackage', recordId: pkg.id });
    ok(res, pkg, 'Fee package updated');
  }

  async remove(req: Request, res: Response) {
    const pkg = await feeService.deactivate(req.user!, param(req, 'id'));
    ok(res, pkg, 'Fee package deactivated');
  }

  async assignClass(req: Request, res: Response) {
    const link = await feeService.assignClass(req.user!, param(req, 'id'), req.body.classId);
    ok(res, link, 'Class assigned');
  }
}

export const feeController = new FeeController();
