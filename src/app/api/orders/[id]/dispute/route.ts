import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// POST: Create a dispute
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { reason } = body;

        if (!reason || !reason.trim()) {
            return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { dispute: true },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if user is buyer or seller
        if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if dispute already exists
        if (order.dispute) {
            return NextResponse.json({ error: 'Dispute already exists for this order' }, { status: 400 });
        }

        // Create dispute and update order in transaction
        const result = await prisma.$transaction(async (tx) => {
            const dispute = await tx.dispute.create({
                data: {
                    orderId: id,
                    raisedBy: session.user.id,
                    reason,
                    status: 'pending',
                },
            });

            // Update order escrow status
            await tx.order.update({
                where: { id },
                data: {
                    escrowStatus: 'disputed',
                },
            });

            // Create notifications for both parties and admins
            const notifications = [];

            // Notify the other party
            const otherPartyId = order.buyerId === session.user.id ? order.sellerId : order.buyerId;
            notifications.push({
                userId: otherPartyId,
                type: 'dispute_created',
                title: 'Dispute Raised',
                message: `A dispute has been raised for order #${order.orderNumber}`,
                orderId: id,
            });

            // Notify all admins
            const admins = await tx.user.findMany({
                where: { role: 'ADMIN' },
                select: { id: true },
            });

            admins.forEach(admin => {
                notifications.push({
                    userId: admin.id,
                    type: 'dispute_created',
                    title: 'New Dispute Requires Review',
                    message: `A dispute has been raised for order #${order.orderNumber}. Please review and resolve.`,
                    orderId: id,
                });
            });

            await tx.notification.createMany({
                data: notifications,
            });

            return dispute;
        });

        return NextResponse.json({ success: true, dispute: result });
    } catch (err: any) {
        console.error('Create dispute error:', err);
        return NextResponse.json(
            { error: 'Failed to create dispute', details: err.message },
            { status: 500 }
        );
    }
}
