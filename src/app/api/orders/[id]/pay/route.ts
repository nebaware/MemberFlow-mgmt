import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// POST: Simulate payment
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
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.buyerId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.paymentStatus === 'paid') {
            return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
        }

        // Transaction to update order and create escrow record
        const result = await prisma.$transaction(async (tx) => {
            // Update order
            const updatedOrder = await tx.order.update({
                where: { id },
                data: {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    escrowStatus: 'held',
                },
            });

            // Create escrow transaction
            const escrow = await tx.escrowTransaction.create({
                data: {
                    orderId: id,
                    amount: order.totalAmount,
                    status: 'held',
                },
            });

            // Notify seller
            await tx.notification.create({
                data: {
                    userId: order.sellerId,
                    type: 'order_paid',
                    title: 'New Order Received',
                    message: `You have a new order #${order.orderNumber}. Payment is held in escrow.`,
                    orderId: id,
                },
            });

            return { order: updatedOrder, escrow };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (err: any) {
        console.error('Payment error:', err);
        return NextResponse.json(
            { error: 'Payment failed', details: err.message },
            { status: 500 }
        );
    }
}
