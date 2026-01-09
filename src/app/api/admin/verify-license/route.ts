import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { createNotification } from '@/lib/notifications';

/**
 * Admin-only endpoint to verify or reject user licenses
 */
export async function POST(request: Request) {
    try {
        // Check if user is authenticated and is admin
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'ADMIN' && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, status, notes } = body;

        // Validate input
        if (!userId || !status) {
            return NextResponse.json(
                { error: 'Missing required fields: userId and status' },
                { status: 400 }
            );
        }

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: 'Status must be either "approved" or "rejected"' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update user's license verification status
        const licenseVerified = status === 'approved';
        const verificationStatus = status === 'approved' ? 'verified' : 'rejected';

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                licenseVerified,
                verificationStatus,
                licenseVerificationDate: new Date(),
                verifiedByAdminId: session.user.id,
            },
        });

        // Send notification to user about verification status
        await createNotification({
            userId: updatedUser.id,
            type: 'license_verification',
            title: licenseVerified ? 'License Verified' : 'License Rejected',
            message: licenseVerified
                ? 'Your license has been verified successfully. You can now access all features.'
                : `Your license verification was rejected. Reason: ${notes || 'Not specified'}. Please update your details and try again.`,
        });

        return NextResponse.json({
            success: true,
            message: `License ${status} successfully`,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                licenseVerified: updatedUser.licenseVerified,
                verificationStatus: updatedUser.verificationStatus,
                verificationDate: updatedUser.licenseVerificationDate,
            },
            notes: notes || null,
        });
    } catch (err: any) {
        console.error('License verification error:', err);
        return NextResponse.json(
            { error: 'License verification failed', details: err.message },
            { status: 500 }
        );
    }
}

/**
 * Get pending license verifications (admin only)
 */
export async function GET(request: Request) {
    try {
        // Check if user is authenticated and is admin
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'ADMIN' && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        // Get users with pending license verification
        const users = await prisma.user.findMany({
            where: {
                verificationStatus: status,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                location: true,
                licenseNumber: true,
                licenseExpiry: true,
                licenseVerified: true,
                verificationStatus: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            count: users.length,
            users: users.map((u) => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                phone: u.phone,
                location: u.location,
                licenseNumber: u.licenseNumber,
                licenseExpiry: u.licenseExpiry,
                licenseVerified: u.licenseVerified,
                verificationStatus: u.verificationStatus,
                createdAt: u.createdAt,
            })),
        });
    } catch (err: any) {
        console.error('Get pending verifications error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch pending verifications', details: err.message },
            { status: 500 }
        );
    }
}
