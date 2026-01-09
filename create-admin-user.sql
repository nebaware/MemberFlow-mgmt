-- Create Admin User for Azmera Platform
-- Email: admin@azmera.com
-- Password: admin123
-- Run: psql -U postgres -d azmera_db -f create-admin-user.sql

-- Insert Admin User
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin-user-001',
  'Admin User',
  'admin@azmera.com',
  '$2b$10$Lb37kq6qycQfgfZqyNRs7Oh8WtBv1VTccne6cty1SQSkrIA9O/yB.',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  role = 'ADMIN',
  "passwordHash" = '$2b$10$Lb37kq6qycQfgfZqyNRs7Oh8WtBv1VTccne6cty1SQSkrIA9O/yB.',
  "updatedAt" = NOW();

-- Verification
SELECT 'Admin user created successfully!' AS status;
SELECT id, name, email, role FROM "User" WHERE role = 'ADMIN';
