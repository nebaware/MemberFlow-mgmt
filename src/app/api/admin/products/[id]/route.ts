import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

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

        await prisma.product.delete({
            where: { id },
        });

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'product_deleted',
                entityType: 'Product',
                entityId: id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error deleting product:', err);
        return NextResponse.json(
            { error: 'Failed to delete product', details: err.message },
            { status: 500 }
        );
    }
}
