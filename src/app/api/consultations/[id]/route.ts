import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

// PATCH: Update consultation status
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden - Educator role required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !['Accepted', 'Declined', 'Completed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Note: This is a placeholder implementation
        // In a full implementation, you would update the Consultation record in the database
        return NextResponse.json({ 
            success: true, 
            message: `Consultation ${id} status updated to ${status}`,
            consultationId: id,
            status
        });
    } catch (err: any) {
        console.error('Error updating consultation:', err);
        return NextResponse.json(
            { error: 'Failed to update consultation', details: err.message },
            { status: 500 }
        );
    }
}
