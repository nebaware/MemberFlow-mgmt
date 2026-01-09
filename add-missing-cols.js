const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('sslmode') ? '' : '?sslmode=disable'),
});

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Adding missing columns...');

        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT false;`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number TEXT;`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS license_verification_date TIMESTAMP WITH TIME ZONE;`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_documents TEXT;`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS license_expiry TIMESTAMP WITH TIME ZONE;`);

        // Update verify status for admin
        await client.query(`UPDATE users SET verified = true, verification_status = 'verified' WHERE email = 'admin@azmera.com';`);

        console.log('Columns added and admin verified.');

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Migration Error:', err);
    }
}

migrate();
