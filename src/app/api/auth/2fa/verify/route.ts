import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import speakeasy from 'speakeasy';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ error: '2FA not initialized' }, { status: 400 });
        }

        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
        });

        if (!verified) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        // Enable 2FA
        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorEnabled: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('2FA verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify 2FA', details: error.message },
            { status: 500 }
        );
    }
}
