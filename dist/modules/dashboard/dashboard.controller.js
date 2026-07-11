"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const api_error_1 = require("../../utils/api-error");
const dashboard_service_1 = require("./dashboard.service");
const ALLOWED_PERIODS = ['today', 'week', 'month', 'year'];
class DashboardController {
    async overview(req, res) {
        const requested = req.query.period || 'today';
        const period = ALLOWED_PERIODS.includes(requested)
            ? requested
            : 'today';
        const data = await (0, dashboard_service_1.getDashboard)(req.user, period);
        (0, api_error_1.ok)(res, data);
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map