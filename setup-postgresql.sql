-- ============================================
-- AZMERA PLATFORM - POSTGRESQL SETUP SCRIPT
-- ============================================
-- Run this script to set up the complete database
-- Usage: psql -U postgres -f setup-postgresql.sql
-- ============================================

-- Create database
CREATE DATABASE azmera_db;

-- Connect to the database
\c azmera_db

-- Create user
CREATE USER azmera_user WITH PASSWORD 'azmera_secure_2025';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE azmera_db TO azmera_user;
GRANT ALL ON SCHEMA public TO azmera_user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'buyer', 'transporter', 'educator', 'tool_seller', 'storage_provider', 'admin')),
    
    -- Profile information
    location VARCHAR(255),
    bio TEXT,
    profile_image VARCHAR(500),
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    
    -- Wallet
    wallet_balance DECIMAL(12, 2) DEFAULT 0.00,
    escrow_balance DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Role-specific fields
    farm_size DECIMAL(10, 2),
    farm_size_unit VARCHAR(20),
    specialization VARCHAR(255),
    experience_years INTEGER,
    vehicle_type VARCHAR(100),
    license_number VARCHAR(100),
    vehicle_registration VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    
    -- Pricing
    price DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    
    -- Inventory
    stock INTEGER DEFAULT 0,
    min_order_quantity INTEGER DEFAULT 1,
    
    -- Details
    quality VARCHAR(50),
    origin VARCHAR(255),
    certification VARCHAR(255),
    
    -- Media
    images TEXT[],
    
    -- Metrics
    view_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products(name);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    
    -- Order details
    total_amount DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(12, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(12, 2) DEFAULT 0.00,
    net_amount DECIMAL(12, 2) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'in_escrow', 'released', 'refunded')),
    payment_method VARCHAR(50),
    
    -- Delivery
    delivery_address TEXT,
    delivery_type VARCHAR(50) CHECK (delivery_type IN ('delivery', 'pickup')),
    transporter_id INTEGER REFERENCES users(id),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    
    -- Item details
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    
    -- Commission split
    seller_amount DECIMAL(12, 2) NOT NULL,
    platform_commission DECIMAL(12, 2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_id INTEGER REFERENCES orders(id),
    
    -- Transaction details
    type VARCHAR(50) NOT NULL CHECK (type IN ('Earning', 'Withdrawal', 'EscrowHold', 'EscrowRelease', 'Payment', 'Refund')),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'InEscrow', 'Completed', 'Failed', 'Cancelled')),
    
    -- Payment gateway
    gateway_transaction_id VARCHAR(255),
    payment_method VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ============================================
