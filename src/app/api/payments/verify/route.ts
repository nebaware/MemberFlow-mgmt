import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/auth-helpers';
import { getPaymentProvider } from '@/lib/payments/payment-providers';
import type { PaymentProvider } from '@/lib/payments/payment-providers';

export async function POST(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transactionRef, paymentMethod } = body;

    if (!transactionRef || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: transactionRef, paymentMethod' },
        { status: 400 }
      );
    }

    // Extract order ID from transaction ref
    const orderId = transactionRef.replace('ORD-', '');

    // Verify order belongs to user
    const orderRows = await dbQuery(
      'SELECT id, buyer_id, total_amount, payment_status FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderRows[0];

    if (order.buyer_id.toString() !== authUser.id) {
      return NextResponse.json({ error: 'Unauthorized: Not your order' }, { status: 403 });
    }

    // Verify payment with provider
    const provider = getPaymentProvider(paymentMethod as PaymentProvider);
    const verification = await provider.verifyPayment(transactionRef);

    if (!verification.success || verification.status !== 'success') {
      return NextResponse.json({
        success: false,
        status: verification.status,
        error: verification.error || 'Payment verification failed',
      });
    }

    // Update order and transaction status
    await dbQuery('BEGIN');

    try {
      // Update order status
      await dbQuery(
        `UPDATE orders 
         SET payment_status = 'in_escrow',
             status = 'confirmed',
             updated_at = NOW()
         WHERE id = $1`,
        [orderId]
      );

      // Update transaction status
      await dbQuery(
        `UPDATE transactions 
         SET status = 'Completed',
             updated_at = NOW()
         WHERE order_id = $1 AND type = 'Payment' AND status = 'Pending'`,
        [orderId]
      );

      await dbQuery('COMMIT');

      return NextResponse.json({
        success: true,
        status: 'success',
        orderId,
        amount: verification.amount,
        currency: verification.currency,
      });
    } catch (err) {
      await dbQuery('ROLLBACK');
      throw err;
    }
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
