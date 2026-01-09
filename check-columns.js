
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL + '?sslmode=disable' });
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User' AND table_schema = 'public'");
        console.log('COLUMNS_START');
        res.rows.forEach(r => console.log(r.column_name + ': ' + r.data_type));
        console.log('COLUMNS_END');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
