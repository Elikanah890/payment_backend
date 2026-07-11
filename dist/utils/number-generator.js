"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextTransactionRef = exports.nextInvoiceNumber = exports.nextReceiptNumber = void 0;
exports.nextDocumentNumber = nextDocumentNumber;
exports.nextAdmissionNumber = nextAdmissionNumber;
const client_1 = require("@prisma/client");
async function nextDocumentNumber(db, schoolId, scope, prefix) {
    const rows = await db.$queryRaw(client_1.Prisma.sql `SELECT next_document_number(${schoolId}, ${scope}, ${prefix}) AS num`);
    return rows[0].num;
}
const nextReceiptNumber = (db, schoolId) => nextDocumentNumber(db, schoolId, 'RECEIPT', 'RCP');
exports.nextReceiptNumber = nextReceiptNumber;
const nextInvoiceNumber = (db, schoolId) => nextDocumentNumber(db, schoolId, 'INVOICE', 'INV');
exports.nextInvoiceNumber = nextInvoiceNumber;
const nextTransactionRef = (db, schoolId) => nextDocumentNumber(db, schoolId, 'TRANSACTION', 'TRX');
exports.nextTransactionRef = nextTransactionRef;
// Admission number: {YEAR}/{SEQ3}/{CLASS_CODE}, sequence per school+class+year.
async function nextAdmissionNumber(db, schoolId, classId, classCode) {
    const year = new Date().getFullYear();
    const scope = `ADMISSION:${classId}`;
    const rows = await db.$queryRaw(client_1.Prisma.sql `
      INSERT INTO "NumberSequence" ("id","schoolId","scope","year","lastValue","updatedAt")
      VALUES (gen_random_uuid()::text, ${schoolId}, ${scope}, ${year}, 1, NOW())
      ON CONFLICT ("schoolId","scope","year")
      DO UPDATE SET "lastValue" = "NumberSequence"."lastValue" + 1, "updatedAt" = NOW()
      RETURNING "lastValue"
    `);
    const seq = Number(rows[0].lastValue);
    return `${year}/${String(seq).padStart(3, '0')}/${classCode}`;
}
//# sourceMappingURL=number-generator.js.map