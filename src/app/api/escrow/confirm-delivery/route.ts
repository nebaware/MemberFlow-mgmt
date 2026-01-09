import { NextRequest, NextResponse } from 'next/server';
import { escrowAgent } from '@/lib/payments/escrow-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { escrowId, confirmedBy } = body;
    
    if (!escrowId || !confirmedBy) {
      return NextResponse.json(
        { error: 'Escrow ID and confirmedBy are required' },
        { status: 400 }
      );
    }
    
    const result = await escrowAgent.confirmDelivery(escrowId, confirmedBy);
    
    return NextResponse.json({
      success: true,
      confirmed: result,
      message: 'Delivery confirmed successfully',
    });
  } catch (error) {
    console.error('Delivery confirmation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to confirm delivery',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
