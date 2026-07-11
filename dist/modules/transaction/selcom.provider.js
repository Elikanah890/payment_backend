"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selcomProvider = exports.SelcomProvider = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
class SelcomProvider {
    constructor() {
        this.baseUrl = env_1.config.selcom.baseUrl;
        this.apiKey = env_1.config.selcom.apiKey;
        this.apiSecret = env_1.config.selcom.apiSecret;
        this.webhookSecret = env_1.config.selcom.webhookSecret;
    }
    async initiatePayment(payload) {
        if (!this.apiKey) {
            logger_1.logger.info('Selcom not configured, simulating');
            const ref = `SIM-${Date.now()}`;
            return { ok: true, providerRef: ref, message: 'Simulated' };
        }
        try {
            const res = await fetch(`${this.baseUrl}/v1/api/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
                body: JSON.stringify({
                    phone: payload.phone,
                    amount: payload.amount,
                    reference: payload.reference,
                    provider: payload.provider,
                    callback_url: payload.callbackUrl,
                }),
            });
            const data = (await res.json());
            if (!res.ok)
                return { ok: false, message: data?.message || 'Payment initiation failed' };
            return { ok: true, providerRef: data.reference, message: data.message };
        }
        catch (e) {
            logger_1.logger.error('Selcom init error:', e.message);
            return { ok: false, message: e.message };
        }
    }
    async queryTransaction(providerRef) {
        if (!this.apiKey)
            return { ok: true, status: 'success', amount: 0 };
        try {
            const res = await fetch(`${this.baseUrl}/v1/api/payments/${providerRef}`, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });
            const data = (await res.json());
            return { ok: true, status: data.status || 'processing', amount: data.amount || 0, message: data.message };
        }
        catch (e) {
            logger_1.logger.error('Selcom query error:', e.message);
            return { ok: false, status: 'processing', amount: 0 };
        }
    }
    verifyWebhookSignature(payload, signature) {
        if (env_1.config.nodeEnv === 'development' && !signature)
            return true;
        if (!this.webhookSecret) {
            logger_1.logger.warn('SELCOM_WEBHOOK_SECRET not configured — signature check skipped');
            return true;
        }
        const hmac = crypto_1.default.createHmac('sha256', this.webhookSecret);
        hmac.update(payload);
        const expected = hmac.digest('hex');
        try {
            return crypto_1.default.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
        }
        catch {
            return false;
        }
    }
}
exports.SelcomProvider = SelcomProvider;
exports.selcomProvider = new SelcomProvider();
//# sourceMappingURL=selcom.provider.js.map