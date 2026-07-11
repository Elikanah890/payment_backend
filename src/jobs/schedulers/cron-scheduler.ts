import { Queue, Worker } from 'bullmq';
import { bullConnection } from '../../config/redis';
import { logger } from '../../config/logger';
import { JOB_QUEUE, JOB_SCHEDULES } from './job-definitions';
import { generateMonthlyInvoices } from '../workers/invoice-generation.worker';
import { applyLateFees } from '../workers/late-fee.worker';
import { pollTransactions } from '../workers/transaction-poll.worker';
import { runBackup } from '../workers/backup.worker';
import { smsService } from '../../modules/sms/sms.service';

let queue: Queue | undefined;
let worker: Worker | undefined;

async function process(name: string): Promise<unknown> {
  switch (name) {
    case 'invoice-generation':
      return generateMonthlyInvoices();
    case 'late-fee':
      return applyLateFees();
    case 'reminders':
      return smsService.sendOverdueReminders();
    case 'transaction-poll':
      return pollTransactions();
    case 'backup':
      return runBackup();
    default:
      logger.warn(`Unknown job: ${name}`);
      return null;
  }
}

export async function startJobs(): Promise<void> {
  try {
    queue = new Queue(JOB_QUEUE, { connection: bullConnection });
    worker = new Worker(JOB_QUEUE, async (job) => process(job.name), { connection: bullConnection });

    worker.on('failed', (job, err) => logger.error(`Job ${job?.name} failed: ${err.message}`));
    worker.on('completed', (job) => logger.info(`Job ${job.name} completed`));

    for (const { name, pattern } of JOB_SCHEDULES) {
      await queue.add(name, {}, { repeat: { pattern }, jobId: name, removeOnComplete: true, removeOnFail: 100 });
    }
    logger.info('Background jobs scheduled');
  } catch (e: any) {
    logger.warn(`Job scheduler not started: ${e.message}`);
  }
}

export async function stopJobs(): Promise<void> {
  await worker?.close().catch(() => undefined);
  await queue?.close().catch(() => undefined);
}
