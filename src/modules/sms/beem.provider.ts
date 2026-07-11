import { config } from '../../config/env';
import { logger } from '../../config/logger';

export class BeemProvider {
  async sendSms(dest: string, message: string): Promise<{ ok: boolean; providerRef?: string; error?: string }> {
    if (!config.beem.apiKey) {
      logger.info(`SMS (simulated) -> ${dest}: ${message}`);
      return { ok: true, providerRef: `SIM-${Date.now()}` };
    }
    try {
      const auth = Buffer.from(`${config.beem.apiKey}:${config.beem.apiSecret}`).toString('base64');
      const res = await fetch(`${config.beem.baseUrl}/v1/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify({
          source_addr: config.beem.senderId,
          encoding: 0,
          message,
          recipients: [{ recipient_id: 1, dest_addr: dest }],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) return { ok: false, error: data?.message || `HTTP ${res.status}` };
      return { ok: true, providerRef: data?.request_id?.toString() };
    } catch (e: any) {
      logger.error('Beem SMS error:', e.message);
      return { ok: false, error: e.message };
    }
  }

  async balance(): Promise<{ balance: number | null; error?: string }> {
    if (!config.beem.apiKey) {
      return { balance: null, error: 'BEEM_API_KEY not configured' };
    }
    try {
      const auth = Buffer.from(`${config.beem.apiKey}:${config.beem.apiSecret}`).toString('base64');
      const res = await fetch(`${config.beem.baseUrl}/public/v1/vendors/balance`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      });
      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) return { balance: null, error: data?.message || `HTTP ${res.status}` };
      const raw = data?.data?.credit_balance ?? data?.credit_balance;
      const balance = raw === undefined || raw === null ? null : Number(raw);
      return { balance: Number.isFinite(balance as number) ? balance : null };
    } catch (e: any) {
      logger.error('Beem balance error:', e.message);
      return { balance: null, error: e.message };
    }
  }
}

export const beemProvider = new BeemProvider();
