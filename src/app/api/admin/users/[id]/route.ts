import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// PUT: Update user
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, role, phone, location } = body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                name,
                role,
                phone,
                location,
                updatedAt: new Date(),
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'user_updated',
                entityType: 'User',
                entityId: id,
                changes: JSON.stringify(body),
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (err: any) {
        console.error('Error updating user:', err);
        return NextResponse.json(
            { error: 'Failed to update user', details: err.message },
            { status: 500 }
        );
    }
}

// DELETE: Delete user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        // Prevent deleting yourself
        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'user_deleted',
                entityType: 'User',
                entityId: id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error deleting user:', err);
        return NextResponse.json(
            { error: 'Failed to delete user', details: err.message },
            { status: 500 }
        );
    }
}
