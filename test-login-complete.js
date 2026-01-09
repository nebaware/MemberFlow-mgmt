const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('sslmode') ? '' : '?sslmode=disable'),
});

async function testCompleteLogin() {
    try {
        const client = await pool.connect();
        console.log('=== COMPLETE LOGIN TEST ===\n');

        const email = 'admin@azmera.com';
        const password = 'password123';

        // Step 1: Lookup user
        console.log('Step 1: Looking up user...');
        const userQuery = `SELECT id, email, name, role, password_hash as "passwordHash" FROM users WHERE email = $1`;
        const userResult = await client.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            console.log('❌ FAIL: User not found');
            client.release();
            await pool.end();
            return;
        }

        const user = userResult.rows[0];
        console.log('✅ User found:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hasHash: !!user.passwordHash,
            hashLength: user.passwordHash?.length
        });

        // Step 2: Validate password
        console.log('\nStep 2: Validating password...');
        console.log('Password to check:', password);
        console.log('Hash from DB:', user.passwordHash);

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log('bcrypt.compare result:', isValid);

        if (!isValid) {
            console.log('❌ FAIL: Password validation failed');

            // Try to generate a new hash and compare
            console.log('\nGenerating fresh hash for comparison...');
            const freshHash = await bcrypt.hash(password, 10);
            console.log('Fresh hash:', freshHash);
            const freshTest = await bcrypt.compare(password, freshHash);
            console.log('Fresh hash validates:', freshTest);

            client.release();
            await pool.end();
            return;
        }

        console.log('✅ Password validated successfully');

        // Step 3: Fetch additional user data (JWT callback simulation)
        console.log('\nStep 3: Fetching license/verification data...');
        const jwtQuery = `SELECT role, license_verified as "licenseVerified", verification_status as "verificationStatus", license_number as "licenseNumber" FROM users WHERE id = $1`;
        const jwtResult = await client.query(jwtQuery, [user.id]);

        if (jwtResult.rows.length === 0) {
            console.log('❌ FAIL: Could not fetch user data for JWT');
            client.release();
            await pool.end();
            return;
        }

        const dbUser = jwtResult.rows[0];
        console.log('✅ Additional data fetched:', dbUser);

        console.log('\n=== ✅ ALL STEPS PASSED ===');
        console.log('Login should work with these credentials.');

        client.release();
        await pool.end();

    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        console.error('Stack:', err.stack);
        await pool.end();
    }
}

testCompleteLogin();
