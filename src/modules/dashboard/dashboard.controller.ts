import { Request, Response } from 'express';
import { ok } from '../../utils/api-error';
import { getDashboard } from './dashboard.service';

const ALLOWED_PERIODS = ['today', 'week', 'month', 'year'] as const;
type Period = (typeof ALLOWED_PERIODS)[number];

export class DashboardController {
  async overview(req: Request, res: Response): Promise<void> {
    const requested = (req.query.period as string) || 'today';
    const period: Period = (ALLOWED_PERIODS as readonly string[]).includes(requested)
      ? (requested as Period)
      : 'today';

    const data = await getDashboard(req.user!, period);
    ok(res, data);
  }
}

export const dashboardController = new DashboardController();
