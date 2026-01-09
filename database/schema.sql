-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'transporter', 'educator', 'tool_seller', 'storage_provider', 'admin')),
  phone TEXT,
  location TEXT,
  profile_image TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  escrow_balance DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  farm_size DECIMAL(10,2),
  farm_size_unit TEXT,
  specialization TEXT,
  experience_years INTEGER,
  verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents TEXT,
  license_number TEXT,
  license_expiry TIMESTAMP WITH TIME ZONE,
  license_verified BOOLEAN DEFAULT false,
  license_verification_date TIMESTAMP WITH TIME ZONE,
  verified_by_admin_id INTEGER REFERENCES users(id),
  vehicle_registration TEXT,
  requested_role TEXT CHECK (requested_role IN ('farmer', 'buyer', 'transporter', 'educator', 'tool_seller', 'storage_provider', 'admin')),
  role_request_status TEXT DEFAULT 'none' CHECK (role_request_status IN ('none', 'pending', 'approved', 'rejected')),
  role_request_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT,
  location TEXT,
  image_preview TEXT,
  premium_listing BOOLEAN DEFAULT false,
  farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  farmer_name TEXT,
  stock_quantity DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  transporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  quantity DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'PaymentPending',
  delivery_address TEXT,
  pickup_location TEXT,
  payment_method TEXT,
  delivery_confirmation_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning modules table
CREATE TABLE IF NOT EXISTS learning_modules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_type TEXT,
  content_body TEXT,
  category TEXT,
  language TEXT,
  thumbnail TEXT,
  duration TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  reward_points INTEGER DEFAULT 0,
  educator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_transaction_id TEXT,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, module_id)
);

-- Storage facilities table
CREATE TABLE IF NOT EXISTS storage_facilities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  capacity TEXT,
  storage_type TEXT,
  features TEXT,
  price_per_unit_per_month DECIMAL(10,2) DEFAULT 0,
  availability TEXT DEFAULT 'Available',
  image_url TEXT,
  contact TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  provider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transportation requests table
CREATE TABLE IF NOT EXISTS transportation_requests (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  requester_name TEXT,
  contact TEXT,
  vehicle_type TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,
  crop_type TEXT,
  quantity DECIMAL(10,2),
  price_rate DECIMAL(10,2),
  pickup_date TIMESTAMP WITH TIME ZONE,
  special_features TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'Pending',
  assigned_transporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  href TEXT,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IoT devices table
CREATE TABLE IF NOT EXISTS iot_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  status TEXT DEFAULT 'Offline',
  last_reading TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather alerts table
CREATE TABLE IF NOT EXISTS weather_alerts (
  id SERIAL PRIMARY KEY,
  region TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform revenue table
CREATE TABLE IF NOT EXISTS platform_revenue (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  revenue_type TEXT NOT NULL CHECK (revenue_type IN ('commission', 'premium_listing', 'subscription', 'service_fee')),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, description) VALUES
  ('marketplace_commission', '5', 'Percentage commission on marketplace sales'),
  ('premium_listing_fee', '50', 'Fee for premium product listings (Birr)'),
  ('transport_commission', '10', 'Percentage commission on transport services'),
  ('storage_commission', '8', 'Percentage commission on storage bookings'),
  ('minimum_commission', '10', 'Minimum commission amount (Birr)'),
  ('escrow_fee', '2', 'Percentage fee for escrow services')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_order_id ON platform_revenue(order_id);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  raiser_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Resolved', 'Rejected')),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_raiser_id ON disputes(raiser_id);

-- IoT Readings table
CREATE TABLE IF NOT EXISTS iot_readings (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES iot_devices(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_iot_readings_device_id ON iot_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_readings_recorded_at ON iot_readings(recorded_at);
