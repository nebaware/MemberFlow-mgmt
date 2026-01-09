-- ============================================
-- AZMERA PLATFORM - SAMPLE DATA
-- ============================================
-- Run: psql -U postgres -d azmera_db -f insert-sample-data.sql
-- ============================================

-- Insert Sample Users
INSERT INTO users (name, email, password_hash, role, location, verified, wallet_balance, phone) VALUES
('Abebe Kebede', 'abebe@farmer.com', '$2b$10$YourHashedPasswordHere', 'farmer', 'Addis Ababa', TRUE, 5000.00, '+251911234567'),
('Tigist Alemu', 'tigist@buyer.com', '$2b$10$YourHashedPasswordHere', 'buyer', 'Bahir Dar', TRUE, 3000.00, '+251922345678'),
('Dawit Tesfaye', 'dawit@transporter.com', '$2b$10$YourHashedPasswordHere', 'transporter', 'Hawassa', TRUE, 2000.00, '+251933456789'),
('Marta Girma', 'marta@educator.com', '$2b$10$YourHashedPasswordHere', 'educator', 'Mekelle', TRUE, 1500.00, '+251944567890'),
('Yohannes Haile', 'yohannes@toolseller.com', '$2b$10$YourHashedPasswordHere', 'tool_seller', 'Dire Dawa', TRUE, 4000.00, '+251955678901'),
('Hanna Bekele', 'hanna@storage.com', '$2b$10$YourHashedPasswordHere', 'storage_provider', 'Adama', TRUE, 6000.00, '+251966789012')
ON CONFLICT (email) DO NOTHING;

-- Insert Sample Products
INSERT INTO products (seller_id, name, description, category, price, unit, stock, quality, origin, status) VALUES
((SELECT id FROM users WHERE email = 'abebe@farmer.com'), 'Teff Grain', 'Premium quality white teff from Shewa region', 'Grains', 85.00, 'kg', 500, 'Premium', 'Shewa', 'active'),
((SELECT id FROM users WHERE email = 'abebe@farmer.com'), 'Coffee Beans', 'Organic Yirgacheffe coffee beans', 'Coffee', 450.00, 'kg', 200, 'Premium', 'Yirgacheffe', 'active'),
((SELECT id FROM users WHERE email = 'abebe@farmer.com'), 'Red Onions', 'Fresh red onions from local farm', 'Vegetables', 25.00, 'kg', 300, 'Good', 'Addis Ababa', 'active'),
((SELECT id FROM users WHERE email = 'yohannes@toolseller.com'), 'Irrigation Pump', 'Electric water pump for irrigation', 'Agricultural Technologies', 8500.00, 'unit', 15, 'New', 'China', 'active'),
((SELECT id FROM users WHERE email = 'yohannes@toolseller.com'), 'Hand Plow', 'Traditional Ethiopian hand plow', 'Agricultural Technologies', 1200.00, 'unit', 25, 'New', 'Ethiopia', 'active')
ON CONFLICT (name, seller_id) DO NOTHING;

-- Insert Sample Storage Facilities
INSERT INTO storage_facilities (provider_id, name, location, type, capacity, capacity_unit, available_capacity, price_per_unit, features, availability) VALUES
((SELECT id FROM users WHERE email = 'hanna@storage.com'), 'Adama Grain Storage', 'Adama', 'Warehouse', 1000.00, 'tons', 750.00, 150.00, ARRAY['Climate Control', 'Security', '24/7 Access'], 'Available'),
((SELECT id FROM users WHERE email = 'hanna@storage.com'), 'Cold Storage Facility', 'Addis Ababa', 'Cold Storage', 500.00, 'tons', 400.00, 250.00, ARRAY['Temperature Control', 'Humidity Control', 'Security'], 'Available')
ON CONFLICT (name, location) DO NOTHING;

-- Insert Sample Learning Modules
INSERT INTO learning_modules (educator_id, title, description, category, level, duration_minutes, price, is_free, status) VALUES
(4, 'Modern Farming Techniques', 'Learn about modern farming methods and best practices', 'Farming Techniques', 'Beginner', 45, 0.00, TRUE, 'published'),
(4, 'Organic Pest Control', 'Natural methods for controlling pests without chemicals', 'Pest Management', 'Intermediate', 60, 50.00, FALSE, 'published'),
(4, 'Soil Health Management', 'Understanding and improving soil quality', 'Soil Management', 'Beginner', 30, 0.00, TRUE, 'published');

-- Insert Sample Orders
INSERT INTO orders (order_number, buyer_id, total_amount, platform_fee, delivery_fee, net_amount, status, payment_status, payment_method, delivery_address, delivery_type) VALUES
('ORD-2025-001', 2, 1700.00, 85.00, 100.00, 1515.00, 'delivered', 'released', 'Wallet', 'Bahir Dar, Near Stadium', 'delivery'),
('ORD-2025-002', 2, 450.00, 22.50, 50.00, 377.50, 'shipped', 'in_escrow', 'Wallet', 'Bahir Dar, Near Stadium', 'delivery');

-- Insert Sample Order Items
INSERT INTO order_items (order_id, product_id, seller_id, product_name, quantity, unit_price, total_price, seller_amount, platform_commission) VALUES
(1, 1, 1, 'Teff Grain', 20, 85.00, 1700.00, 1615.00, 85.00),
(2, 2, 1, 'Coffee Beans', 1, 450.00, 450.00, 427.50, 22.50);

-- Insert Sample Transportation
INSERT INTO transportation (order_id, transporter_id, pickup_location, dropoff_location, product_name, delivery_fee, status, scheduled_date) VALUES
(1, 3, 'Addis Ababa', 'Bahir Dar', 'Teff Grain (20 kg)', 100.00, 'delivered', NOW() - INTERVAL '2 days'),
(2, 3, 'Addis Ababa', 'Bahir Dar', 'Coffee Beans (1 kg)', 50.00, 'in_transit', NOW());

-- Insert Sample Transactions
INSERT INTO transactions (user_id, order_id, type, amount, description, status, payment_method) VALUES
(2, 1, 'Payment', 1700.00, 'Payment for order ORD-2025-001', 'Completed', 'Wallet'),
(1, 1, 'Earning', 1615.00, 'Sale of Teff Grain', 'Completed', 'Wallet'),
(3, 1, 'Earning', 100.00, 'Delivery fee for ORD-2025-001', 'Completed', 'Wallet');

-- Insert Sample Enrollments
INSERT INTO enrollments (user_id, module_id, progress, completed) VALUES
(1, 1, 100, TRUE),
(1, 3, 50, FALSE),
(2, 1, 75, FALSE);

-- Insert Sample Reviews
INSERT INTO reviews (user_id, product_id, order_id, rating, comment) VALUES
(2, 1, 1, 5, 'Excellent quality teff! Very satisfied with the purchase.'),
(2, 2, 2, 4, 'Good coffee beans, fresh and aromatic.');

-- Insert Sample Notifications
INSERT INTO notifications (user_id, type, title, message, read) VALUES
(1, 'order', 'New Order Received', 'You have received a new order for Teff Grain', TRUE),
(2, 'delivery', 'Order Shipped', 'Your order ORD-2025-002 has been shipped', FALSE),
(3, 'payment', 'Payment Received', 'You received 100 Birr for delivery', TRUE);

-- Verification
SELECT 'Sample data inserted successfully!' AS status;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Orders: ' || COUNT(*) FROM orders;
SELECT 'Storage Facilities: ' || COUNT(*) FROM storage_facilities;
SELECT 'Learning Modules: ' || COUNT(*) FROM learning_modules;
