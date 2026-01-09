import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function isDbConfigured() {
  return true; // SQLite is always available
}

function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'database', 'azmera.db');
    console.log('Opening SQLite database at:', dbPath);
    try {
      db = new Database(dbPath, { verbose: console.log });
    } catch (err) {
      console.error('Failed to open database:', err);
      throw err;
    }
    db.pragma('journal_mode = WAL');
    // Enable foreign key constraints for data integrity
    db.pragma('foreign_keys = ON');

    // Ensure schema is initialized
    initializeSchema();
  }
  return db;
}

export async function dbQuery(text: string, params?: any[]) {
  const database = getDb();

  try {
    // Sanitize parameters - SQLite only accepts numbers, strings, bigints, buffers, and null
    const sanitizedParams = params?.map(param => {
      if (param === undefined) return null;
      if (param === null) return null;
      if (typeof param === 'number') return param;
      if (typeof param === 'string') return param;
      if (typeof param === 'bigint') return param;
      if (typeof param === 'boolean') return param ? 1 : 0;
      if (Buffer.isBuffer(param)) return param;
      if (Array.isArray(param)) return JSON.stringify(param);
      if (typeof param === 'object') return JSON.stringify(param);
      return String(param);
    });

    // Convert PostgreSQL syntax to SQLite
    let sqliteQuery = text
      .replace(/\$(\d+)/g, '?') // Replace $1, $2 with ?
      .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME')
      .replace(/TEXT\[\]/gi, 'TEXT') // Arrays as JSON strings
      .replace(/NUMERIC\((\d+),(\d+)\)/gi, 'REAL')
      .replace(/BOOLEAN/gi, 'INTEGER')
      .replace(/now\(\)/gi, "datetime('now')")
      .replace(/RETURNING \*/gi, '') // SQLite doesn't support RETURNING *
      .replace(/ON CONFLICT DO NOTHING/gi, 'ON CONFLICT IGNORE')
      .replace(/"User"/g, 'users') // Map Prisma model "User" to SQLite table "users"
      .replace(/"RoleChangeRequest"/g, 'role_change_requests') // Map Prisma model "RoleChangeRequest"
      .replace(/"Product"/g, 'products') // Map Prisma model "Product"
      .replace(/"Order"/g, 'orders') // Map Prisma model "Order"
      .replace(/"Transaction"/g, 'transactions') // Map Prisma model "Transaction"
      .replace(/"Notification"/g, 'notifications'); // Map Prisma model "Notification"

    // Check if it's a SELECT query
    if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = database.prepare(sqliteQuery);
      const rows = sanitizedParams ? stmt.all(...sanitizedParams) : stmt.all();
      return rows;
    }

    // For INSERT/UPDATE/DELETE with RETURNING clause
    if (sqliteQuery.includes('RETURNING')) {
      const parts = sqliteQuery.split('RETURNING');
      const mainQuery = parts[0].trim();
      const returningFields = parts[1]?.trim();

      const stmt = database.prepare(mainQuery);
      const info = sanitizedParams ? stmt.run(...sanitizedParams) : stmt.run();

      // Get the inserted/updated row
      if (info.lastInsertRowid) {
        const selectStmt = database.prepare(
          `SELECT ${returningFields || '*'} FROM ${extractTableName(mainQuery)} WHERE rowid = ?`
        );
        const row = selectStmt.get(info.lastInsertRowid);
        return [row];
      }

      return [{ id: info.lastInsertRowid, changes: info.changes }];
    }

    // Regular INSERT/UPDATE/DELETE
    const stmt = database.prepare(sqliteQuery);
    const info = sanitizedParams ? stmt.run(...sanitizedParams) : stmt.run();
    return [{ id: info.lastInsertRowid, changes: info.changes }];

  } catch (error: any) {
    // SQLite query failed
    throw error;
  }
}

function extractTableName(query: string): string {
  const match = query.match(/(?:INSERT INTO|UPDATE|FROM)\s+(\w+)/i);
  return match ? match[1] : 'unknown';
}

