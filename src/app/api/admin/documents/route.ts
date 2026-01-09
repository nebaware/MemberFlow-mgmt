import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/auth-helpers';
import { dbQuery } from '@/lib/db/db';
import { securityMiddleware, withAdmin } from '@/lib/security/security-middleware';
import { createSecureResponse } from '@/lib/security/security-headers';

export async function GET(request: NextRequest) {
  // Apply admin security middleware
  const securityResult = await securityMiddleware(request, withAdmin({
    rateLimit: 'api',
    allowedMethods: ['GET']
  }));

  if (securityResult) return securityResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const documentType = searchParams.get('type');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        ud.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.verification_level,
        admin_user.name as verified_by_name
      FROM user_documents ud
      JOIN users u ON ud.user_id = u.id
      LEFT JOIN users admin_user ON ud.verified_by = admin_user.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND ud.verification_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (documentType) {
      query += ` AND ud.document_type = $${paramIndex}`;
      params.push(documentType);
      paramIndex++;
    }

    if (userId) {
      query += ` AND ud.user_id = $${paramIndex}`;
      params.push(parseInt(userId));
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT ud.*, u.name as user_name, u.email as user_email, u.role as user_role, u.verification_level, admin_user.name as verified_by_name',
      'SELECT COUNT(*)'
    );
    const totalResult = await dbQuery(countQuery, params);
    const total = parseInt(totalResult[0].count);

    // Add pagination and ordering
    query += ` ORDER BY ud.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const documents = await dbQuery(query, params);

    // Get document statistics
    const statsQuery = `
      SELECT 
        verification_status,
        COUNT(*) as count
      FROM user_documents
      GROUP BY verification_status
    `;
    const stats = await dbQuery(statsQuery);

    return createSecureResponse({
      success: true,
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: stats.reduce((acc: any, stat: any) => {
        acc[stat.verification_status] = parseInt(stat.count);
        return acc;
      }, {})
    });

  } catch (error: any) {
    console.error('Admin documents fetch error:', error);
    return createSecureResponse(
      { error: 'Failed to fetch documents', details: error.message },
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Apply admin security middleware
  const securityResult = await securityMiddleware(request, withAdmin({
    rateLimit: 'api',
    allowedMethods: ['PATCH']
  }));

  if (securityResult) return securityResult;

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { documentId, action, notes, rejectionReason } = body;

    if (!documentId || !action) {
      return createSecureResponse(
        { error: 'Document ID and action are required' },
        400
      );
    }

    const validActions = ['approve', 'reject', 'request_resubmission'];
    if (!validActions.includes(action)) {
      return createSecureResponse(
        { error: 'Invalid action. Must be approve, reject, or request_resubmission' },
        400
      );
    }

    // Get current document
    const currentDoc = await dbQuery(
      'SELECT * FROM user_documents WHERE id = $1',
      [documentId]
    );

    if (!currentDoc.length) {
      return createSecureResponse({ error: 'Document not found' }, 404);
    }

    const document = currentDoc[0];

    // Update document status
    let newStatus = 'pending';
    switch (action) {
      case 'approve':
        newStatus = 'verified';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'request_resubmission':
        newStatus = 'pending';
        break;
    }

    // Get admin name
    const adminDetails = await dbQuery('SELECT name FROM users WHERE id = $1', [user.id]);
    const adminName = adminDetails.length > 0 ? adminDetails[0].name : 'Admin';

    // Update document
    await dbQuery(
      `UPDATE user_documents SET 
        verification_status = $1,
        verified_by = $2,
        verification_notes = $3,
        rejection_reason = $4,
        updated_at = NOW()
       WHERE id = $5`,
      [
        newStatus,
        user.id,
        notes || null,
        rejectionReason || null,
        documentId
      ]
    );

    // Log the verification history
    await dbQuery(
      `INSERT INTO document_verification_history (
        document_id, previous_status, new_status, changed_by, change_reason
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        documentId,
        document.verification_status,
        newStatus,
        user.id,
        notes || `Admin ${action}`
      ]
    );

    // Update user verification level if document was approved
    if (action === 'approve') {
      const { documentVerificationService } = await import('@/lib/document-verification');
      await documentVerificationService.updateUserVerificationLevel(document.user_id);
    }

    // Create notification for user
    const notificationMessages = {
      approve: `Your ${document.document_type.replace('_', ' ')} has been approved by admin.`,
      reject: `Your ${document.document_type.replace('_', ' ')} has been rejected. ${rejectionReason || 'Please check requirements and resubmit.'}`,
      request_resubmission: `Please resubmit your ${document.document_type.replace('_', ' ')}. ${notes || 'Additional information required.'}`
    };

    // In production, send notification
    // await createNotification(document.user_id, 'document_verification', notificationMessages[action]);

    return createSecureResponse({
      success: true,
      message: `Document ${action}d successfully`,
      document: {
        id: documentId,
        status: newStatus,
        verifiedBy: adminName,
        notes: notes
      }
    });

  } catch (error: any) {
    console.error('Admin document action error:', error);
    return createSecureResponse(
      { error: 'Failed to process document action', details: error.message },
      500
    );
  }
}