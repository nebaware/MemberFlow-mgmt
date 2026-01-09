import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { getPlatformRevenue } from '@/lib/payments/payment-processor';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can access revenue stats
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }
    
    const revenue = getPlatformRevenue();
    
    return NextResponse.json({
      success: true,
      revenue,
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch revenue statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
