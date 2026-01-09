import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { OrderDetailsClient } from '@/components/orders/order-details-client';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return notFound();
    }

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            buyer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            seller: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            escrowTransaction: true,
            dispute: true,
        },
    });

    if (!order) {
        return notFound();
    }

    // Check if user has access to this order
    const isAuthorized = order.buyerId === session.user.id ||
        order.sellerId === session.user.id ||
        session.user.role?.toLowerCase() === 'admin';

    if (!isAuthorized) {
        return notFound();
    }

    return <OrderDetailsClient order={order} currentUserId={session.user.id} />;
}
