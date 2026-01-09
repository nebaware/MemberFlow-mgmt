**Seeding Local Database (Safe Instructions)**

- **Purpose:** Populate development database with sample users, products, orders and related data. Only run locally or in a disposable environment.

- **Safety first:** Do NOT enable database seeding in production. The code includes an environment guard; seeding only runs when `NODE_ENV=development` or `ENABLE_DB_SEED=true`.

- **Quick steps (PowerShell):**

  1. From the project root (`D:\studio-master`) set env vars and start the dev server (keeps logs visible):

     ```powershell
     $env:ENABLE_DB_SEED='true'
     $env:NODE_ENV='development'
     npm run dev
     ```

  2. In a new PowerShell tab, trigger the seed endpoint:

     ```powershell
     Invoke-RestMethod -Uri 'http://localhost:9002/api/admin/seed' -Method POST -ContentType 'application/json' -Body '{}'
     ```

     Or use curl:

     ```powershell
     curl -X POST 'http://localhost:9002/api/admin/seed' -H 'Content-Type: application/json' -d '{}'
     ```

  3. Check server terminal for `Database seeded successfully` or `Seed error:` logs.

- **Automated run (single command):** There is a helper script that starts the dev server, waits for it, runs the seed endpoint and performs basic DB checks. Run from repo root:

  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\run-seed-and-verify.ps1 -DbName 'azmera_db' -DbUser 'postgres'
  ```

  - Output and diagnostics are saved to `./scripts/logs/seed-run-<timestamp>.log`.

- **If the seed fails with a missing-tables error:**
  - Run migrations or the full setup script that creates required tables:

    ```powershell
    # run the repository's full DB setup (destructive if re-run on blank DB)
    psql -U postgres -f setup-postgresql.sql
    ```

  - Or apply individual migration SQL files in `prisma/migrations/` with `psql -U <user> -d <db> -f <migration.sql>`.

- **Verify data (examples):**

  ```powershell
  psql -U postgres -d azmera_db -c "SELECT COUNT(*) FROM products;"
  psql -U postgres -d azmera_db -c "SELECT COUNT(*) FROM users;"
  psql -U postgres -d azmera_db -c "SELECT id, name FROM products ORDER BY id DESC LIMIT 5;"
  ```

- **Notes:**
  - The seed endpoint is intentionally guarded by environment variables and should be further protected (admin auth) if used in any shared environment.
  - The repo contains idempotent SQL migrations in `prisma/migrations/` for missing tables the seed depends on.
  - If you want a non-HTTP seeding workflow, consider running `node` or `tsx` script server-side that imports the seed logic directly (safer for CI/one-off runs).

If you'd like, I can add a short npm script (e.g., `npm run seed`) that runs the seeder via a CLI instead of an HTTP endpoint.