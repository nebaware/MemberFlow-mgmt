import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db-sqlite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { newRole, licenseNumber, licenseDocument } = body;

        if (!newRole) {
            return NextResponse.json({ error: 'New role is required' }, { status: 400 });
        }

        const validRoles = ['farmer', 'buyer', 'transporter', 'educator', 'tool_seller', 'storage_provider', 'admin'];
        if (!validRoles.includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Update user with requested role and pending status
        const result = await dbQuery(
            `UPDATE users 
       SET requested_role = $1, 
           role_request_status = 'pending', 
           role_request_date = datetime('now'),
           verification_status = 'pending',
           license_number = $2,
           verification_documents = $3
       WHERE id = $4
       RETURNING id, email, name, role, requested_role, role_request_status`,
            [newRole, licenseNumber || null, licenseDocument || null, session.user.id]
        );

        if (!result || result.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Role request submitted successfully',
            user: result[0]
        });

    } catch (error: any) {
        console.error('Role request error:', error);
        return NextResponse.json({ error: 'Failed to submit role request' }, { status: 500 });
    }
}
