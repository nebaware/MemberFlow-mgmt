-- Drop all existing tables to allow Prisma to recreate them
-- This will delete all data!

DROP TABLE IF EXISTS "disputes" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "storage_bookings" CASCADE;
DROP TABLE IF EXISTS "storage_facilities" CASCADE;
DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "transportation" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Verify tables are dropped
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
