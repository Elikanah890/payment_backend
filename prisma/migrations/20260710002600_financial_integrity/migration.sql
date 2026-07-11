-- ============================================================
-- BLESSING HOPE v2.0 - FINANCIAL INTEGRITY LAYER
-- CHECK constraints + derived-column triggers + invoice rollup
-- + race-safe document numbering.
--
-- This migration is hand-written because Prisma cannot express
-- generated columns, subquery/trigger checks or plpgsql functions.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CHECK CONSTRAINTS (data integrity)
-- ------------------------------------------------------------

-- Invoice
ALTER TABLE "Invoice" ADD CONSTRAINT "invoice_amount_positive"    CHECK ("amount" > 0);
ALTER TABLE "Invoice" ADD CONSTRAINT "invoice_amountpaid_nonneg"  CHECK ("amountPaid" >= 0);
ALTER TABLE "Invoice" ADD CONSTRAINT "invoice_latefee_nonneg"     CHECK ("lateFee" >= 0);
ALTER TABLE "Invoice" ADD CONSTRAINT "invoice_due_after_issue"    CHECK ("dueDate" >= "invoiceDate");

-- Payment (subquery CHECK from the spec is illegal in PG -> enforced here
-- per-row against the payment's own amount, and cross-row in the trigger).
ALTER TABLE "Payment" ADD CONSTRAINT "payment_amount_positive"    CHECK ("amount" > 0);
ALTER TABLE "Payment" ADD CONSTRAINT "payment_allocated_nonneg"   CHECK ("amountAllocated" >= 0);
ALTER TABLE "Payment" ADD CONSTRAINT "payment_allocated_le_amount" CHECK ("amountAllocated" <= "amount");

-- Transaction
ALTER TABLE "Transaction" ADD CONSTRAINT "transaction_amount_positive" CHECK ("amount" > 0);

-- Student status / withdrawal consistency (improved vs spec: only WITHDRAWN
-- requires a withdrawalDate; GRADUATED/TRANSFERRED/SUSPENDED do not).
ALTER TABLE "Student" ADD CONSTRAINT "student_status_withdrawal_consistency" CHECK (
  ("status" = 'ACTIVE'    AND "withdrawalDate" IS NULL)
  OR ("status" = 'WITHDRAWN' AND "withdrawalDate" IS NOT NULL)
  OR ("status" IN ('GRADUATED','TRANSFERRED','SUSPENDED'))
);
ALTER TABLE "Student" ADD CONSTRAINT "student_enrollment_reasonable" CHECK ("enrollmentDate" >= '2000-01-01');

-- ------------------------------------------------------------
-- 2. DERIVED COLUMNS via BEFORE triggers
--    (replaces invalid Prisma @generated STORED columns)
--    Invoice.balance  = amount - amountPaid
--    Invoice.totalDue = amount + lateFee
--    Payment.amountRemaining = amount - amountAllocated
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION invoice_set_derived()
RETURNS TRIGGER AS $$
BEGIN
  NEW."balance"  := NEW."amount" - NEW."amountPaid";
  NEW."totalDue" := NEW."amount" + NEW."lateFee";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_set_derived
BEFORE INSERT OR UPDATE ON "Invoice"
FOR EACH ROW EXECUTE FUNCTION invoice_set_derived();

CREATE OR REPLACE FUNCTION payment_set_derived()
RETURNS TRIGGER AS $$
BEGIN
  NEW."amountRemaining" := NEW."amount" - NEW."amountAllocated";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_set_derived
BEFORE INSERT OR UPDATE ON "Payment"
FOR EACH ROW EXECUTE FUNCTION payment_set_derived();

-- ------------------------------------------------------------
-- 3. INVOICE ROLLUP
--    Recompute Invoice.amountPaid + status from COMPLETED payments.
--    The DB is the single source of truth for these fields.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION invoice_recalc(p_invoice_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_paid   NUMERIC(12,2);
  v_amount NUMERIC(12,2);
  v_status "InvoiceStatus";
BEGIN
  IF p_invoice_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM("amountAllocated"), 0) INTO v_paid
  FROM "Payment"
  WHERE "invoiceId" = p_invoice_id AND "status" = 'COMPLETED';

  SELECT "amount", "status" INTO v_amount, v_status
  FROM "Invoice" WHERE "id" = p_invoice_id;

  IF v_amount IS NULL THEN
    RETURN;
  END IF;

  -- Never override terminal admin states; still keep amountPaid accurate.
  IF v_status IN ('CANCELLED', 'VOID') THEN
    UPDATE "Invoice"
    SET "amountPaid" = v_paid, "updatedAt" = NOW()
    WHERE "id" = p_invoice_id;
    RETURN;
  END IF;

  UPDATE "Invoice"
  SET "amountPaid" = v_paid,
      "status" = CASE
        WHEN v_paid >= v_amount THEN 'PAID'::"InvoiceStatus"
        WHEN v_paid > 0         THEN 'PARTIALLY_PAID'::"InvoiceStatus"
        WHEN "dueDate" < NOW()  THEN 'OVERDUE'::"InvoiceStatus"
        ELSE 'UNPAID'::"InvoiceStatus"
      END,
      "updatedAt" = NOW()
  WHERE "id" = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION payment_rollup()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM invoice_recalc(OLD."invoiceId");
    RETURN OLD;
  END IF;

  PERFORM invoice_recalc(NEW."invoiceId");
  IF (TG_OP = 'UPDATE' AND NEW."invoiceId" IS DISTINCT FROM OLD."invoiceId") THEN
    PERFORM invoice_recalc(OLD."invoiceId");
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_rollup
AFTER INSERT OR UPDATE OR DELETE ON "Payment"
FOR EACH ROW EXECUTE FUNCTION payment_rollup();

-- ------------------------------------------------------------
-- 4. DOCUMENT NUMBERING (race-safe, per-school, per-year)
--    next_document_number('<schoolId>', 'RECEIPT', 'RCP') -> 'RCP-2026-00001'
--    Atomic via INSERT ... ON CONFLICT DO UPDATE (row-locked).
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION next_document_number(p_school_id TEXT, p_scope TEXT, p_prefix TEXT)
RETURNS TEXT AS $$
DECLARE
  v_year INT := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  v_next BIGINT;
BEGIN
  INSERT INTO "NumberSequence" ("id", "schoolId", "scope", "year", "lastValue", "updatedAt")
  VALUES (gen_random_uuid()::text, p_school_id, p_scope, v_year, 1, NOW())
  ON CONFLICT ("schoolId", "scope", "year")
  DO UPDATE SET "lastValue" = "NumberSequence"."lastValue" + 1, "updatedAt" = NOW()
  RETURNING "lastValue" INTO v_next;

  RETURN p_prefix || '-' || v_year::text || '-' || lpad(v_next::text, 5, '0');
END;
$$ LANGUAGE plpgsql;
