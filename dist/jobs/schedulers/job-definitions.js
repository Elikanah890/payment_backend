"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_SCHEDULES = exports.JOB_QUEUE = void 0;
exports.JOB_QUEUE = 'blessing-jobs';
exports.JOB_SCHEDULES = [
    { name: 'invoice-generation', pattern: '0 2 25 * *' }, // 25th, 02:00
    { name: 'late-fee', pattern: '0 1 10 * *' }, // 10th, 01:00
    { name: 'reminders', pattern: '0 7 * * 1' }, // Mondays, 07:00
    { name: 'transaction-poll', pattern: '*/5 * * * *' }, // every 5 minutes
    { name: 'backup', pattern: '0 2 * * *' }, // daily, 02:00
];
//# sourceMappingURL=job-definitions.js.map