import { NextRequest, NextResponse } from 'next/server';
import { escrowAgent } from '@/lib/payments/escrow-agent';
import { requireAuth, validateRequest } from '@/lib/api-middleware';
import { z } from 'zod';

// 🔒 SECURITY: Zod schema for input validation
const holdEscrowSchema = z.object({
  buyerId: z.string().cuid('Invalid buyer ID'),
  sellerId: z.string().cuid('Invalid seller ID'),
  transporterId: z.string().cuid('Invalid transporter ID').optional(),
  amount: z.number().positive('Amount must be positive').max(100000000, 'Amount too large'),
  orderId: z.string().cuid('Invalid order ID'),
  autoReleaseDays: z.number().int().min(1).max(30).default(7),
});

export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    // 🔒 SECURITY: Validate input
    const data = await validateRequest(request, holdEscrowSchema);
    if (data instanceof NextResponse) return data;

    const {
      buyerId,
      sellerId,
      transporterId,
      amount,
      orderId,
      autoReleaseDays,
    } = data;

    // 🔒 SECURITY: Verify user is the buyer
    if (!session.user || session.user.id !== buyerId) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only create escrow for your own orders' },
        { status: 403 }
      );
    }

    // Hold payment in escrow
    const escrow = await escrowAgent.holdInEscrow({
      buyerId,
      sellerId,
      transporterId,
      amount,
      orderId,
      autoReleaseDays,
    });

    return NextResponse.json({
      success: true,
      escrow,
      message: 'Payment held in escrow successfully',
    });
  } catch (error) {
    console.error('Escrow hold error:', error);
    return NextResponse.json(
      {
        error: 'Failed to hold payment in escrow',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
