import { Prisma, PrismaClient } from '@prisma/client';

type Db = Pick<PrismaClient, '$queryRaw'>;

export async function nextDocumentNumber(
  db: Db,
  schoolId: string,
  scope: 'RECEIPT' | 'INVOICE' | 'TRANSACTION',
  prefix: string
): Promise<string> {
  const rows = await db.$queryRaw<{ num: string }[]>(
    Prisma.sql`SELECT next_document_number(${schoolId}, ${scope}, ${prefix}) AS num`
  );
  return rows[0].num;
}

export const nextReceiptNumber = (db: Db, schoolId: string) =>
  nextDocumentNumber(db, schoolId, 'RECEIPT', 'RCP');

export const nextInvoiceNumber = (db: Db, schoolId: string) =>
  nextDocumentNumber(db, schoolId, 'INVOICE', 'INV');

export const nextTransactionRef = (db: Db, schoolId: string) =>
  nextDocumentNumber(db, schoolId, 'TRANSACTION', 'TRX');

// Admission number: {YEAR}/{SEQ3}/{CLASS_CODE}, sequence per school+class+year.
export async function nextAdmissionNumber(
  db: Db,
  schoolId: string,
  classId: string,
  classCode: string
): Promise<string> {
  const year = new Date().getFullYear();
  const scope = `ADMISSION:${classId}`;
  const rows = await db.$queryRaw<{ lastValue: bigint }[]>(
    Prisma.sql`
      INSERT INTO "NumberSequence" ("id","schoolId","scope","year","lastValue","updatedAt")
      VALUES (gen_random_uuid()::text, ${schoolId}, ${scope}, ${year}, 1, NOW())
      ON CONFLICT ("schoolId","scope","year")
      DO UPDATE SET "lastValue" = "NumberSequence"."lastValue" + 1, "updatedAt" = NOW()
      RETURNING "lastValue"
    `
  );
  const seq = Number(rows[0].lastValue);
  return `${year}/${String(seq).padStart(3, '0')}/${classCode}`;
}
