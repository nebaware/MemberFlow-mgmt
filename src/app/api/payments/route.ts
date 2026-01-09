import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import { processPayment } from '@/lib/payments/payment-service';

// Process payment for various transaction types
export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { 
      userId, 
      amount, 
      paymentMethod, 
      transactionType, // 'order', 'storage', 'delivery'
      referenceId, // order_id, booking_id, etc.
      description,
      customerPhone,
      customerEmail
    } = body;

    if (!userId || !amount || !paymentMethod || !transactionType) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, amount, paymentMethod, transactionType' 
      }, { status: 400 });
    }

    // Process payment through payment gateway
    const paymentResult = await processPayment({
      amount,
      currency: 'ETB',
      paymentMethod,
      userId,
      orderId: referenceId,
      description,
      customerPhone,
      customerEmail
    });

    if (!paymentResult.success) {
      return NextResponse.json({ 
        error: paymentResult.error || paymentResult.message,
        success: false 
      }, { status: 400 });
    }

    // Determine transaction status based on method
    let transactionStatus = 'Completed';

    // For escrow payments, hold the funds
    if (paymentMethod.toLowerCase().includes('escrow')) {
      transactionStatus = 'InEscrow';
    } else if (paymentMethod.toLowerCase().includes('cash')) {
      transactionStatus = 'Pending';
    }

    // Create transaction record with payment gateway transaction ID
    const transactionResult = await dbQuery(
      `INSERT INTO transactions (user_id, order_id, type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, type, amount, description, status, created_at`,
      [
        userId,
        referenceId || null,
        paymentMethod.toLowerCase().includes('escrow') ? 'EscrowHold' : 'Payment',
        amount,
        description || `Payment via ${paymentMethod} (Gateway TxID: ${paymentResult.transactionId})`,
        transactionStatus
      ]
    );

    // Update user's escrow balance if escrow payment
    if (transactionStatus === 'InEscrow') {
      await dbQuery(
        `UPDATE users SET escrow_balance = escrow_balance + $1 WHERE id = $2`,
        [amount, userId]
      );
    }

    return NextResponse.json({
      success: true,
      transaction: transactionResult[0],
      gatewayTransactionId: paymentResult.transactionId,
      paymentUrl: paymentResult.paymentUrl,
      message: paymentResult.message
    }, { status: 201 });

  } catch (err: any) {
    console.error('Payment processing error:', err);
    return NextResponse.json({ 
      error: String(err?.message || err),
      success: false 
    }, { status: 500 });
  }
}

// Get payment/transaction history
export async function GET(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (userId) {
      params.push(userId);
      query += ` AND user_id = $${params.length}`;
    }

    if (orderId) {
      params.push(orderId);
      query += ` AND order_id = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const transactions = await dbQuery(query, params);
    return NextResponse.json(transactions);

  } catch (err: any) {
    console.error('Get transactions error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
