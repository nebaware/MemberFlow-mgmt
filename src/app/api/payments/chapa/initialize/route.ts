import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                buyer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.buyerId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.paymentStatus !== 'pending') {
            return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
        }

        // Initialize Chapa payment
        const chapaResponse = await fetch('https://api.chapa.co/v1/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: order.totalAmount,
                currency: 'ETB',
                email: order.buyer.email,
                first_name: order.buyer.name?.split(' ')[0] || 'Customer',
                last_name: order.buyer.name?.split(' ').slice(1).join(' ') || '',
                tx_ref: `ORDER-${order.orderNumber}-${Date.now()}`,
                callback_url: `${process.env.NEXTAUTH_URL}/api/payments/chapa/callback`,
                return_url: `${process.env.NEXTAUTH_URL}/orders/${order.id}`,
                customization: {
                    title: 'Azmera Order Payment',
                    description: `Payment for order #${order.orderNumber}`,
                },
                meta: {
                    orderId: order.id,
                    userId: session.user.id,
                },
            }),
        });

        if (!chapaResponse.ok) {
            const error = await chapaResponse.json();
            console.error('Chapa initialization error:', error);
            return NextResponse.json(
                { error: 'Failed to initialize payment', details: error },
                { status: 500 }
            );
        }

        const chapaData = await chapaResponse.json();

        // Store transaction reference in order
        await prisma.order.update({
            where: { id: orderId },
            data: {
                // Store tx_ref in a custom field or use existing field
                orderNumber: order.orderNumber, // Keep original
            },
        });

        return NextResponse.json({
            success: true,
            checkoutUrl: chapaData.data.checkout_url,
            txRef: chapaData.data.tx_ref,
        });
    } catch (err: any) {
        console.error('Initialize payment error:', err);
        return NextResponse.json(
            { error: 'Failed to initialize payment', details: err.message },
            { status: 500 }
        );
    }
}
