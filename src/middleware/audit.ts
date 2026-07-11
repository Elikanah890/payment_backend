import { Prisma, PrismaClient, AuditAction } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

type Db = Pick<PrismaClient, 'auditLog'>;

export interface AuditInput {
  userId: string;
  schoolId?: string | null;
  action: AuditAction;
  tableName: string;
  recordId: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  actionDetails?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export async function recordAudit(input: AuditInput, db: Db = prisma): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId,
        schoolId: input.schoolId ?? null,
        action: input.action,
        tableName: input.tableName,
        recordId: input.recordId,
        oldValues: input.oldValues,
        newValues: input.newValues,
        actionDetails: input.actionDetails,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        requestId: input.requestId,
      },
    });
  } catch (e: any) {
    logger.warn(`Audit log failed: ${e.message}`);
  }
}
