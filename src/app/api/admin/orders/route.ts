import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const orders = await prisma.order.findMany({
            include: {
                buyer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                seller: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ orders });
    } catch (err: any) {
        console.error('Error fetching orders:', err);
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: err.message },
            { status: 500 }
        );
    }
}
