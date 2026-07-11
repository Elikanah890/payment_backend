export declare class BeemProvider {
    sendSms(dest: string, message: string): Promise<{
        ok: boolean;
        providerRef?: string;
        error?: string;
    }>;
    balance(): Promise<{
        balance: number | null;
        error?: string;
    }>;
}
export declare const beemProvider: BeemProvider;
//# sourceMappingURL=beem.provider.d.ts.map