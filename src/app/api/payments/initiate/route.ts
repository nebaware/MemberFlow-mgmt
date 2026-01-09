import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/auth-helpers';
import { getPaymentProvider, calculatePaymentBreakdown } from '@/lib/payments/payment-providers';
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
    const {
      orderId,
      paymentMethod,
      amount,
      deliveryFee = 0,
      email,
      firstName,
      lastName,
      phoneNumber,
    } = body;

    console.log('💳 Payment Request:', { orderId, paymentMethod, amount, deliveryFee });

    if (!orderId || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, paymentMethod, amount' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const orderRows = await dbQuery(
      'SELECT id, buyer_id, total_amount, status FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderRows[0];

    if (order.buyer_id.toString() !== authUser.id) {
      return NextResponse.json({ error: 'Unauthorized: Not your order' }, { status: 403 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: `Order already ${order.status}` },
        { status: 400 }
      );
    }

    // Calculate payment breakdown
    const breakdown = calculatePaymentBreakdown(amount, deliveryFee);

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      // Check wallet balance
      const userRows = await dbQuery(
        'SELECT wallet_balance FROM users WHERE id = $1',
        [authUser.id]
      );

      if (userRows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const walletBalance = parseFloat(userRows[0].wallet_balance);

      if (walletBalance < breakdown.totalAmount) {
        return NextResponse.json(
          { error: 'Insufficient wallet balance' },
          { status: 400 }
        );
      }

      // Deduct from wallet and update order
      await dbQuery('BEGIN');

      try {
        console.log('💰 Processing wallet payment:', { orderId, amount: breakdown.totalAmount });

        // Deduct from buyer wallet
        await dbQuery(
          'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2',
          [breakdown.totalAmount, authUser.id]
        );
        console.log('✅ Wallet deducted');

        // Update order status
        console.log('📝 Updating order with status=paid, payment_status=in_escrow');
        await dbQuery(
          `UPDATE orders 
           SET payment_status = 'in_escrow', 
               status = 'paid',
               payment_method = 'Wallet',
               platform_fee = $1,
               net_amount = $2,
               updated_at = NOW()
           WHERE id = $3`,
          [breakdown.platformFee, breakdown.sellerAmount, orderId]
        );
        console.log('✅ Order updated');

        // Create transaction record
        console.log('📝 Creating transaction record');
        await dbQuery(
          `INSERT INTO transactions (user_id, order_id, type, amount, description, status, payment_method)
           VALUES ($1, $2, 'Payment', $3, 'Order payment via wallet', 'Completed', 'Wallet')`,
          [authUser.id, orderId, breakdown.totalAmount]
        );
        console.log('✅ Transaction created');

        await dbQuery('COMMIT');
        console.log('✅ Transaction committed');

        return NextResponse.json({
          success: true,
          paymentMethod: 'wallet',
          transactionRef: `WALLET-${orderId}`,
          breakdown,
        });
      } catch (err) {
        await dbQuery('ROLLBACK');
        throw err;
      }
    }

    // Handle external payment providers (Chapa, Telebirr)
    console.log('🔌 Getting payment provider for:', paymentMethod);
    const provider = getPaymentProvider(paymentMethod as PaymentProvider);
    console.log('✅ Provider created:', provider.constructor.name);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const paymentRequest = {
      amount: breakdown.totalAmount,
      currency: 'ETB',
      email: email || `user${authUser.id}@azmera.com`,
      firstName: firstName || 'Azmera',
      lastName: lastName || 'User',
      phoneNumber: phoneNumber || '',
      orderId: `ORD-${orderId}`,
      returnUrl: `${baseUrl}/payment/success?orderId=${orderId}`,
      callbackUrl: `${baseUrl}/api/payments/callback`,
      description: `Order #${orderId} - Azmera AgriTech`,
    };

    const result = await provider.initiatePayment(paymentRequest);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment initiation failed' },
        { status: 400 }
      );
    }

    // Update order with payment info
    await dbQuery(
      `UPDATE orders 
       SET payment_method = $1,
           platform_fee = $2,
           net_amount = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [paymentMethod, breakdown.platformFee, breakdown.sellerAmount, orderId]
    );

    // Create pending transaction
    await dbQuery(
      `INSERT INTO transactions (user_id, order_id, type, amount, description, status, payment_method)
       VALUES ($1, $2, 'Payment', $3, $4, 'Pending', $5)`,
      [
        authUser.id,
        orderId,
        breakdown.totalAmount,
        `Order payment via ${paymentMethod}`,
        paymentMethod,
      ]
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      transactionRef: result.transactionRef,
      paymentMethod,
      breakdown,
    });
  } catch (err: any) {
    console.error('Payment initiation error:', err);

    // Better error message formatting
    let errorMessage = 'Payment initiation failed';
    if (err?.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err?.error) {
      errorMessage = err.error;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
