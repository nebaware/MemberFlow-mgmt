
import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';
import { groupPurchaseManager } from '@/lib/managers/group-purchase-manager';
import { securityMiddleware, withAuth } from '@/lib/security/security-middleware';
import { createSecureResponse } from '@/lib/security/security-headers';
import { getAuthUser } from '@/lib/auth/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['GET']
  }));

  if (securityResult) return securityResult;

  try {
    // Verify authentication
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const { id } = await params;
    const groupPurchaseId = parseInt(id);

    if (isNaN(groupPurchaseId)) {
      return createSecureResponse({ error: 'Invalid group purchase ID' }, 400);
    }

    // Get group purchase details
    const groupPurchaseQuery = `
      SELECT gp.*,
  p.name as product_name,
  p.description as product_description,
  p.category as product_category,
  p.image_preview as product_image,
  p.unit as product_unit,
  p.location as product_location,
  u.name as organizer_name,
  u.email as organizer_email,
  u.verification_level as organizer_verification,
  u.profile_image as organizer_image
      FROM group_purchases gp
      JOIN products p ON gp.product_id = p.id
      JOIN users u ON gp.organizer_id = u.id
      WHERE gp.id = $1
  `;

    const groupPurchaseResult = await dbQuery(groupPurchaseQuery, [groupPurchaseId]);

    if (!groupPurchaseResult.length) {
      return createSecureResponse({ error: 'Group purchase not found' }, 404);
    }

    const groupPurchase = groupPurchaseResult[0];

    // Get participants
    const participantsQuery = `
      SELECT gpp.*,
  u.name as buyer_name,
  u.profile_image as buyer_image,
  u.verification_level as buyer_verification
      FROM group_purchase_participants gpp
      JOIN users u ON gpp.buyer_id = u.id
      WHERE gpp.group_purchase_id = $1
      ORDER BY gpp.joined_at ASC
  `;

    const participants = await dbQuery(participantsQuery, [groupPurchaseId]);

    // Get messages (last 50)
    const messagesQuery = `
      SELECT gpm.*,
  u.name as sender_name,
  u.profile_image as sender_image
      FROM group_purchase_messages gpm
      LEFT JOIN users u ON gpm.sender_id = u.id
      WHERE gpm.group_purchase_id = $1
      ORDER BY gpm.created_at DESC
      LIMIT 50
  `;

    const messages = await dbQuery(messagesQuery, [groupPurchaseId]);

    // Check if current user is a participant
    const userParticipation = participants.find((p: any) => p.buyer_id === authUser.id);

    // Get group purchase status
    const status = await groupPurchaseManager.getGroupPurchaseStatus(groupPurchaseId);

    // Calculate pricing information
    const originalPrice = groupPurchase.unit_price;
    const discountPercentage = groupPurchase.group_discount_percentage || 0;
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
    const totalSavings = (originalPrice - discountedPrice) * groupPurchase.total_committed_quantity;

    return createSecureResponse({
      success: true,
      groupPurchase: {
        ...groupPurchase,
        status: status,
        pricing: {
          originalPrice,
          discountedPrice,
          discountPercentage,
          totalSavings
        },
        userParticipation,
        isOrganizer: groupPurchase.organizer_id === authUser.id
      },
      participants: participants.map((p: any) => ({
        id: p.id,
        buyer_name: p.buyer_name,
        buyer_image: p.buyer_image,
        buyer_verification: p.buyer_verification,
        quantity: p.quantity,
        total_amount: p.total_amount,
        payment_status: p.payment_status,
        joined_at: p.joined_at,
        // Hide sensitive info for non-organizers
        ...(groupPurchase.organizer_id === authUser.id ? {
          delivery_preference: p.delivery_preference,
          notes: p.notes
        } : {})
      })),
      messages: messages.reverse().map((m: any) => ({
        id: m.id,
        sender_name: m.sender_name || 'System',
        sender_image: m.sender_image,
        content: m.content,
        message_type: m.message_type,
        is_system_message: m.is_system_message,
        created_at: m.created_at,
        is_own_message: m.sender_id === authUser.id
      }))
    });

  } catch (error: any) {
    console.error('Get group purchase details error:', error);
    return createSecureResponse(
      { error: 'Failed to fetch group purchase details', details: error.message },
      500
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['PATCH']
  }));

  if (securityResult) return securityResult;

  try {
    // Verify authentication
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const { id } = await params;
    const groupPurchaseId = parseInt(id);

    if (isNaN(groupPurchaseId)) {
      return createSecureResponse({ error: 'Invalid group purchase ID' }, 400);
    }

    const body = await request.json();
    const { action, reason } = body;

    // Verify user is the organizer
    const groupPurchase = await dbQuery(
      'SELECT organizer_id, status FROM group_purchases WHERE id = $1',
      [groupPurchaseId]
    );

    if (!groupPurchase.length) {
      return createSecureResponse({ error: 'Group purchase not found' }, 404);
    }

    if (groupPurchase[0].organizer_id !== authUser.id) {
      return createSecureResponse({ error: 'Only the organizer can modify this group purchase' }, 403);
    }

    switch (action) {
      case 'cancel':
        if (!reason) {
          return createSecureResponse({ error: 'Cancellation reason is required' }, 400);
        }

        const cancelResult = await groupPurchaseManager.cancelGroupPurchase(groupPurchaseId, reason);

        if (!cancelResult.success) {
          return createSecureResponse({ error: cancelResult.error }, 400);
        }

        return createSecureResponse({
          success: true,
          message: 'Group purchase cancelled successfully'
        });

      case 'complete':
        const completeResult = await groupPurchaseManager.completeGroupPurchase(groupPurchaseId);

        if (!completeResult.success) {
          return createSecureResponse({ error: completeResult.error }, 400);
        }

        return createSecureResponse({
          success: true,
          message: 'Group purchase completed successfully'
        });

      default:
        return createSecureResponse({ error: 'Invalid action' }, 400);
    }

  } catch (error: any) {
    console.error('Update group purchase error:', error);
    return createSecureResponse(
      { error: 'Failed to update group purchase', details: error.message },
      500
    );
  }
}