// Initialize database schema
export function initializeSchema() {
  const database = getDb();

  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'transporter', 'educator', 'tool_seller', 'storage_provider', 'admin')),
      phone TEXT,
      location TEXT,
      profile_image TEXT,
      wallet_balance REAL DEFAULT 0,
      escrow_balance REAL DEFAULT 0,
      bio TEXT,
      farm_size REAL,
      farm_size_unit TEXT,
      specialization TEXT,
      experience_years INTEGER,
      verified INTEGER DEFAULT 0,
      verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
      verification_documents TEXT,
      license_number TEXT,
      license_expiry DATETIME,
      license_verified INTEGER DEFAULT 0,
      license_verification_date DATETIME,
      verified_by_admin_id INTEGER REFERENCES users(id),
      vehicle_registration TEXT,
      requested_role TEXT CHECK (requested_role IN ('farmer', 'buyer', 'transporter', 'educator', 'tool_seller', 'storage_provider', 'admin')),
      role_request_status TEXT DEFAULT 'none' CHECK (role_request_status IN ('none', 'pending', 'approved', 'rejected')),
      role_request_date DATETIME,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      category TEXT,
      location TEXT,
      image_preview TEXT,
      premium_listing INTEGER DEFAULT 0,
      farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      farmer_name TEXT,
      stock_quantity REAL DEFAULT 0,
      unit TEXT DEFAULT 'kg',
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      transporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      quantity REAL NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'PaymentPending',
      delivery_address TEXT,
      pickup_location TEXT,
      payment_method TEXT,
      delivery_confirmation_photo TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Transactions table
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Completed',
      created_at DATETIME DEFAULT (datetime('now'))
    );

    -- Learning modules table
    CREATE TABLE IF NOT EXISTS learning_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      content_type TEXT,
      content_body TEXT,
      category TEXT,
      language TEXT,
      thumbnail TEXT,
      duration TEXT,
      price REAL DEFAULT 0,
      reward_points INTEGER DEFAULT 0,
      educator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Course enrollments table
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
      payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
      payment_method TEXT,
      payment_transaction_id TEXT,
      amount_paid REAL DEFAULT 0,
      enrolled_at DATETIME DEFAULT (datetime('now')),
      payment_completed_at DATETIME,
      UNIQUE(user_id, module_id)
    );

    -- Storage facilities table
    CREATE TABLE IF NOT EXISTS storage_facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      capacity TEXT,
      storage_type TEXT,
      features TEXT,
      price_per_unit_per_month REAL DEFAULT 0,
      availability TEXT DEFAULT 'Available',
      image_url TEXT,
      contact TEXT,
      rating REAL DEFAULT 0,
      provider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Transportation requests table
    CREATE TABLE IF NOT EXISTS transportation_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      requester_name TEXT,
      contact TEXT,
      vehicle_type TEXT,
      pickup_location TEXT,
      dropoff_location TEXT,
      crop_type TEXT,
      quantity REAL,
      price_rate REAL,
      pickup_date DATETIME,
      special_features TEXT,
      additional_notes TEXT,
      status TEXT DEFAULT 'Pending',
      assigned_transporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      href TEXT,
      icon_name TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    -- IoT devices table
    CREATE TABLE IF NOT EXISTS iot_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      device_type TEXT NOT NULL,
      status TEXT DEFAULT 'Offline',
      last_reading TEXT,
      location TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Weather alerts table
    CREATE TABLE IF NOT EXISTS weather_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT (datetime('now')),
      expires_at DATETIME
    );

    -- Platform settings table
    CREATE TABLE IF NOT EXISTS platform_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Platform revenue table
    CREATE TABLE IF NOT EXISTS platform_revenue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
      revenue_type TEXT NOT NULL CHECK (revenue_type IN ('commission', 'premium_listing', 'subscription', 'service_fee')),
      amount REAL NOT NULL,
      percentage REAL,
      description TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    -- Insert default platform settings
    INSERT OR IGNORE INTO platform_settings (setting_key, setting_value, description) VALUES
      ('marketplace_commission', '5', 'Percentage commission on marketplace sales'),
      ('premium_listing_fee', '50', 'Fee for premium product listings (Birr)'),
      ('transport_commission', '10', 'Percentage commission on transport services'),
      ('storage_commission', '8', 'Percentage commission on storage bookings'),
      ('minimum_commission', '10', 'Minimum commission amount (Birr)'),
      ('escrow_fee', '2', 'Percentage fee for escrow services');

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_platform_revenue_order_id ON platform_revenue(order_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_platform_revenue_order_id ON platform_revenue(order_id);

    -- Disputes table
    CREATE TABLE IF NOT EXISTS disputes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      raiser_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Resolved', 'Rejected')),
      resolution_notes TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      resolved_at DATETIME,
      resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
    CREATE INDEX IF NOT EXISTS idx_disputes_raiser_id ON disputes(raiser_id);

    -- IoT Readings table
    CREATE TABLE IF NOT EXISTS iot_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER REFERENCES iot_devices(id) ON DELETE CASCADE,
      reading_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      recorded_at DATETIME DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_iot_readings_device_id ON iot_readings(device_id);
    CREATE INDEX IF NOT EXISTS idx_iot_readings_recorded_at ON iot_readings(recorded_at);
  `;

  const statements = schema.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        database.exec(statement);
      } catch (error: any) {
        if (!error.message.includes('already exists')) {
          // Schema creation error
        }
      }
    }
  }

  // console.log('SQLite schema initialized');

  // Ensure new columns exist for existing tables (migrations)
  const migrations = [
    "ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT 'pending'",
    "ALTER TABLE users ADD COLUMN verification_documents TEXT",
    "ALTER TABLE users ADD COLUMN license_number TEXT",
    "ALTER TABLE users ADD COLUMN license_expiry DATETIME",
    "ALTER TABLE users ADD COLUMN license_verified INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN license_verification_date DATETIME",
    "ALTER TABLE users ADD COLUMN verified_by_admin_id INTEGER REFERENCES users(id)",
    "ALTER TABLE users ADD COLUMN vehicle_registration TEXT",
    "ALTER TABLE users ADD COLUMN requested_role TEXT",
    "ALTER TABLE users ADD COLUMN role_request_status TEXT DEFAULT 'none'",
    "ALTER TABLE users ADD COLUMN role_request_date DATETIME",
    "ALTER TABLE users ADD COLUMN rejection_reason TEXT",

    // Add columns to products if missing
    "ALTER TABLE products ADD COLUMN stock_quantity REAL DEFAULT 0",
    "ALTER TABLE products ADD COLUMN unit TEXT DEFAULT 'kg'",

    // Seed Data
    `INSERT OR IGNORE INTO users (email, name, password_hash, role, verified, verification_status, wallet_balance) 
     VALUES ('admin@azmera.com', 'Admin User', '$2b$10$EDw/ksuAQb0.j23ES.9.QQOmm1uphguHEUE4/Ni4aAekxgy/6cLotS', 'admin', 1, 'verified', 0)`,

    `INSERT OR IGNORE INTO users (email, name, password_hash, role, verified, verification_status, wallet_balance, location)
     VALUES ('abebe@farmer.com', 'Abebe Kebede', '$2b$10$EDw/ksuAQb0.j23ES.9.QQOmm1uphguHEUE4/Ni4aAekxgy/6cLotS', 'farmer', 1, 'verified', 5000, 'Addis Ababa')`,

    `INSERT OR IGNORE INTO users (email, name, password_hash, role, verified, verification_status, wallet_balance, location)
     VALUES ('tigist@buyer.com', 'Tigist Alemu', '$2b$10$EDw/ksuAQb0.j23ES.9.QQOmm1uphguHEUE4/Ni4aAekxgy/6cLotS', 'buyer', 0, 'pending', 3000, 'Bahir Dar')`
  ];

  for (const migration of migrations) {
    try {
      database.exec(migration);
    } catch (error: any) {
      // Ignore "duplicate column name" errors
      if (!error.message.includes('duplicate column name')) {
        // console.error('Migration error:', error.message);
      }
    }
  }
}
