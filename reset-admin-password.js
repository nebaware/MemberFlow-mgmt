const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  // Change this to your desired password
  const newPassword = 'Admin@2024';
  const hash = await bcrypt.hash(newPassword, 10);
  
  console.log('\n=== ADMIN PASSWORD RESET ===');
  console.log('Email: admin@azmera.com');
  console.log('New Password:', newPassword);
  console.log('\nPassword Hash:', hash);
  console.log('\n=== SQL TO RUN IN YOUR DATABASE ===');
  console.log(`
UPDATE "User"
SET 
  "passwordHash" = '${hash}',
  "updatedAt" = NOW()
WHERE email = 'admin@azmera.com';
  `);
  console.log('\n=== OR RUN THIS COMMAND ===');
  console.log(`node reset-admin-password.js | grep "UPDATE" -A 5`);
}

resetAdminPassword();
