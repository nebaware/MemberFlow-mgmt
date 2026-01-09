
import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';
import { groupPurchaseManager } from '@/lib/managers/group-purchase-manager';
import { securityMiddleware, withAuth } from '@/lib/security/security-middleware';
import { createSecureResponse } from '@/lib/security/security-headers';
import { getAuthUser } from '@/lib/auth/auth-helpers';

export async function GET(request: NextRequest) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['GET']
  }));

  if (securityResult) return securityResult;

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'available'; // 'available', 'my_groups', 'my_organized'
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = '';
    let params: any[] = [];
    let paramIndex = 1;

    switch (type) {
      case 'available':
        // Find available group purchases for the user
        const filters = {
          category: category || undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          location: location || undefined
        };

        const availableGroups = await groupPurchaseManager.findMatchingGroupPurchases(
          parseInt(user.id),
          filters
        );

        return createSecureResponse({
          success: true,
          groupPurchases: availableGroups,
          pagination: {
            page,
            limit,
            total: availableGroups.length,
            totalPages: Math.ceil(availableGroups.length / limit)
          }
        });

      case 'my_groups':
        // Groups the user has joined
        query = `
          SELECT gp.*, p.name as product_name, p.category, p.image_preview,
  u.name as organizer_name,
  gpp.quantity as my_quantity,
  gpp.total_amount as my_amount,
  gpp.payment_status as my_payment_status,
  gpp.joined_at,
  (gp.target_participants - gp.current_participants) as remaining_slots,
  (gp.total_quantity - gp.total_committed_quantity) as remaining_quantity
          FROM group_purchases gp
          JOIN group_purchase_participants gpp ON gp.id = gpp.group_purchase_id
          JOIN products p ON gp.product_id = p.id
          JOIN users u ON gp.organizer_id = u.id
          WHERE gpp.buyer_id = $${paramIndex}
`;
        params.push(parseInt(user.id));
        paramIndex++;
        break;

      case 'my_organized':
        // Groups organized by the user
        query = `
          SELECT gp.*, p.name as product_name, p.category, p.image_preview,
  (gp.target_participants - gp.current_participants) as remaining_slots,
  (gp.total_quantity - gp.total_committed_quantity) as remaining_quantity,
  COUNT(gpp.id) as participant_count,
  SUM(gpp.total_amount) as total_revenue
          FROM group_purchases gp
          JOIN products p ON gp.product_id = p.id
          LEFT JOIN group_purchase_participants gpp ON gp.id = gpp.group_purchase_id
          WHERE gp.organizer_id = $${paramIndex}
          GROUP BY gp.id, p.name, p.category, p.image_preview
  `;
        params.push(parseInt(user.id));
        paramIndex++;
        break;

      default:
        return createSecureResponse({ error: 'Invalid type parameter' }, 400);
    }

    // Add status filter if provided
    if (status) {
      query += ` AND gp.status = $${paramIndex} `;
      params.push(status);
      paramIndex++;
    }

    // Add category filter if provided
    if (category) {
      query += ` AND p.category = $${paramIndex} `;
      params.push(category);
      paramIndex++;
    }

    // Get total count for pagination
    const countQuery = query.replace(
      /SELECT .* FROM/,
      'SELECT COUNT(DISTINCT gp.id) FROM'
    ).replace(/GROUP BY.*$/, '');

    const totalResult = await dbQuery(countQuery, params);
    const total = parseInt(totalResult[0].count);

    // Add pagination and ordering
    query += ` ORDER BY gp.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1} `;
    params.push(limit, offset);

    const groupPurchases = await dbQuery(query, params);

    return createSecureResponse({
      success: true,
      groupPurchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get group purchases error:', error);
    return createSecureResponse(
      { error: 'Failed to fetch group purchases', details: error.message },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['POST']
  }));

  if (securityResult) return securityResult;

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Check if user is verified
    const verificationDetails = await dbQuery('SELECT verification_level FROM users WHERE id = $1', [user.id]);
    const verificationLevel = verificationDetails.length > 0 ? verificationDetails[0].verification_level : 'unverified';

    if (verificationLevel !== 'verified') {
      return createSecureResponse(
        { error: 'Only verified users can organize group purchases' },
        403
      );
    }

    const body = await request.json();
    const {
      productId,
      title,
      description,
      totalQuantity,
      minQuantityPerBuyer,
      maxQuantityPerBuyer,
      unitPrice,
      targetParticipants,
      deadline,
      deliveryLocation,
      deliveryInstructions,
      groupDiscountPercentage
    } = body;

    // Validate required fields
    if (!productId || !title || !totalQuantity || !minQuantityPerBuyer || !unitPrice || !targetParticipants || !deadline) {
      return createSecureResponse(
        { error: 'Missing required fields' },
        400
      );
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return createSecureResponse(
        { error: 'Deadline must be in the future' },
        400
      );
    }

    // Validate quantities
    if (minQuantityPerBuyer <= 0 || totalQuantity <= 0 || targetParticipants <= 0) {
      return createSecureResponse(
        { error: 'Quantities and participant count must be positive' },
        400
      );
    }

    if (maxQuantityPerBuyer && maxQuantityPerBuyer < minQuantityPerBuyer) {
      return createSecureResponse(
        { error: 'Maximum quantity cannot be less than minimum quantity' },
        400
      );
    }

    // Validate that total quantity can be achieved with target participants
    const maxPossibleQuantity = targetParticipants * (maxQuantityPerBuyer || totalQuantity);
    if (totalQuantity > maxPossibleQuantity) {
      return createSecureResponse(
        { error: 'Total quantity cannot be achieved with the given participant limits' },
        400
      );
    }

    // Create group purchase
    const result = await groupPurchaseManager.createGroupPurchase({
      productId: parseInt(productId),
      organizerId: parseInt(user.id),
      title,
      description,
      totalQuantity: parseFloat(totalQuantity),
      minQuantityPerBuyer: parseFloat(minQuantityPerBuyer),
      maxQuantityPerBuyer: maxQuantityPerBuyer ? parseFloat(maxQuantityPerBuyer) : undefined,
      unitPrice: parseFloat(unitPrice),
      targetParticipants: parseInt(targetParticipants),
      deadline: deadlineDate,
      deliveryLocation,
      deliveryInstructions,
      groupDiscountPercentage: groupDiscountPercentage ? parseFloat(groupDiscountPercentage) : undefined
    });

    if (!result.success) {
      return createSecureResponse(
        { error: result.error },
        400
      );
    }

    return createSecureResponse({
      success: true,
      groupPurchaseId: result.groupPurchaseId,
      message: 'Group purchase created successfully'
    }, 201);

  } catch (error: any) {
    console.error('Create group purchase error:', error);
    return createSecureResponse(
      { error: 'Failed to create group purchase', details: error.message },
      500
    );
  }
}