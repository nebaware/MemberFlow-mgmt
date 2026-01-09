import { Pool } from 'pg';
import { dbQuery as sqliteQuery, initializeSchema as initSqlite } from '@/lib/db/db-sqlite';

let pool: any = null;
let usingSQLite = false;

// Check if we should use SQLite fallback
if (!process.env.DATABASE_URL || process.env.USE_SQLITE === 'true') {
  usingSQLite = true;
}

export function isDbConfigured() {
  return usingSQLite || !!process.env.DATABASE_URL;
}

export async function dbQuery(text: string, params?: any[]) {
  // Use SQLite if explicitly configured or no DB URL
  if (usingSQLite) {
    if (!global.__sqliteInitialized) {
      initSqlite();
      global.__sqliteInitialized = true;
    }
    return sqliteQuery(text, params);
  }

  // Use PostgreSQL
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL.includes('sslmode')
        ? process.env.DATABASE_URL
        : `${process.env.DATABASE_URL}?sslmode=disable`,
    });
  }

  try {
    const res = await pool.query(text, params);
    return res.rows;
  } catch (error) {
    // Database error - destroy pool and reset
    console.error('Database query error', error);
    if (pool) {
      await pool.end();
      pool = null;
    }
    throw error;
  }
}

declare global {
  var __sqliteInitialized: boolean | undefined;
}
