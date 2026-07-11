"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beemProvider = exports.BeemProvider = void 0;
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
class BeemProvider {
    async sendSms(dest, message) {
        if (!env_1.config.beem.apiKey) {
            logger_1.logger.info(`SMS (simulated) -> ${dest}: ${message}`);
            return { ok: true, providerRef: `SIM-${Date.now()}` };
        }
        try {
            const auth = Buffer.from(`${env_1.config.beem.apiKey}:${env_1.config.beem.apiSecret}`).toString('base64');
            const res = await fetch(`${env_1.config.beem.baseUrl}/v1/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
                body: JSON.stringify({
                    source_addr: env_1.config.beem.senderId,
                    encoding: 0,
                    message,
                    recipients: [{ recipient_id: 1, dest_addr: dest }],
                }),
            });
            const data = (await res.json().catch(() => ({})));
            if (!res.ok)
                return { ok: false, error: data?.message || `HTTP ${res.status}` };
            return { ok: true, providerRef: data?.request_id?.toString() };
        }
        catch (e) {
            logger_1.logger.error('Beem SMS error:', e.message);
            return { ok: false, error: e.message };
        }
    }
    async balance() {
        if (!env_1.config.beem.apiKey) {
            return { balance: null, error: 'BEEM_API_KEY not configured' };
        }
        try {
            const auth = Buffer.from(`${env_1.config.beem.apiKey}:${env_1.config.beem.apiSecret}`).toString('base64');
            const res = await fetch(`${env_1.config.beem.baseUrl}/public/v1/vendors/balance`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
            });
            const data = (await res.json().catch(() => ({})));
            if (!res.ok)
                return { balance: null, error: data?.message || `HTTP ${res.status}` };
            const raw = data?.data?.credit_balance ?? data?.credit_balance;
            const balance = raw === undefined || raw === null ? null : Number(raw);
            return { balance: Number.isFinite(balance) ? balance : null };
        }
        catch (e) {
            logger_1.logger.error('Beem balance error:', e.message);
            return { balance: null, error: e.message };
        }
    }
}
exports.BeemProvider = BeemProvider;
exports.beemProvider = new BeemProvider();
//# sourceMappingURL=beem.provider.js.map