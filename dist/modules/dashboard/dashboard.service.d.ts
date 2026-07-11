import { AuthUser } from '../../types';
export declare function getDashboard(user: AuthUser, period: string): Promise<{
    stats: {
        totalStudents: number;
        totalCollected: number;
        collectionRate: number;
        totalOutstanding: number;
        trend: number;
    };
    chart: {
        channelData: {
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            count: number;
        }[];
    };
    recentPayments: {
        id: string;
        time: Date;
        studentName: string;
        studentClass: string;
        amount: number;
        method: import(".prisma/client").$Enums.PaymentMethod;
        receiptNumber: string;
    }[];
    alerts: {
        overdueCount: number;
        studentsWithBalance: number;
        smsBalance: number | null;
        isSmsLow: boolean;
    };
}>;
//# sourceMappingURL=dashboard.service.d.ts.map