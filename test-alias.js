const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('sslmode') ? '' : '?sslmode=disable'),
});

async function testAliasing() {
    try {
        const client = await pool.connect();

        // Test the exact query from auth.config.ts
        const query = `SELECT id, email, name, role, password_hash as passwordHash FROM users WHERE email = $1`;
        const result = await client.query(query, ['admin@azmera.com']);

        console.log('Query result:');
        console.log('Row count:', result.rows.length);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('\nUser object keys:', Object.keys(user));
            console.log('\nUser object:', user);
            console.log('\npasswordHash property:', user.passwordHash);
            console.log('password_hash property:', user.password_hash);
        }

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
        await pool.end();
    }
}

testAliasing();
