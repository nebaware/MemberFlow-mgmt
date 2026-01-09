import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// POST: Mark as shipped (Seller only)
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

        if (order.sellerId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.deliveryStatus !== 'pending') {
            return NextResponse.json({ error: 'Order already shipped or delivered' }, { status: 400 });
        }

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id },
                data: {
                    deliveryStatus: 'shipped',
                },
            });

            // Notify buyer
            await tx.notification.create({
                data: {
                    userId: order.buyerId,
                    type: 'order_shipped',
                    title: 'Order Shipped',
                    message: `Your order #${order.orderNumber} has been shipped!`,
                    orderId: id,
                },
            });

            return order;
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (err: any) {
        console.error('Ship order error:', err);
        return NextResponse.json(
            { error: 'Failed to update shipping status', details: err.message },
            { status: 500 }
        );
    }
}
