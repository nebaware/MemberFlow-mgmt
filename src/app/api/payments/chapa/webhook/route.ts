import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog, AuditActions } from '@/lib/db/audit-logger';

// Webhook endpoint for Chapa to notify us of payment status
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Verify webhook signature (if you set up webhook secret)
        const signature = request.headers.get('chapa-signature');
        if (process.env.CHAPA_WEBHOOK_SECRET && signature !== process.env.CHAPA_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const { event, data } = body;

        if (event === 'charge.success') {
            const txRef = data.tx_ref;
            const orderId = data.meta?.orderId;

            if (!orderId) {
                console.error('No order ID in webhook data');
                return NextResponse.json({ error: 'No order ID' }, { status: 400 });
            }

            // Update order status
            const result = await prisma.$transaction(async (tx) => {
                const order = await tx.order.findUnique({
                    where: { id: orderId },
                });

                if (!order) {
                    throw new Error('Order not found');
                }

                if (order.paymentStatus === 'paid') {
                    // Already processed
                    return { order, alreadyProcessed: true };
                }

                // Update order
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'confirmed',
                        paymentStatus: 'paid',
                        escrowStatus: 'held',
                    },
                });

                // Create escrow transaction
                await tx.escrowTransaction.create({
                    data: {
                        orderId: orderId,
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
                        orderId: orderId,
                    },
                });

                // Audit log
                await createAuditLog({
                    userId: order.buyerId,
                    action: AuditActions.ORDER_PAID,
                    entityType: 'Order',
                    entityId: orderId,
                    changes: {
                        paymentStatus: 'paid',
                        txRef: txRef,
                        amount: order.totalAmount,
                        source: 'webhook',
                    },
                });

                return { order: updatedOrder, alreadyProcessed: false };
            });

            return NextResponse.json({ success: true, received: true });
        }

        // Handle other events (charge.failed, etc.)
        return NextResponse.json({ success: true, received: true });
    } catch (err: any) {
        console.error('Webhook error:', err);
        return NextResponse.json(
            { error: 'Webhook processing failed', details: err.message },
            { status: 500 }
        );
    }
}
