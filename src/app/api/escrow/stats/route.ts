import { NextRequest, NextResponse } from 'next/server';
import { escrowAgent } from '@/lib/payments/escrow-agent';

export async function GET(request: NextRequest) {
  try {
    const stats = escrowAgent.getStatistics();
    
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Escrow stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get escrow statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
