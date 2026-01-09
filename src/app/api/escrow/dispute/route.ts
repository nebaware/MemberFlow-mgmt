import { NextRequest, NextResponse } from 'next/server';
import { escrowAgent } from '@/lib/payments/escrow-agent';

// Raise a dispute
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, raisedBy, reason } = body;
    
    if (!transactionId || !raisedBy || !reason) {
      return NextResponse.json(
        { error: 'Transaction ID, raisedBy, and reason are required' },
        { status: 400 }
      );
    }
    
    const dispute = await escrowAgent.raiseDispute({
      transactionId,
      raisedBy,
      reason,
    });
    
    return NextResponse.json({
      success: true,
      dispute,
      message: 'Dispute raised successfully',
    });
  } catch (error) {
    console.error('Dispute creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to raise dispute',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Resolve a dispute
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { disputeId, resolution, partialAmount } = body;
    
    if (!disputeId || !resolution) {
      return NextResponse.json(
        { error: 'Dispute ID and resolution are required' },
        { status: 400 }
      );
    }
    
    const validResolutions = ['refund_buyer', 'release_seller', 'partial_refund'];
    if (!validResolutions.includes(resolution)) {
      return NextResponse.json(
        { error: 'Invalid resolution type' },
        { status: 400 }
      );
    }
    
    await escrowAgent.resolveDispute(disputeId, resolution, partialAmount);
    
    return NextResponse.json({
      success: true,
      message: 'Dispute resolved successfully',
    });
  } catch (error) {
    console.error('Dispute resolution error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to resolve dispute',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
