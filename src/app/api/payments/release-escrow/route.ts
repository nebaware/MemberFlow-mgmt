import { NextRequest, NextResponse } from 'next/server';
import { releaseEscrowPayment } from '@/lib/payments/payment-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    await releaseEscrowPayment(transactionId);
    
    return NextResponse.json({
      success: true,
      message: 'Payment released from escrow successfully',
    });
  } catch (error) {
    console.error('Escrow release error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to release escrow payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
