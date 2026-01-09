-- Create database user for Azmera application
CREATE USER azmera_user WITH PASSWORD 'azmera_secure_2025';

-- Grant privileges on database
GRANT ALL PRIVILEGES ON DATABASE azmera_db TO azmera_user;

-- Connect to azmera_db and grant schema privileges
\c azmera_db

-- Grant all privileges on schema
GRANT ALL ON SCHEMA public TO azmera_user;

-- Grant privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO azmera_user;

-- Grant privileges on all existing sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO azmera_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO azmera_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO azmera_user;

-- Verify user creation
SELECT usename FROM pg_user WHERE usename = 'azmera_user';
