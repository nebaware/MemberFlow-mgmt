import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog, AuditActions } from '@/lib/db/audit-logger';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const txRef = searchParams.get('trx_ref');
        const status = searchParams.get('status');

        if (!txRef) {
            return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 });
        }

        // Verify payment with Chapa
        const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            },
        });

        if (!verifyResponse.ok) {
            const error = await verifyResponse.json();
            console.error('Chapa verification error:', error);
            return NextResponse.json(
                { error: 'Failed to verify payment', details: error },
                { status: 500 }
            );
        }

        const verifyData = await verifyResponse.json();
        const paymentData = verifyData.data;

        if (paymentData.status !== 'success') {
            return NextResponse.json(
                { error: 'Payment not successful', status: paymentData.status },
                { status: 400 }
            );
        }

        // Extract order ID from metadata
        const orderId = paymentData.meta?.orderId;
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID not found in payment data' }, { status: 400 });
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
            const escrow = await tx.escrowTransaction.create({
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
                },
            });

            return { order: updatedOrder, escrow, alreadyProcessed: false };
        });

        return NextResponse.json({
            success: true,
            message: result.alreadyProcessed ? 'Payment already processed' : 'Payment verified successfully',
            order: result.order,
        });
    } catch (err: any) {
        console.error('Verify payment error:', err);
        return NextResponse.json(
            { error: 'Failed to verify payment', details: err.message },
            { status: 500 }
        );
    }
}
