import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/env';
import { logger } from './config/logger';
import { cookieParser, requestId, securityHeaders, csrfGuard } from './middleware/security';
import { rateLimit } from './middleware/rate-limit';
import { errorHandler, notFound } from './middleware/error';

import authRoutes from './modules/auth/auth.routes';
import schoolRoutes from './modules/school/school.routes';
import adminRoutes from './modules/admin/admin.routes';
import studentRoutes from './modules/student/student.routes';
import feeRoutes from './modules/fee/fee.routes';
import classRoutes from './modules/class/class.routes';import invoiceRoutes from './modules/invoice/invoice.routes';
import paymentRoutes from './modules/payment/payment.routes';
import receiptRoutes from './modules/receipt/receipt.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import webhookRoutes from './modules/webhook/webhook.routes';
import smsRoutes from './modules/sms/sms.routes';
import reportRoutes from './modules/report/report.routes';
import { systemRouter, auditRouter } from './modules/system/system.routes';

const app = express();
app.set('trust proxy', 1);

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
  })
);

app.use(securityHeaders);
app.use(compression());
app.use(
  express.json({
    limit: '5mb',
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser);
app.use(requestId);

if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', { stream: { write: (m: string) => logger.info(m.trim()) } }));
}

app.use('/api/v1', rateLimit());
app.use('/api/v1', csrfGuard);

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'Blessing Hope API v2.0', environment: config.nodeEnv, timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/fee-packages', feeRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/sms', smsRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/audit-logs', auditRouter);
app.use('/api/v1/system', systemRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
