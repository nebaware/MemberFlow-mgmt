import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

// GET: Fetch all pending role requests
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role?.toLowerCase() !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Note: Using raw SQL to match the existing admin table implementation
        // Column names are mapped in prisma.schema
        const requests = await dbQuery(
            `SELECT 
                r.id, 
                u.email, 
                u.name, 
                u.role, 
                r.requested_role as "requestedRole", 
                r.status, 
                r.created_at as "createdAt",
                u.license_number as "licenseNumber",
                r.documents
             FROM "RoleChangeRequest" r
             JOIN "User" u ON r.user_id = u.id
             WHERE r.status = 'pending'
             ORDER BY r.created_at DESC`
        );

        return NextResponse.json(requests);
    } catch (error: any) {
        console.error('Fetch role requests error:', error);
        return NextResponse.json({ error: 'Failed to fetch role requests' }, { status: 500 });
    }
}

// POST: Approve or Reject a request
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role?.toLowerCase() !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { requestId, action, rejectionReason } = body;

        if (!requestId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Fetch request details
        const requestData = await dbQuery(
            'SELECT user_id, requested_role FROM "RoleChangeRequest" WHERE id = $1',
            [requestId]
        );

        if (!requestData.length) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const { user_id: userId, requested_role: newRole } = requestData[0];

        if (action === 'approve') {
            // Approve: Update role, set status to approved, verify license
            await dbQuery(
                `UPDATE "User" 
                 SET role = $1,
                     license_verified = true,
                     verification_status = 'verified',
                     license_verification_date = NOW(),
                     verified_by_admin_id = $2
                 WHERE id = $3`,
                [newRole, session.user.id, userId]
            );

            await dbQuery(
                `UPDATE "RoleChangeRequest" SET status = 'approved' WHERE id = $1`,
                [requestId]
            );
        } else {
            // Reject: Set status to rejected
            await dbQuery(
                `UPDATE "RoleChangeRequest" 
                 SET status = 'rejected',
                     admin_notes = $1
                 WHERE id = $2`,
                [rejectionReason || 'No reason provided', requestId]
            );

            await dbQuery(
                `UPDATE "User" SET verification_status = 'rejected' WHERE id = $1`,
                [userId]
            );
        }

        return NextResponse.json({ success: true, message: `Request ${action}ed successfully` });

    } catch (error: any) {
        console.error('Process role request error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
