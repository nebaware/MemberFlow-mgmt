import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/lib/auth/password-utils';

export async function POST(request: Request) {
    try {
        if (!isDbConfigured()) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { error: 'New passwords do not match' },
                { status: 400 }
            );
        }

        const strength = validatePasswordStrength(newPassword);
        if (!strength.isValid) {
            return NextResponse.json(
                { error: `Password too weak: ${strength.errors.join(', ')}` },
                { status: 400 }
            );
        }

        // Get current user password hash
        const userRows = await dbQuery(
            'SELECT id, password_hash FROM users WHERE id = $1',
            [session.user.id]
        );

        if (userRows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userRows[0];

        // Verify current password
        if (user.password_hash) {
            const isMatch = await comparePassword(currentPassword, user.password_hash);
            if (!isMatch) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }
        } else {
            // If user has no password (e.g. OAuth), they might need to set one
            // For now, we require current password if it exists
            // If it doesn't exist, we might allow setting it without current password, 
            // but for security let's assume they should use a reset flow or we'd need a specific "set password" flow.
            // Here we'll assume if they are logged in they can set it? 
            // Actually, if they logged in via OAuth, they might not have a password.
            // But our admin user has a password.
            return NextResponse.json({ error: 'Account does not use a password' }, { status: 400 });
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        await dbQuery(
            'UPDATE users SET password_hash = $1, updated_at = datetime("now") WHERE id = $2',
            [newPasswordHash, session.user.id]
        );

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (err: any) {
        console.error('Change password error:', err);
        return NextResponse.json(
            { error: 'Failed to update password', details: err.message },
            { status: 500 }
        );
    }
}
