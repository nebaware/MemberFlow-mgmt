import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `Azmera (${user.email})`,
        });

        // Generate QR code
        const otpauthUrl = secret.otpauth_url;
        if (!otpauthUrl) {
            throw new Error('Failed to generate OTP Auth URL');
        }

        const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

        // Save secret to user (but don't enable yet)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorSecret: secret.base32,
            },
        });

        return NextResponse.json({
            secret: secret.base32,
            qrCode: qrCodeUrl,
        });
    } catch (error: any) {
        console.error('2FA setup error:', error);
        return NextResponse.json(
            { error: 'Failed to setup 2FA', details: error.message },
            { status: 500 }
        );
    }
}
