"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const api_error_1 = require("../../utils/api-error");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, rbac_1.authorize)(client_1.UserRole.ADMIN), (0, api_error_1.asyncHandler)(dashboard_controller_1.dashboardController.overview.bind(dashboard_controller_1.dashboardController)));
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map