import crypto from 'crypto';
import { config } from '../../config/env';
import { logger } from '../../config/logger';

export interface PaymentInitRequest {
  phone: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  provider: 'mpesa' | 'tigo' | 'airtel';
}

export class SelcomProvider {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private webhookSecret: string;

  constructor() {
    this.baseUrl = config.selcom.baseUrl;
    this.apiKey = config.selcom.apiKey;
    this.apiSecret = config.selcom.apiSecret;
    this.webhookSecret = config.selcom.webhookSecret;
  }

  async initiatePayment(payload: PaymentInitRequest): Promise<{ ok: boolean; providerRef?: string; message?: string }> {
    if (!this.apiKey) {
      logger.info('Selcom not configured, simulating');
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
      const data = (await res.json()) as any;
      if (!res.ok) return { ok: false, message: data?.message || 'Payment initiation failed' };
      return { ok: true, providerRef: data.reference, message: data.message };
    } catch (e: any) {
      logger.error('Selcom init error:', e.message);
      return { ok: false, message: e.message };
    }
  }

  async queryTransaction(providerRef: string): Promise<{ ok: boolean; status?: string; amount?: number; message?: string }> {
    if (!this.apiKey) return { ok: true, status: 'success', amount: 0 };
    try {
      const res = await fetch(`${this.baseUrl}/v1/api/payments/${providerRef}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = (await res.json()) as any;
      return { ok: true, status: data.status || 'processing', amount: data.amount || 0, message: data.message };
    } catch (e: any) {
      logger.error('Selcom query error:', e.message);
      return { ok: false, status: 'processing', amount: 0 };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (config.nodeEnv === 'development' && !signature) return true;
    if (!this.webhookSecret) {
      logger.warn('SELCOM_WEBHOOK_SECRET not configured — signature check skipped');
      return true;
    }
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(payload);
    const expected = hmac.digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}

export const selcomProvider = new SelcomProvider();
