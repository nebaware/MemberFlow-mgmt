import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// POST: Confirm delivery and release funds (Buyer only)
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

        const order = await prisma.order.findUnique({
            where: { id },
            include: { escrowTransaction: true },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.buyerId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.deliveryStatus === 'delivered') {
            return NextResponse.json({ error: 'Order already delivered' }, { status: 400 });
        }

        // Transaction to update order, release escrow, and credit wallet
        const result = await prisma.$transaction(async (tx) => {
            // Update order
            const updatedOrder = await tx.order.update({
                where: { id },
                data: {
                    deliveryStatus: 'delivered',
                    status: 'delivered',
                    paymentStatus: 'released',
                    escrowStatus: 'released',
                },
            });

            // Update escrow transaction
            if (order.escrowTransaction) {
                await tx.escrowTransaction.update({
                    where: { id: order.escrowTransaction.id },
                    data: {
                        status: 'released',
                        releasedAt: new Date(),
                    },
                });
            }

            // Credit seller wallet
            const sellerWallet = await tx.wallet.upsert({
                where: { userId: order.sellerId },
                create: {
                    userId: order.sellerId,
                    balance: order.totalAmount,
                    totalEarnings: order.totalAmount,
                },
                update: {
                    balance: { increment: order.totalAmount },
                    totalEarnings: { increment: order.totalAmount },
                },
            });

            // Create wallet transaction
            await tx.walletTransaction.create({
                data: {
                    walletId: sellerWallet.id,
                    type: 'credit',
                    amount: order.totalAmount,
                    orderId: id,
                    description: `Payment received for order #${order.orderNumber}`,
                },
            });

            // Create notifications
            await tx.notification.createMany({
                data: [
                    {
                        userId: order.sellerId,
                        type: 'order_delivered',
                        title: 'Payment Released',
                        message: `${order.totalAmount.toFixed(2)} Birr has been added to your wallet for order #${order.orderNumber}`,
                        orderId: id,
                    },
                    {
                        userId: order.buyerId,
                        type: 'order_delivered',
                        title: 'Order Delivered',
                        message: `Thank you for confirming delivery of order #${order.orderNumber}`,
                        orderId: id,
                    },
                ],
            });

            return updatedOrder;
        });

        return NextResponse.json({ success: true, order: result });
    } catch (err: any) {
        console.error('Confirm delivery error:', err);
        return NextResponse.json(
            { error: 'Failed to confirm delivery', details: err.message },
            { status: 500 }
        );
    }
}
