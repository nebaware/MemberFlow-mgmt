#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

(async function main() {
  try {
    const allow = process.env.NODE_ENV === 'development' || process.env.ENABLE_DB_SEED === 'true' || process.argv.includes('--force');
    if (!allow) {
      console.error('Seeding is disabled. Set NODE_ENV=development or ENABLE_DB_SEED=true, or pass --force to override.');
      process.exit(1);
    }

    // Simple CLI args parsing (supports --key value or --key=value)
    const argv = process.argv.slice(2);
    const args = {};
    argv.forEach((a, i) => {
      if (a.startsWith('--')) {
        const eq = a.indexOf('=');
        if (eq !== -1) {
          const k = a.slice(2, eq);
          const v = a.slice(eq + 1);
          args[k] = v;
        } else {
          const k = a.slice(2);
          const next = argv[i + 1];
          if (!next || next.startsWith('--')) {
            args[k] = true;
          } else {
            args[k] = next;
          }
        }
      }
    });

    const envDatabaseUrl = process.env.DATABASE_URL;

    // Preference order:
    // 1) --database-url
    // 2) --db-user/--db-pass/--db-host/--db-port/--db-name assembled
    // 3) DATABASE_URL env var (optionally with DB_PASSWORD)
    // 4) default postgres://postgres@localhost:5432/azmera_db

    let databaseUrl = args['database-url'] || null;

    if (!databaseUrl) {
      const dbUser = args['db-user'] || process.env.DB_USER || (process.env.DATABASE_USER || null);
      const dbPass = args['db-pass'] || process.env.DB_PASSWORD || process.env.DB_PASSWORD;
      const dbHost = args['db-host'] || process.env.DB_HOST || 'localhost';
      const dbPort = args['db-port'] || process.env.DB_PORT || '5432';
      const dbName = args['db-name'] || process.env.DB_NAME || 'azmera_db';

      if (dbUser) {
        if (dbPass) {
          databaseUrl = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPass)}@${dbHost}:${dbPort}/${dbName}`;
        } else if (envDatabaseUrl) {
          // if env DATABASE_URL exists and has no password, use DB_PASSWORD env var
          const noPassMatch = envDatabaseUrl.match(/^postgres(?:ql)?:\/\/([^:@/]+)@(.+)$/);
          if (noPassMatch) {
            const user = noPassMatch[1];
            const rest = noPassMatch[2];
            const pw = process.env.DB_PASSWORD;
            if (pw) {
              databaseUrl = `postgresql://${user}:${encodeURIComponent(pw)}@${rest}`;
            } else {
              console.error('DATABASE_URL is missing a password. Set DB_PASSWORD env var or include the password in DATABASE_URL, or pass --db-pass.');
              process.exit(1);
            }
          } else {
            databaseUrl = envDatabaseUrl;
          }
        } else {
          // No password provided
          console.error('No database password provided. Use --db-pass or set DB_PASSWORD.');
          process.exit(1);
        }
      }
    }

    if (!databaseUrl) {
      // fallback to env DATABASE_URL or default
      if (envDatabaseUrl) {
        // if env url exists but lacks password, require DB_PASSWORD
        const noPassMatch = envDatabaseUrl.match(/^postgres(?:ql)?:\/\/([^:@/]+)@(.+)$/);
        if (noPassMatch) {
          const user = noPassMatch[1];
          const rest = noPassMatch[2];
          const pw = process.env.DB_PASSWORD;
          if (pw) {
            databaseUrl = `postgresql://${user}:${encodeURIComponent(pw)}@${rest}`;
          } else {
            console.error('DATABASE_URL is missing a password. Set DB_PASSWORD env var or include the password in DATABASE_URL, or pass --db-pass.');
            process.exit(1);
          }
        } else {
          databaseUrl = envDatabaseUrl;
        }
      } else {
        databaseUrl = 'postgresql://postgres@localhost:5432/azmera_db';
      }
    }

    console.log('Using DATABASE_URL:', databaseUrl.replace(/:(.*)@/, ':*****@'));

    const pool = new Pool({ connectionString: databaseUrl });

    const runSqlFile = async (filePath) => {
      console.log(`Executing SQL file: ${filePath}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await pool.query(sql);
        console.log(`OK: ${path.basename(filePath)}`);
      } catch (err) {
        console.warn(`Error executing ${path.basename(filePath)}:`, err.message);
      }
    };

    // Run migration SQL files (prisma/migrations/<folder>/migration.sql)
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
      // Sort for deterministic order
      const folders = entries.filter(e => e.isDirectory()).map(d => d.name).sort();
      for (const f of folders) {
        const migrationSql = path.join(migrationsDir, f, 'migration.sql');
        if (fs.existsSync(migrationSql)) {
          await runSqlFile(migrationSql);
        }
      }
    } else {
      console.log('No migrations directory found at prisma/migrations, skipping migrations.');
    }

    // Run insert-sample-data.sql if present
    const sampleSql = path.join(__dirname, '..', 'insert-sample-data.sql');
    if (fs.existsSync(sampleSql)) {
      await runSqlFile(sampleSql);
    } else {
      console.log('No insert-sample-data.sql found, skipping sample inserts.');
    }

    // Quick verification
    try {
      const products = await pool.query('SELECT COUNT(*) AS count FROM products');
      const users = await pool.query('SELECT COUNT(*) AS count FROM users');
      console.log('Products count:', products.rows[0].count);
      console.log('Users count:', users.rows[0].count);
    } catch (err) {
      console.warn('Verification queries failed:', err.message);
    }

    await pool.end();
    console.log('Seeding finished.');
    process.exit(0);
  } catch (err) {
    console.error('Seeder failed:', err);
    process.exit(1);
  }
})();
