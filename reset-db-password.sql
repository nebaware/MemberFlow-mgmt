-- Reset password for azmera_user
ALTER USER azmera_user WITH PASSWORD 'azmera_secure_2025';

-- Verify user exists
SELECT usename FROM pg_user WHERE usename = 'azmera_user';
