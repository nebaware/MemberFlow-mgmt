-- Drop remaining tables that have ownership issues
DROP TABLE IF EXISTS "enrollments" CASCADE;
DROP TABLE IF EXISTS "learning_modules" CASCADE;
DROP TABLE IF EXISTS "escrow_transactions" CASCADE;
DROP TABLE IF EXISTS "platform_revenue" CASCADE;

-- Verify all tables are dropped
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
