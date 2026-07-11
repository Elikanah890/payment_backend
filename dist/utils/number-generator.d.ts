import { PrismaClient } from '@prisma/client';
type Db = Pick<PrismaClient, '$queryRaw'>;
export declare function nextDocumentNumber(db: Db, schoolId: string, scope: 'RECEIPT' | 'INVOICE' | 'TRANSACTION', prefix: string): Promise<string>;
export declare const nextReceiptNumber: (db: Db, schoolId: string) => Promise<string>;
export declare const nextInvoiceNumber: (db: Db, schoolId: string) => Promise<string>;
export declare const nextTransactionRef: (db: Db, schoolId: string) => Promise<string>;
export declare function nextAdmissionNumber(db: Db, schoolId: string, classId: string, classCode: string): Promise<string>;
export {};
//# sourceMappingURL=number-generator.d.ts.map