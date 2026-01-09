
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function listTables() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename");
        console.log('TABLE_LIST_START');
        res.rows.forEach(r => console.log(r.tablename));
        console.log('TABLE_LIST_END');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

listTables();
