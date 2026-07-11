-- ============================================================
-- BLESSING HOPE v2.0 - PRODUCTION DB HARDENING (run manually)
--
-- Run as a superuser/owner AFTER `prisma migrate deploy`.
-- Do NOT put this in prisma/migrations (it contains a password and
-- must not run in dev/CI). Replace the placeholder passwords first.
-- ============================================================

-- 1) Least-privilege application role (no SUPERUSER/CREATEDB/CREATEROLE)
CREATE ROLE blessing_app LOGIN PASSWORD 'REPLACE_WITH_STRONG_SECRET'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

GRANT CONNECT ON DATABASE blessing_hope_db TO blessing_app;
GRANT USAGE ON SCHEMA public TO blessing_app;

-- DML on all current tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO blessing_app;
-- sequences (BigInt counters / any serial)
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO blessing_app;
-- the numbering / recalc helper functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO blessing_app;

-- Make future objects (new migrations) inherit the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO blessing_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO blessing_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO blessing_app;

-- 2) Read-only backup role
CREATE ROLE blessing_backup LOGIN PASSWORD 'REPLACE_WITH_BACKUP_SECRET'
  NOSUPERUSER NOCREATEDB NOCREATEROLE;
GRANT CONNECT ON DATABASE blessing_hope_db TO blessing_backup;
GRANT USAGE ON SCHEMA public TO blessing_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO blessing_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO blessing_backup;

-- 3) Migrations should run as a DDL owner (e.g. blessing_admin), NOT blessing_app.
--    In production, drop the excessive privileges from the old admin user:
--    ALTER ROLE blessing_admin NOCREATEROLE;   -- keep CREATEDB only if migrate needs a shadow DB

-- 4) Application connection string (put in secrets manager, never in git):
--    DATABASE_URL="postgresql://blessing_app:STRONG_SECRET@HOST:5432/blessing_hope_db?sslmode=require&connection_limit=20"
--    Behind PgBouncer (transaction pooling) add: &pgbouncer=true
