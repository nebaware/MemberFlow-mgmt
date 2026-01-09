-- ============================================
-- CLEAR ALL SAMPLE DATA FROM DATABASE
-- ============================================
-- Run: psql -U postgres -d azmera_db -f clear-sample-data.sql
-- ============================================

\c azmera_db

-- Delete in order to respect foreign key constraints

-- Delete platform revenue
DELETE FROM platform_revenue;

-- Delete disputes
DELETE FROM disputes;

-- Delete escrow transactions
DELETE FROM escrow_transactions;

-- Delete notifications
DELETE FROM notifications;

-- Delete reviews
DELETE FROM reviews;

-- Delete enrollments
DELETE FROM enrollments;

-- Delete learning modules
DELETE FROM learning_modules;

-- Delete transportation
DELETE FROM transportation;

-- Delete storage bookings
DELETE FROM storage_bookings;

-- Delete storage facilities
DELETE FROM storage_facilities;

-- Delete transactions
DELETE FROM transactions;

-- Delete order items
DELETE FROM order_items;

-- Delete orders
DELETE FROM orders;

-- Delete products
DELETE FROM products;

-- Delete users
DELETE FROM users;

-- Reset sequences to start from 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE storage_facilities_id_seq RESTART WITH 1;
ALTER SEQUENCE storage_bookings_id_seq RESTART WITH 1;
ALTER SEQUENCE transportation_id_seq RESTART WITH 1;
ALTER SEQUENCE learning_modules_id_seq RESTART WITH 1;
ALTER SEQUENCE enrollments_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE escrow_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE disputes_id_seq RESTART WITH 1;
ALTER SEQUENCE platform_revenue_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'storage_facilities', COUNT(*) FROM storage_facilities
UNION ALL
SELECT 'storage_bookings', COUNT(*) FROM storage_bookings
UNION ALL
SELECT 'transportation', COUNT(*) FROM transportation
UNION ALL
SELECT 'learning_modules', COUNT(*) FROM learning_modules
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'escrow_transactions', COUNT(*) FROM escrow_transactions
UNION ALL
SELECT 'disputes', COUNT(*) FROM disputes
UNION ALL
SELECT 'platform_revenue', COUNT(*) FROM platform_revenue;

SELECT 'All sample data cleared successfully!' AS status;
