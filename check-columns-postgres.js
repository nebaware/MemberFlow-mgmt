const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('sslmode') ? '' : '?sslmode=disable'),
});

async function checkColumns() {
    try {
        const client = await pool.connect();
        console.log('Checking columns for "users" table...');

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);

        console.log('Columns found:', res.rows.map(r => r.column_name));

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkColumns();
