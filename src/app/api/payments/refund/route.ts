import { NextRequest, NextResponse } from 'next/server';
import { processRefund } from '@/lib/payments/payment-processor';

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
    
    await processRefund(transactionId);
    
    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process refund',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
