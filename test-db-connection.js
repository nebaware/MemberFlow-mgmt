/**
 * PostgreSQL Connection Test
 * Run: node test-db-connection.js
 */

const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'azmera_db',
  user: process.env.DB_USER || 'azmera_user',
  password: process.env.DB_PASSWORD || 'azmera_secure_2025',
});

async function testConnection() {
  console.log('\n========================================');
  console.log('PostgreSQL Connection Test');
  console.log('========================================\n');

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');

    // Get current time
    const timeResult = await client.query('SELECT NOW()');
    console.log('✅ Current database time:', timeResult.rows[0].now);

    // Get database name
    const dbResult = await client.query('SELECT current_database()');
    console.log('✅ Connected to database:', dbResult.rows[0].current_database);

    // Count tables
    const tablesResult = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('✅ Tables in database:', tablesResult.rows[0].table_count);

    // List all tables
    const tableListResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('\n📊 Tables:');
    tableListResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Count users
    const usersResult = await client.query('SELECT COUNT(*) as user_count FROM "User"');
    console.log('\n👥 Users in database:', usersResult.rows[0].user_count);

    // Count products
    const productsResult = await client.query('SELECT COUNT(*) as product_count FROM "Product"');
    console.log('📦 Products in database:', productsResult.rows[0].product_count);

    // Count orders
    const ordersResult = await client.query('SELECT COUNT(*) as order_count FROM "Order"');
    console.log('🛒 Orders in database:', ordersResult.rows[0].order_count);

    // Database size
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size('azmera_db')) as size
    `);
    console.log('\n💾 Database size:', sizeResult.rows[0].size);

    client.release();
    await pool.end();

    console.log('\n========================================');
    console.log('✅ Connection test complete!');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Connection error:', err.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL service is running');
    console.error('2. Database credentials in .env.local are correct');
    console.error('3. Database "azmera_db" exists');
    console.error('4. User "azmera_user" has proper permissions\n');

    process.exit(1);
  }
}

testConnection();
