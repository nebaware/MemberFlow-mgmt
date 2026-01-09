# Environment Variables Setup for Azmera Platform

## PostgreSQL Database Setup

1. **Install PostgreSQL** (if not already installed):
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name azmera-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create the database**:
   ```bash
   psql -U postgres
   CREATE DATABASE azmera;
   \q
   ```

3. **Run the schema**:
   ```bash
   psql -U postgres -d azmera -f database/schema.sql
   ```

4. **Configure DATABASE_URL**:
   Create a `.env.local` file in the project root with:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/azmera
   USE_SQLITE=false
   ```

   Replace `postgres`, `password`, `localhost`, and `5432` with your actual PostgreSQL credentials.

## Environment Variables Template

Copy this into your `.env.local` file:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/azmera
USE_SQLITE=false

# Payment Gateway Configuration (optional)
CHAPA_SECRET_KEY=your_chapa_secret_key_here
CHAPA_PUBLIC_KEY=your_chapa_public_key_here

# Google AI for Genkit (optional)
GOOGLE_API_KEY=your_google_api_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

## Quick Start with Docker

```bash
# Start PostgreSQL with Docker
docker run --name azmera-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=azmera \
  -p 5432:5432 \
  -d postgres

# Run schema
docker exec -i azmera-postgres psql -U postgres -d azmera < database/schema.sql
```

## Verification

After setup, restart the dev server:
```bash
npm run dev
```

The application will automatically use PostgreSQL if DATABASE_URL is configured.
