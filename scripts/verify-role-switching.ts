
import { dbQuery, initializeSchema } from '@/lib/db/db-sqlite';

async function verifyRoleSwitching() {
    console.log('Starting verification...');

    // Initialize DB schema to ensure tables exist
    initializeSchema();

    // 1. Create a test user
    const testEmail = `test_user_${Date.now()}@example.com`;
    await dbQuery(
        `INSERT INTO users (email, name, password_hash, role) VALUES ($1, 'Test User', 'password', 'buyer')`,
        [testEmail]
    );
    const user = (await dbQuery(`SELECT * FROM users WHERE email = $1`, [testEmail]))[0] as any;
    console.log('Created test user:', user.id);

    // 2. Simulate Role Request (Direct DB update to simulate API action as we can't easily auth in script)
    console.log('Simulating role request...');
    await dbQuery(
        `UPDATE users 
     SET requested_role = 'farmer', 
         role_request_status = 'pending', 
         role_request_date = datetime('now'),
         verification_status = 'pending',
         license_number = 'LIC-123',
         verification_documents = 'https://example.com/doc.pdf'
     WHERE id = $1`,
        [user.id]
    );

    const userAfterRequest = (await dbQuery(`SELECT * FROM users WHERE id = $1`, [user.id]))[0] as any;
    console.log('User after request:', {
        requested_role: userAfterRequest.requested_role,
        status: userAfterRequest.role_request_status
    });

    if (userAfterRequest.role_request_status !== 'pending') throw new Error('Request status should be pending');

    // 3. Simulate Admin Approval
    console.log('Simulating admin approval...');
    await dbQuery(
        `UPDATE users 
     SET role = requested_role,
         role_request_status = 'approved',
         license_verified = 1,
         verification_status = 'verified',
         license_verification_date = datetime('now')
     WHERE id = $1`,
        [user.id]
    );

    const userAfterApproval = (await dbQuery(`SELECT * FROM users WHERE id = $1`, [user.id]))[0] as any;
    console.log('User after approval:', {
        role: userAfterApproval.role,
        status: userAfterApproval.role_request_status,
        verified: userAfterApproval.license_verified
    });

    if (userAfterApproval.role !== 'farmer') throw new Error('Role should be updated to farmer');
    if (userAfterApproval.role_request_status !== 'approved') throw new Error('Status should be approved');
    if (userAfterApproval.license_verified !== 1) throw new Error('License should be verified');

    console.log('Verification successful!');
}

verifyRoleSwitching().catch(console.error);
