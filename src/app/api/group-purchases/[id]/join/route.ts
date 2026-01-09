
import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';
import { groupPurchaseManager } from '@/lib/managers/group-purchase-manager';
import { securityMiddleware, withAuth } from '@/lib/security/security-middleware';
import { createSecureResponse } from '@/lib/security/security-headers';
import { getAuthUser } from '@/lib/auth/auth-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['POST']
  }));

  if (securityResult) return securityResult;

  try {
    // Verify authentication
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const { id } = await params;
    const groupPurchaseId = parseInt(id);

    if (isNaN(groupPurchaseId)) {
      return createSecureResponse({ error: 'Invalid group purchase ID' }, 400);
    }

    const body = await request.json();
    const { quantity, deliveryPreference, notes } = body;

    // Validate required fields
    if (!quantity || quantity <= 0) {
      return createSecureResponse(
        { error: 'Valid quantity is required' },
        400
      );
    }

    // Get user verification level
    const userDetails = await dbQuery('SELECT verification_level FROM users WHERE id = $1', [user.id]);
    const verificationLevel = userDetails.length > 0 ? userDetails[0].verification_level : 'unverified';

    // Check if user is verified (basic verification sufficient for joining)
    if (verificationLevel === 'unverified') {
      return createSecureResponse(
        { error: 'Please complete account verification to join group purchases' },
        403
      );
    }

    // Join group purchase
    const result = await groupPurchaseManager.joinGroupPurchase({
      groupPurchaseId,
      buyerId: parseInt(user.id),
      quantity: parseFloat(quantity),
      deliveryPreference,
      notes
    });

    if (!result.success) {
      return createSecureResponse(
        { error: result.error },
        400
      );
    }

    return createSecureResponse({
      success: true,
      participantId: result.participantId,
      message: 'Successfully joined group purchase! Please complete payment within 24 hours.'
    });

  } catch (error: any) {
    console.error('Join group purchase error:', error);
    return createSecureResponse(
      { error: 'Failed to join group purchase', details: error.message },
      500
    );
  }
}