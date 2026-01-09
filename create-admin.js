const bcrypt = require('bcryptjs');

async function createAdminHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n=== ADMIN USER CREDENTIALS ===');
  console.log('Email: admin@azmera.com');
  console.log('Password: admin123');
  console.log('\nPassword Hash:', hash);
  console.log('\n=== SQL TO RUN ===');
  console.log(`
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin-user-001',
  'Admin User',
  'admin@azmera.com',
  '${hash}',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  role = 'ADMIN',
  "passwordHash" = '${hash}',
  "updatedAt" = NOW();
  `);
}

createAdminHash();
