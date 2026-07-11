export declare const config: {
    nodeEnv: string;
    isProd: boolean;
    port: number;
    appUrl: string;
    corsOrigins: string[];
    database: {
        url: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiry: string;
        refreshExpiryDays: number;
    };
    security: {
        loginMaxAttempts: number;
        loginLockMinutes: number;
        rateWindowSec: number;
        rateMax: number;
        bcryptRounds: number;
    };
    beem: {
        apiKey: string;
        apiSecret: string;
        senderId: string;
        baseUrl: string;
    };
    selcom: {
        merchantId: string;
        apiKey: string;
        apiSecret: string;
        webhookSecret: string;
        baseUrl: string;
        environment: string;
    };
    school: {
        defaultLateFee: number;
        lateFeeGraceDays: number;
        currency: string;
    };
    superAdmin: {
        email: string;
        password: string;
    };
    log: {
        level: string;
    };
};
//# sourceMappingURL=env.d.ts.map