import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Only admins can reset passwords
        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { email, newPassword } = body;

        if (!email || !newPassword) {
            return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Hash the new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await prisma.user.update({
            where: { email },
            data: {
                passwordHash,
                updatedAt: new Date(),
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'password_reset',
                entityType: 'User',
                entityId: user.id,
                changes: JSON.stringify({
                    targetUser: email,
                    resetBy: session.user.email,
                }),
            },
        });

        return NextResponse.json({
            success: true,
            message: `Password reset successfully for ${email}`,
        });
    } catch (err: any) {
        console.error('Password reset error:', err);
        return NextResponse.json(
            { error: 'Failed to reset password', details: err.message },
            { status: 500 }
        );
    }
}
