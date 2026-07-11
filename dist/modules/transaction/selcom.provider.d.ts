export interface PaymentInitRequest {
    phone: string;
    amount: number;
    reference: string;
    callbackUrl: string;
    provider: 'mpesa' | 'tigo' | 'airtel';
}
export declare class SelcomProvider {
    private baseUrl;
    private apiKey;
    private apiSecret;
    private webhookSecret;
    constructor();
    initiatePayment(payload: PaymentInitRequest): Promise<{
        ok: boolean;
        providerRef?: string;
        message?: string;
    }>;
    queryTransaction(providerRef: string): Promise<{
        ok: boolean;
        status?: string;
        amount?: number;
        message?: string;
    }>;
    verifyWebhookSignature(payload: string, signature: string): boolean;
}
export declare const selcomProvider: SelcomProvider;
//# sourceMappingURL=selcom.provider.d.ts.map