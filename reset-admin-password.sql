-- Quick Admin Password Reset
-- This resets the admin@azmera.com password to: Admin@2024
-- Run this in your PostgreSQL database if you've forgotten your admin password

-- Password: Admin@2024
-- Hash generated with bcrypt (cost factor 10)

UPDATE "User"
SET 
  "passwordHash" = '$2a$10$YourHashWillBeHere',
  "updatedAt" = NOW()
WHERE email = 'admin@azmera.com';

-- To generate a new hash, run: node reset-admin-password.js
-- Then copy the hash from the output and replace the hash above

-- Verify the update
SELECT id, email, name, role, "updatedAt"
FROM "User"
WHERE email = 'admin@azmera.com';
