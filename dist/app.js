"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const security_1 = require("./middleware/security");
const rate_limit_1 = require("./middleware/rate-limit");
const error_1 = require("./middleware/error");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const school_routes_1 = __importDefault(require("./modules/school/school.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const student_routes_1 = __importDefault(require("./modules/student/student.routes"));
const fee_routes_1 = __importDefault(require("./modules/fee/fee.routes"));
const class_routes_1 = __importDefault(require("./modules/class/class.routes"));
const invoice_routes_1 = __importDefault(require("./modules/invoice/invoice.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/payment.routes"));
const receipt_routes_1 = __importDefault(require("./modules/receipt/receipt.routes"));
const transaction_routes_1 = __importDefault(require("./modules/transaction/transaction.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const webhook_routes_1 = __importDefault(require("./modules/webhook/webhook.routes"));
const sms_routes_1 = __importDefault(require("./modules/sms/sms.routes"));
const report_routes_1 = __importDefault(require("./modules/report/report.routes"));
const system_routes_1 = require("./modules/system/system.routes");
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, cors_1.default)({
    origin: env_1.config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
}));
app.use(security_1.securityHeaders);
app.use((0, compression_1.default)());
app.use(express_1.default.json({
    limit: '5mb',
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString('utf8');
    },
}));
app.use(express_1.default.urlencoded({ extended: true, limit: '5mb' }));
app.use(security_1.cookieParser);
app.use(security_1.requestId);
if (env_1.config.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)('combined', { stream: { write: (m) => logger_1.logger.info(m.trim()) } }));
}
app.use('/api/v1', (0, rate_limit_1.rateLimit)());
app.use('/api/v1', security_1.csrfGuard);
app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, message: 'Blessing Hope API v2.0', environment: env_1.config.nodeEnv, timestamp: new Date().toISOString() });
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/schools', school_routes_1.default);
app.use('/api/v1/admins', admin_routes_1.default);
app.use('/api/v1/students', student_routes_1.default);
app.use('/api/v1/fee-packages', fee_routes_1.default);
app.use('/api/v1/classes', class_routes_1.default);
app.use('/api/v1/invoices', invoice_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
app.use('/api/v1/receipts', receipt_routes_1.default);
app.use('/api/v1/transactions', transaction_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
app.use('/api/v1/webhooks', webhook_routes_1.default);
app.use('/api/v1/sms', sms_routes_1.default);
app.use('/api/v1/reports', report_routes_1.default);
app.use('/api/v1/audit-logs', system_routes_1.auditRouter);
app.use('/api/v1/system', system_routes_1.systemRouter);
app.use(error_1.notFound);
app.use(error_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map