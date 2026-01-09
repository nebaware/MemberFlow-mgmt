-- Reset Admin Password
-- Email: admin@azmera.com
-- New Password: Admin@2024
-- Generated: December 2024

UPDATE "User"
SET 
  "passwordHash" = '$2b$10$4wpDfKhN1zSWlm7V3x.rse7jRlzodubzJEz5SDk0YkW4ysMjLbfPi',
  "updatedAt" = NOW()
WHERE email = 'admin@azmera.com';

-- Verify the update
SELECT id, email, name, role, "updatedAt"
FROM "User"
WHERE email = 'admin@azmera.com';
