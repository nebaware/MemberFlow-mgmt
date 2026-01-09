const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('sslmode') ? '' : '?sslmode=disable'),
});

async function setup() {
    try {
        console.log('Connecting to PostgreSQL...');
        const client = await pool.connect();
        console.log('Connected.');

        // 1. Run Schema
        console.log('Applying Schema...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('Schema applied.');

        // 2. Seed Admin
        console.log('Seeding Admin User...');
        const adminHash = '$2b$10$EDw/ksuAQb0.j23ES.9.QQOmm1uphguHEUE4/Ni4aAekxgy/6cLotS'; // Valid hash for 'password123'

        // Check if admin exists
        const res = await client.query('SELECT id FROM users WHERE email = $1', ['admin@azmera.com']);

        if (res.rows.length === 0) {
            await client.query(`
        INSERT INTO users (email, name, password_hash, role, verified, verification_status, wallet_balance)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['admin@azmera.com', 'Admin User', adminHash, 'admin', true, 'verified', 0]);
            console.log('Admin user created.');
        } else {
            console.log('Admin user already exists. Updating hash...');
            await client.query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [adminHash, 'admin', 'admin@azmera.com']);
            console.log('Admin hash updated.');
        }

        client.release();
        console.log('Setup complete.');
        process.exit(0);

    } catch (err) {
        console.error('Setup failed:', err);
        process.exit(1);
    }
}

setup();
