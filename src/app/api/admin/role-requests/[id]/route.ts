import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// POST: Approve or Reject request
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role?.toLowerCase() !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, adminNotes } = body;

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const roleRequest = await prisma.roleChangeRequest.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!roleRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (roleRequest.status !== 'pending') {
            return NextResponse.json({ error: 'Request is already processed' }, { status: 400 });
        }

        // Transaction to update request and user role if approved
        const result = await prisma.$transaction(async (tx) => {
            // Update request
            const updatedRequest = await tx.roleChangeRequest.update({
                where: { id },
                data: {
                    status,
                    adminNotes,
                },
            });

            // If approved, update user role
            if (status === 'approved') {
                await tx.user.update({
                    where: { id: roleRequest.userId },
                    data: {
                        role: roleRequest.requestedRole,
                        licenseVerified: true, // Assuming role change implies verification
                        verificationStatus: 'verified',
                        verifiedByAdminId: session.user.id,
                        licenseVerificationDate: new Date(),
                    },
                });
            }

            return updatedRequest;
        });

        return NextResponse.json({ success: true, request: result });
    } catch (err: any) {
        console.error('Process role request error:', err);
        return NextResponse.json(
            { error: 'Failed to process request', details: err.message },
            { status: 500 }
        );
    }
}
