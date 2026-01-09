import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import { verifyPayment } from '@/lib/payments/payment-service';
import crypto from 'crypto';

/**
 * Webhook endpoint for payment gateway callbacks
 * Handles payment confirmations from Telebirr, CBE Birr, etc.
 * 🔒 SECURED: Webhook signature verification added
 */
export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const {
      transactionId,
      gatewayTransactionId,
      status,
      paymentMethod,
      amount,
      signature // For webhook verification
    } = body;

    // 🔒 SECURITY: Verify webhook signature
    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CHAPA_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Verify payment with gateway
    const isVerified = await verifyPayment(gatewayTransactionId, paymentMethod);

    if (!isVerified) {
      return NextResponse.json({
        error: 'Payment verification failed',
        success: false
      }, { status: 400 });
    }

    // 🔒 SECURITY: Use database transaction for atomic updates
    const result = await dbQuery('BEGIN');

    try {
      // Update transaction status in database
      const updateResult = await dbQuery(
        `UPDATE transactions 
         SET status = $1, description = description || ' - Verified via webhook'
         WHERE id = $2
         RETURNING *`,
        [status === 'success' ? 'Completed' : 'Failed', transactionId]
      );

      if (updateResult.length === 0) {
        await dbQuery('ROLLBACK');
        return NextResponse.json({
          error: 'Transaction not found',
          success: false
        }, { status: 404 });
      }

      // If payment was in escrow and now completed, release funds
      if (status === 'success' && updateResult[0].type === 'EscrowHold') {
        await dbQuery(
          `UPDATE transactions SET type = 'EscrowRelease' WHERE id = $1`,
          [transactionId]
        );
      }

      // Create notification for user
      await dbQuery(
        `INSERT INTO notifications (user_id, type, title, message, icon_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          updateResult[0].user_id,
          'SystemMessage',
          status === 'success' ? 'Payment Confirmed' : 'Payment Failed',
          status === 'success'
            ? `Your payment of ${amount} Birr has been confirmed.`
            : `Your payment of ${amount} Birr has failed. Please try again.`,
          status === 'success' ? 'CheckCircle' : 'XCircle'
        ]
      );

      await dbQuery('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully',
        transaction: updateResult[0]
      });
    } catch (txError) {
      await dbQuery('ROLLBACK');
      throw txError;
    }

  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({
      error: 'Webhook processing failed',
      success: false
    }, { status: 500 });
  }
}
