import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { dbQuery } from '@/lib/db/db';

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

        const orderRows = await dbQuery(
            `SELECT o.id, o.buyer_id, o.total_amount, o.status, o.payment_status, o.order_number, u.email, u.name as buyer_name
             FROM orders o
             JOIN users u ON o.buyer_id = u.id
             WHERE o.id = $1`,
            [parseInt(orderId, 10)]
        );

        if (orderRows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = orderRows[0];

        if (order.buyer_id.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.payment_status !== 'pending') {
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
                amount: order.total_amount,
                currency: 'ETB',
                email: order.email || 'customer@azmera.com',
                first_name: order.buyer_name?.split(' ')[0] || 'Customer',
                last_name: order.buyer_name?.split(' ').slice(1).join(' ') || '',
                tx_ref: `ORDER-${order.order_number}-${Date.now()}`,
                callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/chapa/callback`,
                return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders/${order.id}`,
                customization: {
                    title: 'Azmera Order Payment',
                    description: `Payment for order #${order.order_number}`,
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
