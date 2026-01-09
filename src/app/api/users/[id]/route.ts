import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = params.id;

        // Users can only access their own data unless they're admin
        if (session.user.id !== userId && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                location: true,
                licenseNumber: true,
                licenseVerified: true,
                verificationStatus: true,
                bio: true,
                specialization: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        });

        // Calculate escrow balance (sum of amounts in held escrow transactions for orders where user is seller)
        const escrowOrders = await prisma.order.findMany({
            where: {
                sellerId: user.id,
                escrowStatus: 'held',
            },
            include: {
                escrowTransaction: true,
            },
        });

        const escrowBalance = escrowOrders.reduce((sum, order) => {
            return sum + (order.escrowTransaction?.amount || 0);
        }, 0);

        // Format the response to match the AppContext User interface
        const formattedUser = {
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role.toLowerCase(), // Convert ADMIN to admin, FARMER to farmer, etc.
            phone: user.phone || '',
            location: user.location || '',
            walletBalance: wallet?.balance || 0,
            escrowBalance: escrowBalance,
            profileImage: '', // Profile images require file storage setup (AWS S3, Cloudinary, etc.)
            bio: user.bio || '',
            specialization: user.specialization || '',
            licenseVerified: user.licenseVerified,
            verificationStatus: user.verificationStatus,
        };

        return NextResponse.json(formattedUser);
    } catch (err: any) {
        console.error('Error fetching user:', err);
        return NextResponse.json(
            { error: 'Failed to fetch user', details: err.message },
            { status: 500 }
        );
    }
}
