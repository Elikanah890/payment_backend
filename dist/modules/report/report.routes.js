"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const report_service_1 = require("./report.service");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const sid = (req) => req.query.schoolId;
router.get('/daily', (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await report_service_1.reportService.daily(req.user, req.query.date, sid(req)))));
router.get('/aging', (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await report_service_1.reportService.aging(req.user, sid(req)))));
router.get('/fee-package', (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await report_service_1.reportService.feePackageSummary(req.user, sid(req)))));
router.get('/hostel', (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await report_service_1.reportService.hostel(req.user, sid(req)))));
router.get('/channels', (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await report_service_1.reportService.channels(req.user, sid(req)))));
router.get('/student/:id', (0, api_error_1.asyncHandler)(async (req, res) => (0, api_error_1.ok)(res, await report_service_1.reportService.studentStatement(req.user, (0, validator_1.param)(req, 'id')))));
exports.default = router;
//# sourceMappingURL=report.routes.js.map