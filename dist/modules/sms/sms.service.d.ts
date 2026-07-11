import { AuthUser } from '../../types';
export declare class SmsService {
    private deliver;
    send(user: AuthUser, dto: {
        message: string;
        phone?: string;
        studentId?: string;
        guardianId?: string;
    }): Promise<{
        sent: number;
        total: number;
    }>;
    private resolveRecipients;
    bulk(user: AuthUser, dto: {
        message: string;
        studentIds: string[];
    }): Promise<{
        sent: number;
        total: number;
    }>;
    history(user: AuthUser, page: number, limit: number, requestedSchoolId?: string): Promise<{
        data: {
            message: string;
            error: string | null;
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.NotificationStatus;
            createdBy: string | null;
            studentId: string | null;
            providerRef: string | null;
            guardianId: string | null;
            channel: import(".prisma/client").$Enums.NotificationChannel;
            recipient: string;
            subject: string | null;
            senderId: string | null;
            deliveryStatus: string | null;
            sentAt: Date;
            deliveredAt: Date | null;
            failedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    balance(): Promise<{
        provider: string;
        balance: number | null;
        error: string | undefined;
    }>;
    sendOverdueReminders(schoolId?: string): Promise<{
        invoices: number;
        sent: number;
    }>;
}
export declare const smsService: SmsService;
//# sourceMappingURL=sms.service.d.ts.map