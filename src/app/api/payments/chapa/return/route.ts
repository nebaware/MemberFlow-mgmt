import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// This endpoint handles the return from Chapa checkout
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const txRef = searchParams.get('trx_ref');
        const status = searchParams.get('status');

        if (!txRef) {
            return NextResponse.redirect(new URL('/orders?payment=failed', request.url));
        }

        if (status === 'success') {
            // Verify the payment
            const verifyResponse = await fetch(
                `${process.env.NEXTAUTH_URL}/api/payments/chapa/callback?trx_ref=${txRef}&status=${status}`
            );

            if (verifyResponse.ok) {
                const data = await verifyResponse.json();
                const orderId = data.order?.id;

                if (orderId) {
                    return NextResponse.redirect(
                        new URL(`/orders/${orderId}?payment=success`, request.url)
                    );
                }
            }
        }

        return NextResponse.redirect(new URL('/orders?payment=failed', request.url));
    } catch (err: any) {
        console.error('Return handler error:', err);
        return NextResponse.redirect(new URL('/orders?payment=error', request.url));
    }
}