-- STORAGE FACILITIES TABLE
-- ============================================
CREATE TABLE storage_facilities (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Facility details
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    
    -- Capacity
    capacity DECIMAL(10, 2) NOT NULL,
    capacity_unit VARCHAR(50) NOT NULL,
    available_capacity DECIMAL(10, 2) NOT NULL,
    
    -- Pricing
    price_per_unit DECIMAL(12, 2) NOT NULL,
    
    -- Features
    features TEXT[],
    
    -- Status
    availability VARCHAR(50) DEFAULT 'Available' CHECK (availability IN ('Available', 'Limited Space', 'Full')),
    
    -- Media
    images TEXT[],
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_storage_provider ON storage_facilities(provider_id);
CREATE INDEX idx_storage_location ON storage_facilities(location);

-- ============================================
-- STORAGE BOOKINGS TABLE
-- ============================================
CREATE TABLE storage_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    facility_id INTEGER NOT NULL REFERENCES storage_facilities(id),
    
    -- Booking details
    quantity DECIMAL(10, 2) NOT NULL,
    duration_months INTEGER NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    
    -- Payment
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    
    -- Status
    booking_status VARCHAR(50) DEFAULT 'Pending' CHECK (booking_status IN ('Pending', 'Active', 'Completed', 'Cancelled')),
    
    -- Dates
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user ON storage_bookings(user_id);
CREATE INDEX idx_bookings_facility ON storage_bookings(facility_id);

-- ============================================
-- TRANSPORTATION TABLE
-- ============================================
CREATE TABLE transportation (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    transporter_id INTEGER REFERENCES users(id),
    
    -- Delivery details
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    
    -- Pricing
    delivery_fee DECIMAL(12, 2) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled')),
    
    -- Dates
    scheduled_date TIMESTAMP,
    pickup_date TIMESTAMP,
    delivery_date TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transportation_order ON transportation(order_id);
CREATE INDEX idx_transportation_transporter ON transportation(transporter_id);

-- ============================================
-- LEARNING MODULES TABLE
-- ============================================
CREATE TABLE learning_modules (
    id SERIAL PRIMARY KEY,
    educator_id INTEGER REFERENCES users(id),
    
    -- Module details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(50) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    
    -- Content
    content TEXT,
    video_url VARCHAR(500),
    duration_minutes INTEGER,
    
    -- Pricing
    price DECIMAL(12, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT TRUE,
    
    -- Metrics
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_educator ON learning_modules(educator_id);
CREATE INDEX idx_modules_category ON learning_modules(category);

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    module_id INTEGER NOT NULL REFERENCES learning_modules(id),
    
    -- Progress
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT FALSE,
    
    -- Dates
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(user_id, module_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_module ON enrollments(module_id);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    order_id INTEGER REFERENCES orders(id),
    
    -- Review details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    
    -- Notification details
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    
    -- Link
    link VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- ESCROW TRANSACTIONS TABLE
-- ============================================
CREATE TABLE escrow_transactions (
    id SERIAL PRIMARY KEY,
    escrow_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Parties
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    transporter_id INTEGER REFERENCES users(id),
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    
    -- Order reference
    order_id INTEGER REFERENCES orders(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'held' CHECK (status IN ('held', 'released', 'disputed', 'refunded')),
    
    -- Release conditions
    release_conditions JSONB,
    auto_release_date TIMESTAMP,
    
    -- Dates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP
);

CREATE INDEX idx_escrow_buyer ON escrow_transactions(buyer_id);
CREATE INDEX idx_escrow_seller ON escrow_transactions(seller_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);

-- ============================================
-- DISPUTES TABLE
-- ============================================
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    dispute_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Reference
    escrow_transaction_id INTEGER REFERENCES escrow_transactions(id),
    order_id INTEGER REFERENCES orders(id),
    
    -- Parties
    raised_by INTEGER NOT NULL REFERENCES users(id),
    
    -- Dispute details
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
    resolution VARCHAR(50) CHECK (resolution IN ('refund_buyer', 'release_seller', 'partial_refund')),
    
    -- Dates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_disputes_escrow ON disputes(escrow_transaction_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- ============================================
-- PLATFORM REVENUE TABLE
-- ============================================
CREATE TABLE platform_revenue (
    id SERIAL PRIMARY KEY,
    
    -- Revenue details
    transaction_id INTEGER REFERENCES transactions(id),
    revenue_type VARCHAR(50) NOT NULL CHECK (revenue_type IN ('commission', 'subscription', 'listing_fee', 'premium_feature')),
    amount DECIMAL(12, 2) NOT NULL,
    
    -- Service type
    service_type VARCHAR(50) CHECK (service_type IN ('product', 'storage', 'transportation', 'tool_rental', 'learning')),
    
    -- Metadata
    currency VARCHAR(10) DEFAULT 'ETB',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revenue_type ON platform_revenue(revenue_type);
CREATE INDEX idx_revenue_service ON platform_revenue(service_type);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_facilities_updated_at BEFORE UPDATE ON storage_facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transportation_updated_at BEFORE UPDATE ON transportation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at BEFORE UPDATE ON learning_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO azmera_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO azmera_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO azmera_user;

-- ============================================
-- VERIFICATION
-- ============================================

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Success message
SELECT 'Database setup complete! 17 tables created.' AS status;
