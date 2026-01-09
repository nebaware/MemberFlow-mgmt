import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db-sqlite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, resolutionNotes } = body;

        if (!status || !['Resolved', 'Rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Update dispute
        const result = await dbQuery(
            `UPDATE disputes 
       SET status = $1, resolution_notes = $2, resolved_at = datetime('now'), resolved_by = $3
       WHERE id = $4
       RETURNING *`,
            [status, resolutionNotes, session.user.id, id]
        );

        if (!result || result.length === 0) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error('Failed to resolve dispute:', error);
        return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 });
    }
}
