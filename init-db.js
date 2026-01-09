const Database = require('better-sqlite3');
const dbPath = 'd:\\studio-master\\azmera.db';
console.log('Initializing DB at:', dbPath);
const db = new Database(dbPath);

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
`;

const seeds = [
    `INSERT OR IGNORE INTO users (email, name, password_hash, role, verified, verification_status, wallet_balance) 
     VALUES ('admin@azmera.com', 'Admin User', '$2b$10$9.lRaUB/lHlUzbdT2SuqOeT3CEMwLEqqRpW4c1gCM7VNOc6DGSWJQ6', 'admin', 1, 'verified', 0)`,

    `INSERT OR IGNORE INTO users (email, name, password_hash, role, verified, verification_status, wallet_balance, location)
     VALUES ('abebe@farmer.com', 'Abebe Kebede', '$2b$10$9.lRaUB/lHlUzbdT2SuqOeT3CEMwLEqqRpW4c1gCM7VNOc6DGSWJQ6', 'farmer', 1, 'verified', 5000, 'Addis Ababa')`,

    `INSERT OR IGNORE INTO users (email, name, password_hash, role, verified, verification_status, wallet_balance, location)
     VALUES ('tigist@buyer.com', 'Tigist Alemu', '$2b$10$9.lRaUB/lHlUzbdT2SuqOeT3CEMwLEqqRpW4c1gCM7VNOc6DGSWJQ6', 'buyer', 0, 'pending', 3000, 'Bahir Dar')`
];

db.exec(schema);
console.log('Schema executed.');

for (const seed of seeds) {
    const info = db.prepare(seed).run();
    console.log('Seed result:', info);
}

const users = db.prepare("SELECT * FROM users").all();
console.log('Final Users:', users);
