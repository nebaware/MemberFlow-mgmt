import { NextRequest, NextResponse } from 'next/server';
import { processPayment, PaymentDetails } from '@/lib/payments/payment-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      amount,
      currency = 'ETB',
      buyerId,
      sellerId,
      productId,
      serviceType = 'product',
      transporterId,
      paymentMethod,
    } = body;
    
    // Validate required fields
    if (!amount || !buyerId || !sellerId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Validate payment method
    const validMethods = ['telebirr', 'cbe_birr', 'bank_transfer'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }
    
    // Process payment
    const paymentDetails: PaymentDetails = {
      amount,
      currency,
      buyerId,
      sellerId,
      productId,
      serviceType,
      transporterId,
    };
    
    const transaction = await processPayment(paymentDetails, paymentMethod);
    
    return NextResponse.json({
      success: true,
      transaction,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { 
        error: 'Payment processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
