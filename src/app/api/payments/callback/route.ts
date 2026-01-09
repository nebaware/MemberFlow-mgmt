import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import { getPaymentProvider } from '@/lib/payments/payment-providers';

/**
 * Payment callback endpoint
 * Called by payment providers (Chapa, Telebirr) after payment
 */
export async function POST(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const body = await request.json();
    console.log('Payment callback received:', body);

    // Handle Chapa callback
    if (body.tx_ref) {
      return handleChapaCallback(body);
    }

    // Handle Telebirr callback
    if (body.outTradeNo) {
      return handleTelebirrCallback(body);
    }

    return NextResponse.json({ error: 'Unknown callback format' }, { status: 400 });
  } catch (err: any) {
    console.error('Payment callback error:', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

async function handleChapaCallback(data: any) {
  const transactionRef = data.tx_ref;
  const status = data.status;

  // Extract order ID
  const orderId = transactionRef.replace('ORD-', '');

  if (status === 'success') {
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

      // Create notification for buyer
      const orderRows = await dbQuery(
        'SELECT buyer_id FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderRows.length > 0) {
        await dbQuery(
          `INSERT INTO notifications (user_id, type, title, message, read)
           VALUES ($1, 'payment', 'Payment Successful', 'Your payment for order #${orderId} was successful', false)`,
          [orderRows[0].buyer_id]
        );
      }

      await dbQuery('COMMIT');

      return NextResponse.json({ success: true, message: 'Payment processed' });
    } catch (err) {
      await dbQuery('ROLLBACK');
      throw err;
    }
  } else {
    // Payment failed
    await dbQuery(
      `UPDATE transactions 
       SET status = 'Failed',
           updated_at = NOW()
       WHERE order_id = $1 AND type = 'Payment' AND status = 'Pending'`,
      [orderId]
    );

    return NextResponse.json({ success: false, message: 'Payment failed' });
  }
}

async function handleTelebirrCallback(data: any) {
  const transactionRef = data.outTradeNo;
  const status = data.tradeStatus;

  // Extract order ID
  const orderId = transactionRef.replace('ORD-', '');

  if (status === 'TRADE_SUCCESS') {
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

      // Create notification
      const orderRows = await dbQuery(
        'SELECT buyer_id FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderRows.length > 0) {
        await dbQuery(
          `INSERT INTO notifications (user_id, type, title, message, read)
           VALUES ($1, 'payment', 'Payment Successful', 'Your payment for order #${orderId} was successful', false)`,
          [orderRows[0].buyer_id]
        );
      }

      await dbQuery('COMMIT');

      return NextResponse.json({ success: true, message: 'Payment processed' });
    } catch (err) {
      await dbQuery('ROLLBACK');
      throw err;
    }
  } else {
    // Payment failed
    await dbQuery(
      `UPDATE transactions 
       SET status = 'Failed',
           updated_at = NOW()
       WHERE order_id = $1 AND type = 'Payment' AND status = 'Pending'`,
      [orderId]
    );

    return NextResponse.json({ success: false, message: 'Payment failed' });
  }
}

// Also support GET for some providers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const txRef = searchParams.get('tx_ref');

  if (status && txRef) {
    return handleChapaCallback({ status, tx_ref: txRef });
  }

  return NextResponse.json({ message: 'Payment callback endpoint' });
}
