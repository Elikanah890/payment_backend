import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler, ok } from '../../utils/api-error';
import { param } from '../../utils/validator';
import { reportService } from './report.service';

const router = Router();
router.use(authenticate);

const sid = (req: Request) => req.query.schoolId as string | undefined;

router.get('/daily', asyncHandler(async (req: Request, res: Response) => ok(res, await reportService.daily(req.user!, req.query.date as string | undefined, sid(req)))));
router.get('/aging', asyncHandler(async (req: Request, res: Response) => ok(res, await reportService.aging(req.user!, sid(req)))));
router.get('/fee-package', asyncHandler(async (req: Request, res: Response) => ok(res, await reportService.feePackageSummary(req.user!, sid(req)))));
router.get('/hostel', asyncHandler(async (req: Request, res: Response) => ok(res, await reportService.hostel(req.user!, sid(req)))));
router.get('/channels', asyncHandler(async (req: Request, res: Response) => ok(res, await reportService.channels(req.user!, sid(req)))));
router.get('/student/:id', asyncHandler(async (req: Request, res: Response) => ok(res, await reportService.studentStatement(req.user!, param(req, 'id')))));

export default router;
