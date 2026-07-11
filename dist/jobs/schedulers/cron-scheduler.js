"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobs = startJobs;
exports.stopJobs = stopJobs;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../config/redis");
const logger_1 = require("../../config/logger");
const job_definitions_1 = require("./job-definitions");
const invoice_generation_worker_1 = require("../workers/invoice-generation.worker");
const late_fee_worker_1 = require("../workers/late-fee.worker");
const transaction_poll_worker_1 = require("../workers/transaction-poll.worker");
const backup_worker_1 = require("../workers/backup.worker");
const sms_service_1 = require("../../modules/sms/sms.service");
let queue;
let worker;
async function process(name) {
    switch (name) {
        case 'invoice-generation':
            return (0, invoice_generation_worker_1.generateMonthlyInvoices)();
        case 'late-fee':
            return (0, late_fee_worker_1.applyLateFees)();
        case 'reminders':
            return sms_service_1.smsService.sendOverdueReminders();
        case 'transaction-poll':
            return (0, transaction_poll_worker_1.pollTransactions)();
        case 'backup':
            return (0, backup_worker_1.runBackup)();
        default:
            logger_1.logger.warn(`Unknown job: ${name}`);
            return null;
    }
}
async function startJobs() {
    try {
        queue = new bullmq_1.Queue(job_definitions_1.JOB_QUEUE, { connection: redis_1.bullConnection });
        worker = new bullmq_1.Worker(job_definitions_1.JOB_QUEUE, async (job) => process(job.name), { connection: redis_1.bullConnection });
        worker.on('failed', (job, err) => logger_1.logger.error(`Job ${job?.name} failed: ${err.message}`));
        worker.on('completed', (job) => logger_1.logger.info(`Job ${job.name} completed`));
        for (const { name, pattern } of job_definitions_1.JOB_SCHEDULES) {
            await queue.add(name, {}, { repeat: { pattern }, jobId: name, removeOnComplete: true, removeOnFail: 100 });
        }
        logger_1.logger.info('Background jobs scheduled');
    }
    catch (e) {
        logger_1.logger.warn(`Job scheduler not started: ${e.message}`);
    }
}
async function stopJobs() {
    await worker?.close().catch(() => undefined);
    await queue?.close().catch(() => undefined);
}
//# sourceMappingURL=cron-scheduler.js.map