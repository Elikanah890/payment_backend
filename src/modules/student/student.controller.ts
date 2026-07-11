import { Request, Response } from 'express';
import { studentService } from './student.service';
import { ok, created } from '../../utils/api-error';
import { param } from '../../utils/validator';
import { recordAudit } from '../../middleware/audit';
import { listStudentQuery, CreateStudentDto, UpdateStudentDto, WithdrawDto } from './student.types';

export class StudentController {
  async create(req: Request, res: Response) {
    const student = await studentService.create(req.user!, req.body as CreateStudentDto);
    await recordAudit({
      userId: req.user!.id,
      schoolId: student.schoolId,
      action: 'STUDENT_CREATED',
      tableName: 'Student',
      recordId: student.id,
      newValues: { admissionNo: student.admissionNo, fullName: student.fullName },
    });
    created(res, student, 'Student registered');
  }

  async list(req: Request, res: Response) {
    const q = listStudentQuery.parse(req.query);
    const { data, meta } = await studentService.list(req.user!, q);
    ok(res, data, undefined, meta);
  }

  async search(req: Request, res: Response) {
    const q = listStudentQuery.parse({ ...req.query, limit: req.query.limit ?? 10 });
    const { data } = await studentService.list(req.user!, q);
    ok(res, data);
  }

  async get(req: Request, res: Response) {
    ok(res, await studentService.getById(req.user!, param(req, 'id')));
  }

  async update(req: Request, res: Response) {
    const student = await studentService.update(req.user!, param(req, 'id'), req.body as UpdateStudentDto);
    await recordAudit({ userId: req.user!.id, schoolId: student.schoolId, action: 'STUDENT_UPDATED', tableName: 'Student', recordId: student.id });
    ok(res, student, 'Student updated');
  }

  async withdraw(req: Request, res: Response) {
    const student = await studentService.withdraw(req.user!, param(req, 'id'), req.body as WithdrawDto);
    await recordAudit({ userId: req.user!.id, schoolId: student.schoolId, action: 'STUDENT_WITHDRAWN', tableName: 'Student', recordId: student.id, newValues: { status: student.status } });
    ok(res, student, 'Student status updated');
  }

  async permanentDelete(req: Request, res: Response) {
    const result = await studentService.permanentDelete(req.user!, param(req, 'id'));
    await recordAudit({
      userId: req.user!.id,
      action: 'STUDENT_CREATED',
      tableName: 'Student',
      recordId: param(req, 'id'),
      newValues: { admissionNo: (result as any).admissionNo, fullName: (result as any).fullName, permanentlyDeleted: true },
    });
    ok(res, result, 'Student permanently deleted');
  }

  async bulk(req: Request, res: Response) {
    const result = await studentService.bulkImport(req.user!, req.body.students);
    ok(res, result, 'Bulk import complete');
  }
}

export const studentController = new StudentController();
